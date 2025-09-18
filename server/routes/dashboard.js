/**
 * Dashboard Routes for MoMech
 * Provides endpoints for dashboard statistics and data
 */

const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const dbConnection = require('../database/connection');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Get dashboard statistics
 * GET /api/v1/dashboard/stats
 */
router.get('/stats', asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().slice(0, 7);
  
  // Get today's appointments
  const todayAppointments = await dbConnection.get(`
    SELECT COUNT(*) as count
    FROM appointments 
    WHERE appointment_date = ? AND status != 'cancelled'
  `, [today]);

  // Get monthly revenue
  const monthlyRevenue = await dbConnection.get(`
    SELECT COALESCE(SUM(total_amount), 0) as revenue
    FROM invoices 
    WHERE strftime('%Y-%m', invoice_date) = ? AND status = 'paid'
  `, [thisMonth]);

  // Get active clients count
  const activeClients = await dbConnection.get(`
    SELECT COUNT(*) as count
    FROM clients 
    WHERE is_active = 1
  `);

  // Get low inventory items
  const lowInventory = await dbConnection.get(`
    SELECT COUNT(*) as count
    FROM inventory_items 
    WHERE quantity_on_hand <= minimum_quantity AND is_active = 1
  `);

  // Get next appointment
  const nextAppointment = await dbConnection.get(`
    SELECT 
      a.appointment_time,
      s.name as service_name,
      c.first_name || ' ' || c.last_name as client_name
    FROM appointments a
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN clients c ON a.client_id = c.id
    WHERE a.appointment_date = ? AND a.status = 'scheduled'
    ORDER BY a.appointment_time ASC
    LIMIT 1
  `, [today]);

  // Calculate revenue growth
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthStr = lastMonth.toISOString().slice(0, 7);
  
  const lastMonthRevenue = await dbConnection.get(`
    SELECT COALESCE(SUM(total_amount), 0) as revenue
    FROM invoices 
    WHERE strftime('%Y-%m', invoice_date) = ? AND status = 'paid'
  `, [lastMonthStr]);

  const revenueGrowth = lastMonthRevenue.revenue > 0 
    ? ((monthlyRevenue.revenue - lastMonthRevenue.revenue) / lastMonthRevenue.revenue * 100).toFixed(1)
    : 0;

  res.json({
    todayAppointments: todayAppointments.count,
    monthlyRevenue: monthlyRevenue.revenue,
    revenueGrowth: parseFloat(revenueGrowth),
    activeClients: activeClients.count,
    lowInventoryItems: lowInventory.count,
    nextAppointment: nextAppointment ? {
      time: nextAppointment.appointment_time,
      service: nextAppointment.service_name || 'General Service',
      client: nextAppointment.client_name
    } : null
  });
}));

/**
 * Get recent activity
 * GET /api/v1/dashboard/recent-activity
 */
router.get('/recent-activity', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  
  const activities = await dbConnection.all(`
    SELECT 
      'appointment' as type,
      a.id,
      c.first_name || ' ' || c.last_name as client_name,
      v.make || ' ' || v.model as vehicle,
      s.name as service_name,
      a.created_at,
      a.status
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    LEFT JOIN services s ON a.service_id = s.id
    WHERE a.created_at >= datetime('now', '-7 days')
    
    UNION ALL
    
    SELECT 
      'work_order' as type,
      w.id,
      c.first_name || ' ' || c.last_name as client_name,
      v.make || ' ' || v.model as vehicle,
      w.description as service_name,
      w.created_at,
      w.status
    FROM work_orders w
    LEFT JOIN clients c ON w.client_id = c.id
    LEFT JOIN vehicles v ON w.vehicle_id = v.id
    WHERE w.created_at >= datetime('now', '-7 days')
    
    UNION ALL
    
    SELECT 
      'invoice' as type,
      i.id,
      c.first_name || ' ' || c.last_name as client_name,
      'Invoice #' || i.invoice_number as vehicle,
      '$' || i.total_amount as service_name,
      i.created_at,
      i.status
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    WHERE i.created_at >= datetime('now', '-7 days')
    
    ORDER BY created_at DESC
    LIMIT ?
  `, [limit]);

  res.json(activities);
}));

/**
 * Get upcoming appointments
 * GET /api/v1/dashboard/upcoming-appointments
 */
router.get('/upcoming-appointments', asyncHandler(async (req, res) => {
  const limit = parseInt(req.query.limit) || 5;
  const days = parseInt(req.query.days) || 7;
  
  const appointments = await dbConnection.all(`
    SELECT 
      a.id,
      a.appointment_date,
      a.appointment_time,
      a.status,
      c.first_name || ' ' || c.last_name as client_name,
      c.phone as client_phone,
      v.make || ' ' || v.model || ' (' || v.year || ')' as vehicle,
      s.name as service_name,
      u.first_name || ' ' || u.last_name as assigned_mechanic
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN users u ON a.assigned_to = u.id
    WHERE a.appointment_date BETWEEN date('now') AND date('now', '+${days} days')
      AND a.status IN ('scheduled', 'confirmed')
    ORDER BY a.appointment_date ASC, a.appointment_time ASC
    LIMIT ?
  `, [limit]);

  res.json(appointments);
}));

/**
 * Get revenue chart data
 * GET /api/v1/dashboard/revenue-chart
 */
router.get('/revenue-chart', asyncHandler(async (req, res) => {
  const period = req.query.period || 'month'; // 'week', 'month', 'year'
  
  let dateFormat, dateRange, groupBy;
  
  switch (period) {
    case 'week':
      dateFormat = '%Y-%m-%d';
      dateRange = "date('now', '-7 days')";
      groupBy = "strftime('%Y-%m-%d', invoice_date)";
      break;
    case 'year':
      dateFormat = '%Y-%m';
      dateRange = "date('now', '-12 months')";
      groupBy = "strftime('%Y-%m', invoice_date)";
      break;
    default: // month
      dateFormat = '%Y-%m-%d';
      dateRange = "date('now', '-30 days')";
      groupBy = "strftime('%Y-%m-%d', invoice_date)";
  }

  const revenueData = await dbConnection.all(`
    SELECT 
      ${groupBy} as date,
      COALESCE(SUM(total_amount), 0) as revenue,
      COUNT(*) as invoice_count
    FROM invoices 
    WHERE invoice_date >= ${dateRange} 
      AND status = 'paid'
    GROUP BY ${groupBy}
    ORDER BY date ASC
  `);

  res.json({
    period,
    data: revenueData
  });
}));

/**
 * Get system alerts
 * GET /api/v1/dashboard/alerts
 */
router.get('/alerts', asyncHandler(async (req, res) => {
  const alerts = [];

  // Check for overdue invoices
  const overdueInvoices = await dbConnection.get(`
    SELECT COUNT(*) as count
    FROM invoices 
    WHERE due_date < date('now') AND status != 'paid'
  `);
  
  if (overdueInvoices.count > 0) {
    alerts.push({
      type: 'warning',
      title: 'Overdue Invoices',
      message: `You have ${overdueInvoices.count} overdue invoice(s)`,
      action: '/financial/invoices?filter=overdue',
      priority: 'high'
    });
  }

  // Check for low inventory
  const lowInventoryItems = await dbConnection.all(`
    SELECT name, quantity_on_hand, minimum_quantity
    FROM inventory_items 
    WHERE quantity_on_hand <= minimum_quantity AND is_active = 1
    LIMIT 3
  `);
  
  if (lowInventoryItems.length > 0) {
    alerts.push({
      type: 'warning',
      title: 'Low Inventory',
      message: `${lowInventoryItems.length} item(s) are running low`,
      items: lowInventoryItems,
      action: '/inventory?filter=low-stock',
      priority: 'medium'
    });
  }

  // Check for appointments without assigned mechanics
  const unassignedAppointments = await dbConnection.get(`
    SELECT COUNT(*) as count
    FROM appointments 
    WHERE appointment_date >= date('now') 
      AND assigned_to IS NULL 
      AND status = 'scheduled'
  `);
  
  if (unassignedAppointments.count > 0) {
    alerts.push({
      type: 'info',
      title: 'Unassigned Appointments',
      message: `${unassignedAppointments.count} appointment(s) need mechanic assignment`,
      action: '/appointments?filter=unassigned',
      priority: 'medium'
    });
  }

  // Check for vehicles due for service
  const vehiclesDueForService = await dbConnection.get(`
    SELECT COUNT(*) as count
    FROM vehicle_service_history vsh
    INNER JOIN vehicles v ON vsh.vehicle_id = v.id
    WHERE vsh.next_service_date <= date('now', '+30 days')
      AND v.is_active = 1
  `);
  
  if (vehiclesDueForService.count > 0) {
    alerts.push({
      type: 'info',
      title: 'Service Reminders',
      message: `${vehiclesDueForService.count} vehicle(s) are due for service`,
      action: '/vehicles?filter=service-due',
      priority: 'low'
    });
  }

  res.json(alerts);
}));

/**
 * Get performance metrics
 * GET /api/v1/dashboard/metrics
 */
router.get('/metrics', asyncHandler(async (req, res) => {
  const period = req.query.period || 'month';
  
  let dateRange;
  switch (period) {
    case 'week':
      dateRange = "datetime('now', '-7 days')";
      break;
    case 'year':
      dateRange = "datetime('now', '-12 months')";
      break;
    default: // month
      dateRange = "datetime('now', '-30 days')";
  }

  // Average work order completion time
  const avgCompletionTime = await dbConnection.get(`
    SELECT AVG(
      CASE 
        WHEN completed_at IS NOT NULL AND started_at IS NOT NULL 
        THEN (julianday(completed_at) - julianday(started_at)) * 24
        ELSE NULL 
      END
    ) as avg_hours
    FROM work_orders 
    WHERE created_at >= ${dateRange} AND status = 'completed'
  `);

  // Customer satisfaction (based on repeat customers)
  const repeatCustomers = await dbConnection.get(`
    SELECT 
      COUNT(DISTINCT client_id) as total_customers,
      COUNT(DISTINCT CASE WHEN appointment_count > 1 THEN client_id END) as repeat_customers
    FROM (
      SELECT 
        client_id,
        COUNT(*) as appointment_count
      FROM appointments 
      WHERE created_at >= ${dateRange}
      GROUP BY client_id
    ) customer_stats
  `);

  const customerRetentionRate = repeatCustomers.total_customers > 0 
    ? (repeatCustomers.repeat_customers / repeatCustomers.total_customers * 100).toFixed(1)
    : 0;

  // Revenue per customer
  const revenuePerCustomer = await dbConnection.get(`
    SELECT 
      COALESCE(SUM(i.total_amount), 0) / COUNT(DISTINCT i.client_id) as avg_revenue
    FROM invoices i
    WHERE i.created_at >= ${dateRange} AND i.status = 'paid'
  `);

  // Work order efficiency
  const workOrderStats = await dbConnection.get(`
    SELECT 
      COUNT(*) as total_orders,
      COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
      AVG(total_cost) as avg_order_value
    FROM work_orders 
    WHERE created_at >= ${dateRange}
  `);

  const completionRate = workOrderStats.total_orders > 0 
    ? (workOrderStats.completed_orders / workOrderStats.total_orders * 100).toFixed(1)
    : 0;

  res.json({
    period,
    metrics: {
      avgCompletionTime: parseFloat((avgCompletionTime.avg_hours || 0).toFixed(1)),
      customerRetentionRate: parseFloat(customerRetentionRate),
      revenuePerCustomer: parseFloat((revenuePerCustomer.avg_revenue || 0).toFixed(2)),
      workOrderCompletionRate: parseFloat(completionRate),
      avgOrderValue: parseFloat((workOrderStats.avg_order_value || 0).toFixed(2))
    }
  });
}));

module.exports = router;
