/**
 * Work Order Controller for MoMech
 * Business logic for work order management operations
 */

const dbConnection = require('../database/connection');
const logger = require('../utils/logger');

class WorkOrderController {
  /**
   * Generate work order number
   */
  async generateWorkOrderNumber() {
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
   * Get all work orders with pagination and filtering
   */
  async getWorkOrders(filters = {}) {
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
    } = filters;

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

    return {
      workOrders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        totalPages: Math.ceil(totalResult.total / parseInt(limit))
      }
    };
  }

  /**
   * Get work order by ID
   */
  async getWorkOrderById(id) {
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
      throw new Error('Work order not found');
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

    return {
      ...workOrder,
      services,
      parts
    };
  }

  /**
   * Create new work order
   */
  async createWorkOrder(workOrderData) {
    // Validate required fields
    if (!workOrderData.clientId || !workOrderData.vehicleId) {
      throw new Error('Client ID and vehicle ID are required');
    }

    if (!workOrderData.services || !Array.isArray(workOrderData.services) || workOrderData.services.length === 0) {
      throw new Error('At least one service is required');
    }

    // Validate status and priority
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'];
    const validPriorities = ['low', 'normal', 'high', 'urgent'];

    if (workOrderData.status && !validStatuses.includes(workOrderData.status)) {
      throw new Error('Invalid work order status');
    }

    if (workOrderData.priority && !validPriorities.includes(workOrderData.priority)) {
      throw new Error('Invalid priority level');
    }

    // Check if client exists
    const client = await dbConnection.get('SELECT id FROM clients WHERE id = ?', [workOrderData.clientId]);
    if (!client) {
      throw new Error('Client not found');
    }

    // Check if vehicle exists and belongs to client
    const vehicle = await dbConnection.get(
      'SELECT id FROM vehicles WHERE id = ? AND client_id = ?',
      [workOrderData.vehicleId, workOrderData.clientId]
    );
    if (!vehicle) {
      throw new Error('Vehicle not found or does not belong to client');
    }

    // Generate work order number
    const workOrderNumber = await this.generateWorkOrderNumber();

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

    return newWorkOrder;
  }

  /**
   * Update work order
   */
  async updateWorkOrder(id, workOrderData) {
    // Check if work order exists
    const existingWorkOrder = await dbConnection.get('SELECT * FROM work_orders WHERE id = ?', [id]);
    if (!existingWorkOrder) {
      throw new Error('Work order not found');
    }

    // Validate status and priority if provided
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'];
    const validPriorities = ['low', 'normal', 'high', 'urgent'];

    if (workOrderData.status && !validStatuses.includes(workOrderData.status)) {
      throw new Error('Invalid work order status');
    }

    if (workOrderData.priority && !validPriorities.includes(workOrderData.priority)) {
      throw new Error('Invalid priority level');
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

    return updatedWorkOrder;
  }

  /**
   * Update work order status
   */
  async updateWorkOrderStatus(id, status) {
    // Validate status
    const validStatuses = ['pending', 'in_progress', 'completed', 'cancelled', 'on_hold'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    // Check if work order exists
    const workOrder = await dbConnection.get('SELECT * FROM work_orders WHERE id = ?', [id]);
    if (!workOrder) {
      throw new Error('Work order not found');
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

    return updatedWorkOrder;
  }

  /**
   * Delete work order
   */
  async deleteWorkOrder(id) {
    // Check if work order exists
    const workOrder = await dbConnection.get('SELECT * FROM work_orders WHERE id = ?', [id]);
    if (!workOrder) {
      throw new Error('Work order not found');
    }

    // Check if work order can be deleted
    if (workOrder.status === 'in_progress') {
      throw new Error('Cannot delete work order in progress');
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

    return { message: 'Work order deleted successfully' };
  }

  /**
   * Get work order services
   */
  async getWorkOrderServices(workOrderId) {
    // Check if work order exists
    const workOrder = await dbConnection.get('SELECT id FROM work_orders WHERE id = ?', [workOrderId]);
    if (!workOrder) {
      throw new Error('Work order not found');
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
    `, [workOrderId]);

    return services;
  }

  /**
   * Get work order parts
   */
  async getWorkOrderParts(workOrderId) {
    // Check if work order exists
    const workOrder = await dbConnection.get('SELECT id FROM work_orders WHERE id = ?', [workOrderId]);
    if (!workOrder) {
      throw new Error('Work order not found');
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
    `, [workOrderId]);

    return parts;
  }
}

module.exports = new WorkOrderController();