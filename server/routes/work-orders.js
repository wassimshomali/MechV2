/**
 * Work Orders Routes for MoMech
 * Handles work order management and tracking
 */

const express = require('express');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const dbConnection = require('../database/connection');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Validate work order input
 */
function validateWorkOrderInput(data, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate && !data.clientId) {
    errors.push({ field: 'clientId', message: 'Client ID is required' });
  }
  
  if (!isUpdate && !data.vehicleId) {
    errors.push({ field: 'vehicleId', message: 'Vehicle ID is required' });
  }
  
  if (!isUpdate && !data.description) {
    errors.push({ field: 'description', message: 'Work order description is required' });
  }
  
  if (data.totalLaborHours && data.totalLaborHours < 0) {
    errors.push({ field: 'totalLaborHours', message: 'Labor hours cannot be negative' });
  }
  
  if (data.totalPartsCost && data.totalPartsCost < 0) {
    errors.push({ field: 'totalPartsCost', message: 'Parts cost cannot be negative' });
  }
  
  if (data.totalLaborCost && data.totalLaborCost < 0) {
    errors.push({ field: 'totalLaborCost', message: 'Labor cost cannot be negative' });
  }
  
  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

/**
 * Generate next work order number
 */
async function generateWorkOrderNumber() {
  const year = new Date().getFullYear();
  const result = await dbConnection.get(`
    SELECT COUNT(*) as count 
    FROM work_orders 
    WHERE strftime('%Y', created_at) = ?
  `, [year.toString()]);
  
  const nextNumber = (result.count + 1).toString().padStart(3, '0');
  return `WO-${year}-${nextNumber}`;
}

/**
 * Get all work orders
 * GET /api/v1/work-orders
 */
router.get('/', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    search = '', 
    status,
    clientId,
    vehicleId,
    assignedTo,
    priority,
    dateFrom,
    dateTo,
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = req.query;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const searchTerm = `%${search}%`;
  
  // Build WHERE clause
  let whereClause = 'WHERE 1=1';
  const params = [];
  
  if (status) {
    whereClause += ' AND w.status = ?';
    params.push(status);
  }
  
  if (clientId) {
    whereClause += ' AND w.client_id = ?';
    params.push(clientId);
  }
  
  if (vehicleId) {
    whereClause += ' AND w.vehicle_id = ?';
    params.push(vehicleId);
  }
  
  if (assignedTo) {
    whereClause += ' AND w.assigned_to = ?';
    params.push(assignedTo);
  }
  
  if (priority) {
    whereClause += ' AND w.priority = ?';
    params.push(priority);
  }
  
  if (dateFrom) {
    whereClause += ' AND date(w.created_at) >= ?';
    params.push(dateFrom);
  }
  
  if (dateTo) {
    whereClause += ' AND date(w.created_at) <= ?';
    params.push(dateTo);
  }
  
  if (search) {
    whereClause += ' AND (w.work_order_number LIKE ? OR w.description LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ? OR v.make LIKE ? OR v.model LIKE ?)';
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  // Validate sort parameters
  const validSortFields = ['work_order_number', 'created_at', 'status', 'priority', 'total_cost', 'client_name'];
  const validSortOrders = ['ASC', 'DESC'];
  
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
  const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
  
  // Get total count
  const totalResult = await dbConnection.get(`
    SELECT COUNT(*) as total 
    FROM work_orders w
    LEFT JOIN clients c ON w.client_id = c.id
    LEFT JOIN vehicles v ON w.vehicle_id = v.id
    ${whereClause}
  `, params);
  
  // Get work orders
  const workOrders = await dbConnection.all(`
    SELECT 
      w.*,
      c.first_name || ' ' || c.last_name as client_name,
      c.phone as client_phone,
      v.make || ' ' || v.model || ' (' || v.year || ')' as vehicle_info,
      v.license_plate,
      u.first_name || ' ' || u.last_name as assigned_mechanic,
      a.appointment_date,
      a.appointment_time
    FROM work_orders w
    LEFT JOIN clients c ON w.client_id = c.id
    LEFT JOIN vehicles v ON w.vehicle_id = v.id
    LEFT JOIN users u ON w.assigned_to = u.id
    LEFT JOIN appointments a ON w.appointment_id = a.id
    ${whereClause}
    ORDER BY ${sortField === 'client_name' ? 'c.first_name' : 'w.' + sortField} ${sortDirection}
    LIMIT ? OFFSET ?
  `, [...params, parseInt(limit), offset]);
  
  res.json({
    workOrders,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalResult.total,
      totalPages: Math.ceil(totalResult.total / parseInt(limit))
    }
  });
}));

/**
 * Get work order by ID
 * GET /api/v1/work-orders/:id
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const workOrder = await dbConnection.get(`
    SELECT 
      w.*,
      c.first_name || ' ' || c.last_name as client_name,
      c.phone as client_phone,
      c.email as client_email,
      c.address as client_address,
      v.make || ' ' || v.model || ' (' || v.year || ')' as vehicle_info,
      v.license_plate,
      v.vin,
      v.mileage as vehicle_mileage,
      u.first_name || ' ' || u.last_name as assigned_mechanic,
      a.appointment_date,
      a.appointment_time
    FROM work_orders w
    LEFT JOIN clients c ON w.client_id = c.id
    LEFT JOIN vehicles v ON w.vehicle_id = v.id
    LEFT JOIN users u ON w.assigned_to = u.id
    LEFT JOIN appointments a ON w.appointment_id = a.id
    WHERE w.id = ?
  `, [id]);
  
  if (!workOrder) {
    throw new NotFoundError('Work order not found');
  }
  
  // Get work order items
  const items = await dbConnection.all(`
    SELECT 
      woi.*,
      ii.name as item_name,
      ii.part_number,
      ii.barcode
    FROM work_order_items woi
    LEFT JOIN inventory_items ii ON woi.item_id = ii.id
    WHERE woi.work_order_id = ?
    ORDER BY woi.id
  `, [id]);
  
  // Get related invoice
  const invoice = await dbConnection.get(`
    SELECT id, invoice_number, status, total_amount
    FROM invoices 
    WHERE work_order_id = ?
  `, [id]);
  
  res.json({
    ...workOrder,
    items,
    invoice
  });
}));

/**
 * Create new work order
 * POST /api/v1/work-orders
 */
router.post('/', asyncHandler(async (req, res) => {
  const workOrderData = req.body;
  
  // Validate input
  validateWorkOrderInput(workOrderData);
  
  // Check if client exists
  const client = await dbConnection.get('SELECT id FROM clients WHERE id = ?', [workOrderData.clientId]);
  if (!client) {
    throw new ValidationError('Client not found', [
      { field: 'clientId', message: 'Client does not exist' }
    ]);
  }
  
  // Check if vehicle exists and belongs to client
  const vehicle = await dbConnection.get('SELECT id FROM vehicles WHERE id = ? AND client_id = ?', [workOrderData.vehicleId, workOrderData.clientId]);
  if (!vehicle) {
    throw new ValidationError('Vehicle not found or does not belong to client', [
      { field: 'vehicleId', message: 'Vehicle does not exist or does not belong to the specified client' }
    ]);
  }
  
  // Check if appointment exists (if provided)
  if (workOrderData.appointmentId) {
    const appointment = await dbConnection.get('SELECT id FROM appointments WHERE id = ?', [workOrderData.appointmentId]);
    if (!appointment) {
      throw new ValidationError('Appointment not found', [
        { field: 'appointmentId', message: 'Appointment does not exist' }
      ]);
    }
  }
  
  // Check if mechanic exists
  if (workOrderData.assignedTo) {
    const mechanic = await dbConnection.get('SELECT id FROM users WHERE id = ? AND role IN ("mechanic", "manager", "owner")', [workOrderData.assignedTo]);
    if (!mechanic) {
      throw new ValidationError('Mechanic not found', [
        { field: 'assignedTo', message: 'Assigned mechanic does not exist' }
      ]);
    }
  }
  
  // Generate work order number
  const workOrderNumber = await generateWorkOrderNumber();
  
  // Insert work order
  const result = await dbConnection.run(`
    INSERT INTO work_orders (
      appointment_id, client_id, vehicle_id, work_order_number, status, priority,
      description, diagnosis, work_performed, recommendations, total_labor_hours,
      total_parts_cost, total_labor_cost, total_cost, assigned_to
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    workOrderData.appointmentId || null,
    workOrderData.clientId,
    workOrderData.vehicleId,
    workOrderNumber,
    workOrderData.status || 'open',
    workOrderData.priority || 'normal',
    workOrderData.description,
    workOrderData.diagnosis || null,
    workOrderData.workPerformed || null,
    workOrderData.recommendations || null,
    workOrderData.totalLaborHours || 0,
    workOrderData.totalPartsCost || 0,
    workOrderData.totalLaborCost || 0,
    workOrderData.totalCost || 0,
    workOrderData.assignedTo || null
  ]);
  
  // Get created work order with details
  const newWorkOrder = await dbConnection.get(`
    SELECT 
      w.*,
      c.first_name || ' ' || c.last_name as client_name,
      v.make || ' ' || v.model || ' (' || v.year || ')' as vehicle_info,
      u.first_name || ' ' || u.last_name as assigned_mechanic
    FROM work_orders w
    LEFT JOIN clients c ON w.client_id = c.id
    LEFT JOIN vehicles v ON w.vehicle_id = v.id
    LEFT JOIN users u ON w.assigned_to = u.id
    WHERE w.id = ?
  `, [result.lastID]);
  
  logger.business('work_order_created', {
    workOrderId: newWorkOrder.id,
    workOrderNumber: newWorkOrder.work_order_number,
    clientId: workOrderData.clientId,
    vehicleId: workOrderData.vehicleId
  });
  
  res.status(201).json(newWorkOrder);
}));

/**
 * Update work order
 * PUT /api/v1/work-orders/:id
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const workOrderData = req.body;
  
  // Validate input
  validateWorkOrderInput(workOrderData, true);
  
  // Check if work order exists
  const existingWorkOrder = await dbConnection.get('SELECT * FROM work_orders WHERE id = ?', [id]);
  if (!existingWorkOrder) {
    throw new NotFoundError('Work order not found');
  }
  
  // Update work order
  await dbConnection.run(`
    UPDATE work_orders SET
      status = COALESCE(?, status),
      priority = COALESCE(?, priority),
      description = COALESCE(?, description),
      diagnosis = COALESCE(?, diagnosis),
      work_performed = COALESCE(?, work_performed),
      recommendations = COALESCE(?, recommendations),
      total_labor_hours = COALESCE(?, total_labor_hours),
      total_parts_cost = COALESCE(?, total_parts_cost),
      total_labor_cost = COALESCE(?, total_labor_cost),
      total_cost = COALESCE(?, total_cost),
      assigned_to = COALESCE(?, assigned_to),
      started_at = COALESCE(?, started_at),
      completed_at = COALESCE(?, completed_at)
    WHERE id = ?
  `, [
    workOrderData.status,
    workOrderData.priority,
    workOrderData.description,
    workOrderData.diagnosis,
    workOrderData.workPerformed,
    workOrderData.recommendations,
    workOrderData.totalLaborHours,
    workOrderData.totalPartsCost,
    workOrderData.totalLaborCost,
    workOrderData.totalCost,
    workOrderData.assignedTo,
    workOrderData.startedAt,
    workOrderData.completedAt,
    id
  ]);
  
  // Update started_at when status changes to in_progress
  if (workOrderData.status === 'in_progress' && !existingWorkOrder.started_at) {
    await dbConnection.run(
      'UPDATE work_orders SET started_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  }
  
  // Update completed_at when status changes to completed
  if (workOrderData.status === 'completed' && !existingWorkOrder.completed_at) {
    await dbConnection.run(
      'UPDATE work_orders SET completed_at = CURRENT_TIMESTAMP WHERE id = ?',
      [id]
    );
  }
  
  // Get updated work order
  const updatedWorkOrder = await dbConnection.get(`
    SELECT 
      w.*,
      c.first_name || ' ' || c.last_name as client_name,
      v.make || ' ' || v.model || ' (' || v.year || ')' as vehicle_info,
      u.first_name || ' ' || u.last_name as assigned_mechanic
    FROM work_orders w
    LEFT JOIN clients c ON w.client_id = c.id
    LEFT JOIN vehicles v ON w.vehicle_id = v.id
    LEFT JOIN users u ON w.assigned_to = u.id
    WHERE w.id = ?
  `, [id]);
  
  logger.business('work_order_updated', {
    workOrderId: id,
    workOrderNumber: updatedWorkOrder.work_order_number,
    status: updatedWorkOrder.status
  });
  
  res.json(updatedWorkOrder);
}));

/**
 * Delete work order
 * DELETE /api/v1/work-orders/:id
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if work order exists
  const workOrder = await dbConnection.get('SELECT * FROM work_orders WHERE id = ?', [id]);
  if (!workOrder) {
    throw new NotFoundError('Work order not found');
  }
  
  // Check if work order has associated invoice
  const invoice = await dbConnection.get('SELECT id FROM invoices WHERE work_order_id = ?', [id]);
  if (invoice) {
    throw new ValidationError('Cannot delete work order with invoice', [
      { field: 'invoice', message: 'Work order has an associated invoice and cannot be deleted' }
    ]);
  }
  
  // Delete work order and items
  await dbConnection.transaction([
    {
      sql: 'DELETE FROM work_order_items WHERE work_order_id = ?',
      params: [id]
    },
    {
      sql: 'DELETE FROM work_orders WHERE id = ?',
      params: [id]
    }
  ]);
  
  logger.business('work_order_deleted', {
    workOrderId: id,
    workOrderNumber: workOrder.work_order_number
  });
  
  res.json({ message: 'Work order deleted successfully' });
}));

/**
 * Add items to work order
 * POST /api/v1/work-orders/:id/items
 */
router.post('/:id/items', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { items } = req.body;
  
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw new ValidationError('Items are required', [
      { field: 'items', message: 'At least one item is required' }
    ]);
  }
  
  // Check if work order exists
  const workOrder = await dbConnection.get('SELECT * FROM work_orders WHERE id = ?', [id]);
  if (!workOrder) {
    throw new NotFoundError('Work order not found');
  }
  
  // Begin transaction
  await dbConnection.run('BEGIN TRANSACTION');
  
  try {
    let totalPartsCost = 0;
    let totalLaborCost = 0;
    
    for (const item of items) {
      if (!item.description || !item.quantity || !item.unitPrice) {
        throw new ValidationError('Invalid item data', [
          { field: 'items', message: 'Each item must have description, quantity, and unit price' }
        ]);
      }
      
      const totalPrice = item.quantity * item.unitPrice;
      
      // Insert work order item
      await dbConnection.run(`
        INSERT INTO work_order_items (work_order_id, item_id, description, quantity, unit_price, total_price, item_type)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [
        id,
        item.itemId || null,
        item.description,
        item.quantity,
        item.unitPrice,
        totalPrice,
        item.itemType || 'part'
      ]);
      
      // Update inventory if item_id is provided
      if (item.itemId && item.itemType === 'part') {
        const inventoryItem = await dbConnection.get('SELECT * FROM inventory_items WHERE id = ?', [item.itemId]);
        if (inventoryItem) {
          if (inventoryItem.quantity_on_hand < item.quantity) {
            throw new ValidationError('Insufficient inventory', [
              { field: 'quantity', message: `Insufficient stock for ${item.description}` }
            ]);
          }
          
          // Update inventory quantity
          await dbConnection.run(
            'UPDATE inventory_items SET quantity_on_hand = quantity_on_hand - ? WHERE id = ?',
            [item.quantity, item.itemId]
          );
          
          // Record inventory movement
          await dbConnection.run(`
            INSERT INTO inventory_movements (item_id, movement_type, quantity, unit_cost, reference_type, reference_id, notes, created_by)
            VALUES (?, 'out', ?, ?, 'work_order', ?, ?, ?)
          `, [
            item.itemId,
            -item.quantity,
            item.unitPrice,
            id,
            `Used in work order ${workOrder.work_order_number}`,
            1 // Assuming user ID 1 for now
          ]);
        }
      }
      
      // Accumulate costs
      if (item.itemType === 'part') {
        totalPartsCost += totalPrice;
      } else if (item.itemType === 'labor') {
        totalLaborCost += totalPrice;
      }
    }
    
    // Update work order totals
    const newTotalCost = workOrder.total_cost + totalPartsCost + totalLaborCost;
    await dbConnection.run(`
      UPDATE work_orders SET 
        total_parts_cost = total_parts_cost + ?,
        total_labor_cost = total_labor_cost + ?,
        total_cost = ?
      WHERE id = ?
    `, [totalPartsCost, totalLaborCost, newTotalCost, id]);
    
    await dbConnection.run('COMMIT');
    
    // Get updated work order with items
    const updatedWorkOrder = await dbConnection.get(`
      SELECT 
        w.*,
        c.first_name || ' ' || c.last_name as client_name,
        v.make || ' ' || v.model || ' (' || v.year || ')' as vehicle_info
      FROM work_orders w
      LEFT JOIN clients c ON w.client_id = c.id
      LEFT JOIN vehicles v ON w.vehicle_id = v.id
      WHERE w.id = ?
    `, [id]);
    
    const workOrderItems = await dbConnection.all(`
      SELECT 
        woi.*,
        ii.name as item_name
      FROM work_order_items woi
      LEFT JOIN inventory_items ii ON woi.item_id = ii.id
      WHERE woi.work_order_id = ?
      ORDER BY woi.id
    `, [id]);
    
    logger.business('work_order_items_added', {
      workOrderId: id,
      itemCount: items.length,
      totalValue: totalPartsCost + totalLaborCost
    });
    
    res.json({
      ...updatedWorkOrder,
      items: workOrderItems
    });
    
  } catch (error) {
    await dbConnection.run('ROLLBACK');
    throw error;
  }
}));

/**
 * Update work order status
 * PUT /api/v1/work-orders/:id/status
 */
router.put('/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  if (!status) {
    throw new ValidationError('Status is required', [
      { field: 'status', message: 'Status is required' }
    ]);
  }
  
  const validStatuses = ['open', 'in_progress', 'completed', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new ValidationError('Invalid status', [
      { field: 'status', message: 'Invalid work order status' }
    ]);
  }
  
  // Check if work order exists
  const workOrder = await dbConnection.get('SELECT * FROM work_orders WHERE id = ?', [id]);
  if (!workOrder) {
    throw new NotFoundError('Work order not found');
  }
  
  // Prepare update data
  const updateData = [status, id];
  let updateSql = 'UPDATE work_orders SET status = ?';
  
  // Set timestamps based on status
  if (status === 'in_progress' && !workOrder.started_at) {
    updateSql += ', started_at = CURRENT_TIMESTAMP';
  } else if (status === 'completed' && !workOrder.completed_at) {
    updateSql += ', completed_at = CURRENT_TIMESTAMP';
  }
  
  updateSql += ' WHERE id = ?';
  
  // Update status
  await dbConnection.run(updateSql, updateData);
  
  // Add notes if provided
  if (notes) {
    await dbConnection.run(
      'UPDATE work_orders SET recommendations = COALESCE(recommendations || ? || ?, ?) WHERE id = ?',
      ['\n\n', notes, notes, id]
    );
  }
  
  // Get updated work order
  const updatedWorkOrder = await dbConnection.get(`
    SELECT 
      w.*,
      c.first_name || ' ' || c.last_name as client_name,
      v.make || ' ' || v.model || ' (' || v.year || ')' as vehicle_info
    FROM work_orders w
    LEFT JOIN clients c ON w.client_id = c.id
    LEFT JOIN vehicles v ON w.vehicle_id = v.id
    WHERE w.id = ?
  `, [id]);
  
  logger.business('work_order_status_updated', {
    workOrderId: id,
    workOrderNumber: workOrder.work_order_number,
    oldStatus: workOrder.status,
    newStatus: status
  });
  
  res.json(updatedWorkOrder);
}));

module.exports = router;