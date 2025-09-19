/**
 * Work Order Routes for MoMech
 * Handles work order management operations
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
  
  if (!data.services || !Array.isArray(data.services) || data.services.length === 0) {
    errors.push({ field: 'services', message: 'At least one service is required' });
  }
  
  // Validate status
  const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push({ field: 'status', message: 'Invalid work order status' });
  }
  
  // Validate priority
  const validPriorities = ['low', 'normal', 'high', 'urgent'];
  if (data.priority && !validPriorities.includes(data.priority)) {
    errors.push({ field: 'priority', message: 'Invalid priority level' });
  }
  
  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

/**
 * Generate work order number
 */
async function generateWorkOrderNumber() {
  const year = new Date().getFullYear();
  const prefix = `WO-${year}-`;
  
  const lastWorkOrder = await dbConnection.get(`
    SELECT work_order_number FROM work_orders 
    WHERE work_order_number LIKE ? 
    ORDER BY work_order_number DESC 
    LIMIT 1
  `, [`${prefix}%`]);
  
  let nextNumber = 1;
  if (lastWorkOrder) {
    const lastNumber = parseInt(lastWorkOrder.work_order_number.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
}

/**
 * Get all work orders
 * GET /api/v1/work-orders
 */
router.get('/', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    status,
    priority,
    clientId,
    vehicleId,
    assignedTo,
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = req.query;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  // Build WHERE clause
  let whereClause = '';
  const params = [];
  
  if (status) {
    whereClause += 'WHERE wo.status = ?';
    params.push(status);
  }
  
  if (priority) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'wo.priority = ?';
    params.push(priority);
  }
  
  if (clientId) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'wo.client_id = ?';
    params.push(clientId);
  }
  
  if (vehicleId) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'wo.vehicle_id = ?';
    params.push(vehicleId);
  }
  
  if (assignedTo) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'wo.assigned_to = ?';
    params.push(assignedTo);
  }
  
  // Validate sort parameters
  const validSortFields = ['work_order_number', 'status', 'priority', 'estimated_completion', 'created_at'];
  const validSortOrders = ['ASC', 'DESC'];
  
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
  const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
  
  // Get total count
  const totalResult = await dbConnection.get(`
    SELECT COUNT(*) as total FROM work_orders wo ${whereClause}
  `, params);
  
  // Get work orders
  const workOrders = await dbConnection.all(`
    SELECT 
      wo.*,
      c.first_name || ' ' || c.last_name as client_name,
      c.phone as client_phone,
      v.year || ' ' || v.make || ' ' || v.model as vehicle_display,
      v.license_plate,
      u.first_name || ' ' || u.last_name as assigned_mechanic
    FROM work_orders wo
    LEFT JOIN clients c ON wo.client_id = c.id
    LEFT JOIN vehicles v ON wo.vehicle_id = v.id
    LEFT JOIN users u ON wo.assigned_to = u.id
    ${whereClause}
    ORDER BY wo.${sortField} ${sortDirection}
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
      wo.*,
      c.first_name || ' ' || c.last_name as client_name,
      c.email as client_email,
      c.phone as client_phone,
      c.address as client_address,
      v.year || ' ' || v.make || ' ' || v.model as vehicle_display,
      v.license_plate,
      v.vin,
      v.mileage,
      u.first_name || ' ' || u.last_name as assigned_mechanic
    FROM work_orders wo
    LEFT JOIN clients c ON wo.client_id = c.id
    LEFT JOIN vehicles v ON wo.vehicle_id = v.id
    LEFT JOIN users u ON wo.assigned_to = u.id
    WHERE wo.id = ?
  `, [id]);
  
  if (!workOrder) {
    throw new NotFoundError('Work order not found');
  }
  
  // Get work order services
  const services = await dbConnection.all(`
    SELECT 
      wos.*,
      s.name as service_name,
      s.description as service_description,
      s.category as service_category
    FROM work_order_services wos
    LEFT JOIN services s ON wos.service_id = s.id
    WHERE wos.work_order_id = ?
    ORDER BY wos.sequence_number
  `, [id]);
  
  // Get work order parts
  const parts = await dbConnection.all(`
    SELECT 
      wop.*,
      i.name as part_name,
      i.sku as part_sku
    FROM work_order_parts wop
    LEFT JOIN inventory i ON wop.inventory_id = i.id
    WHERE wop.work_order_id = ?
  `, [id]);
  
  res.json({
    ...workOrder,
    services,
    parts
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
    throw new ValidationError('Invalid client', [
      { field: 'clientId', message: 'Client not found' }
    ]);
  }
  
  // Check if vehicle exists and belongs to client
  const vehicle = await dbConnection.get(
    'SELECT id FROM vehicles WHERE id = ? AND client_id = ?', 
    [workOrderData.vehicleId, workOrderData.clientId]
  );
  if (!vehicle) {
    throw new ValidationError('Invalid vehicle', [
      { field: 'vehicleId', message: 'Vehicle not found or does not belong to client' }
    ]);
  }
  
  // Generate work order number
  const workOrderNumber = await generateWorkOrderNumber();
  
  // Calculate estimated completion date
  const totalDuration = workOrderData.services.reduce((sum, service) => sum + (service.estimatedDuration || 60), 0);
  const estimatedCompletion = new Date();
  estimatedCompletion.setDate(estimatedCompletion.getDate() + Math.ceil(totalDuration / (8 * 60))); // Assuming 8-hour work days
  
  // Insert work order
  const result = await dbConnection.run(`
    INSERT INTO work_orders (
      work_order_number, client_id, vehicle_id, appointment_id, status, priority,
      description, estimated_completion, assigned_to, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    workOrderNumber,
    workOrderData.clientId,
    workOrderData.vehicleId,
    workOrderData.appointmentId || null,
    workOrderData.status || 'pending',
    workOrderData.priority || 'normal',
    workOrderData.description || null,
    estimatedCompletion.toISOString().split('T')[0],
    workOrderData.assignedTo || null,
    workOrderData.notes || null
  ]);
  
  // Insert work order services
  const servicePromises = workOrderData.services.map((service, index) => {
    return dbConnection.run(`
      INSERT INTO work_order_services (
        work_order_id, service_id, sequence_number, description, estimated_duration,
        labor_cost, status, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      result.lastID,
      service.serviceId || null,
      index + 1,
      service.description,
      service.estimatedDuration || 60,
      service.laborCost || 0,
      'pending',
      service.notes || null
    ]);
  });
  
  await Promise.all(servicePromises);
  
  // Insert work order parts if provided
  if (workOrderData.parts && workOrderData.parts.length > 0) {
    const partPromises = workOrderData.parts.map(part => {
      return dbConnection.run(`
        INSERT INTO work_order_parts (
          work_order_id, inventory_id, quantity_needed, quantity_used, unit_cost, notes
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        result.lastID,
        part.inventoryId,
        part.quantityNeeded,
        0, // Initially no parts used
        part.unitCost || 0,
        part.notes || null
      ]);
    });
    
    await Promise.all(partPromises);
  }
  
  // Get created work order
  const newWorkOrder = await dbConnection.get(
    'SELECT * FROM work_orders WHERE id = ?',
    [result.lastID]
  );
  
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
      estimated_completion = COALESCE(?, estimated_completion),
      actual_completion = COALESCE(?, actual_completion),
      assigned_to = COALESCE(?, assigned_to),
      notes = COALESCE(?, notes)
    WHERE id = ?
  `, [
    workOrderData.status,
    workOrderData.priority,
    workOrderData.description,
    workOrderData.estimatedCompletion,
    workOrderData.actualCompletion,
    workOrderData.assignedTo,
    workOrderData.notes,
    id
  ]);
  
  // Get updated work order
  const updatedWorkOrder = await dbConnection.get('SELECT * FROM work_orders WHERE id = ?', [id]);
  
  logger.business('work_order_updated', {
    workOrderId: id,
    workOrderNumber: updatedWorkOrder.work_order_number,
    status: updatedWorkOrder.status
  });
  
  res.json(updatedWorkOrder);
}));

/**
 * Update work order status
 * PATCH /api/v1/work-orders/:id/status
 */
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // Validate status
  const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'];
  if (!status || !validStatuses.includes(status)) {
    throw new ValidationError('Invalid status', [
      { field: 'status', message: 'Status must be one of: ' + validStatuses.join(', ') }
    ]);
  }
  
  // Check if work order exists
  const workOrder = await dbConnection.get('SELECT * FROM work_orders WHERE id = ?', [id]);
  if (!workOrder) {
    throw new NotFoundError('Work order not found');
  }
  
  // Update status
  const updates = { status };
  
  // If marking as completed, set actual completion date
  if (status === 'completed') {
    updates.actual_completion = new Date().toISOString().split('T')[0];
  }
  
  await dbConnection.run(`
    UPDATE work_orders SET 
      status = ?, 
      actual_completion = COALESCE(?, actual_completion)
    WHERE id = ?
  `, [status, updates.actual_completion, id]);
  
  // Get updated work order
  const updatedWorkOrder = await dbConnection.get('SELECT * FROM work_orders WHERE id = ?', [id]);
  
  logger.business('work_order_status_updated', {
    workOrderId: id,
    workOrderNumber: workOrder.work_order_number,
    oldStatus: workOrder.status,
    newStatus: status
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
  
  // Check if work order can be deleted
  if (workOrder.status === 'in_progress') {
    throw new ValidationError('Cannot delete work order in progress', [
      { field: 'status', message: 'Work order is currently in progress' }
    ]);
  }
  
  // Delete work order and related records
  await dbConnection.transaction([
    {
      sql: 'DELETE FROM work_order_parts WHERE work_order_id = ?',
      params: [id]
    },
    {
      sql: 'DELETE FROM work_order_services WHERE work_order_id = ?',
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
 * Get work order services
 * GET /api/v1/work-orders/:id/services
 */
router.get('/:id/services', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if work order exists
  const workOrder = await dbConnection.get('SELECT id FROM work_orders WHERE id = ?', [id]);
  if (!workOrder) {
    throw new NotFoundError('Work order not found');
  }
  
  const services = await dbConnection.all(`
    SELECT 
      wos.*,
      s.name as service_name,
      s.description as service_description,
      s.category as service_category,
      s.base_price as service_base_price
    FROM work_order_services wos
    LEFT JOIN services s ON wos.service_id = s.id
    WHERE wos.work_order_id = ?
    ORDER BY wos.sequence_number
  `, [id]);
  
  res.json(services);
}));

/**
 * Get work order parts
 * GET /api/v1/work-orders/:id/parts
 */
router.get('/:id/parts', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if work order exists
  const workOrder = await dbConnection.get('SELECT id FROM work_orders WHERE id = ?', [id]);
  if (!workOrder) {
    throw new NotFoundError('Work order not found');
  }
  
  const parts = await dbConnection.all(`
    SELECT 
      wop.*,
      i.name as part_name,
      i.sku as part_sku,
      i.unit_price as part_unit_price,
      i.quantity as available_quantity
    FROM work_order_parts wop
    LEFT JOIN inventory i ON wop.inventory_id = i.id
    WHERE wop.work_order_id = ?
  `, [id]);
  
  res.json(parts);
}));

module.exports = router;