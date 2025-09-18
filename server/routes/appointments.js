/**
 * Appointment Routes for MoMech
 * Handles appointment scheduling and management
 */

const express = require('express');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const dbConnection = require('../database/connection');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Validate appointment input
 */
function validateAppointmentInput(data, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate && !data.clientId) {
    errors.push({ field: 'clientId', message: 'Client ID is required' });
  }
  
  if (!isUpdate && !data.vehicleId) {
    errors.push({ field: 'vehicleId', message: 'Vehicle ID is required' });
  }
  
  if (!isUpdate && !data.appointmentDate) {
    errors.push({ field: 'appointmentDate', message: 'Appointment date is required' });
  }
  
  if (!isUpdate && !data.appointmentTime) {
    errors.push({ field: 'appointmentTime', message: 'Appointment time is required' });
  }
  
  if (data.appointmentDate) {
    const appointmentDate = new Date(data.appointmentDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      errors.push({ field: 'appointmentDate', message: 'Appointment date cannot be in the past' });
    }
  }
  
  if (data.estimatedDuration && (data.estimatedDuration < 15 || data.estimatedDuration > 480)) {
    errors.push({ field: 'estimatedDuration', message: 'Duration must be between 15 and 480 minutes' });
  }
  
  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

/**
 * Get all appointments
 * GET /api/v1/appointments
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
    dateFrom,
    dateTo,
    priority,
    sortBy = 'appointment_date',
    sortOrder = 'ASC'
  } = req.query;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const searchTerm = `%${search}%`;
  
  // Build WHERE clause
  let whereClause = 'WHERE 1=1';
  const params = [];
  
  if (status) {
    whereClause += ' AND a.status = ?';
    params.push(status);
  }
  
  if (clientId) {
    whereClause += ' AND a.client_id = ?';
    params.push(clientId);
  }
  
  if (vehicleId) {
    whereClause += ' AND a.vehicle_id = ?';
    params.push(vehicleId);
  }
  
  if (assignedTo) {
    whereClause += ' AND a.assigned_to = ?';
    params.push(assignedTo);
  }
  
  if (dateFrom) {
    whereClause += ' AND a.appointment_date >= ?';
    params.push(dateFrom);
  }
  
  if (dateTo) {
    whereClause += ' AND a.appointment_date <= ?';
    params.push(dateTo);
  }
  
  if (priority) {
    whereClause += ' AND a.priority = ?';
    params.push(priority);
  }
  
  if (search) {
    whereClause += ' AND (c.first_name LIKE ? OR c.last_name LIKE ? OR v.make LIKE ? OR v.model LIKE ? OR s.name LIKE ? OR a.description LIKE ?)';
    params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  // Validate sort parameters
  const validSortFields = ['appointment_date', 'appointment_time', 'status', 'priority', 'client_name', 'created_at'];
  const validSortOrders = ['ASC', 'DESC'];
  
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'appointment_date';
  const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
  
  // Get total count
  const totalResult = await dbConnection.get(`
    SELECT COUNT(*) as total 
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    LEFT JOIN services s ON a.service_id = s.id
    ${whereClause}
  `, params);
  
  // Get appointments
  const appointments = await dbConnection.all(`
    SELECT 
      a.*,
      c.first_name || ' ' || c.last_name as client_name,
      c.phone as client_phone,
      c.email as client_email,
      v.make || ' ' || v.model || ' (' || v.year || ')' as vehicle_info,
      v.license_plate,
      s.name as service_name,
      s.estimated_duration as service_duration,
      u.first_name || ' ' || u.last_name as assigned_mechanic
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN users u ON a.assigned_to = u.id
    ${whereClause}
    ORDER BY ${sortField === 'client_name' ? 'c.first_name' : 'a.' + sortField} ${sortDirection}, a.appointment_time ${sortDirection}
    LIMIT ? OFFSET ?
  `, [...params, parseInt(limit), offset]);
  
  res.json({
    appointments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalResult.total,
      totalPages: Math.ceil(totalResult.total / parseInt(limit))
    }
  });
}));

/**
 * Get appointment by ID
 * GET /api/v1/appointments/:id
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const appointment = await dbConnection.get(`
    SELECT 
      a.*,
      c.first_name || ' ' || c.last_name as client_name,
      c.phone as client_phone,
      c.email as client_email,
      c.address as client_address,
      v.make || ' ' || v.model || ' (' || v.year || ')' as vehicle_info,
      v.license_plate,
      v.vin,
      v.mileage as vehicle_mileage,
      s.name as service_name,
      s.description as service_description,
      s.estimated_duration as service_duration,
      s.labor_rate,
      u.first_name || ' ' || u.last_name as assigned_mechanic,
      u.phone as mechanic_phone
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN users u ON a.assigned_to = u.id
    WHERE a.id = ?
  `, [id]);
  
  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }
  
  // Get related work order if exists
  const workOrder = await dbConnection.get(`
    SELECT * FROM work_orders WHERE appointment_id = ?
  `, [id]);
  
  res.json({
    ...appointment,
    workOrder
  });
}));

/**
 * Create new appointment
 * POST /api/v1/appointments
 */
router.post('/', asyncHandler(async (req, res) => {
  const appointmentData = req.body;
  
  // Validate input
  validateAppointmentInput(appointmentData);
  
  // Check if client exists
  const client = await dbConnection.get('SELECT id FROM clients WHERE id = ?', [appointmentData.clientId]);
  if (!client) {
    throw new ValidationError('Client not found', [
      { field: 'clientId', message: 'Client does not exist' }
    ]);
  }
  
  // Check if vehicle exists and belongs to client
  const vehicle = await dbConnection.get('SELECT id FROM vehicles WHERE id = ? AND client_id = ?', [appointmentData.vehicleId, appointmentData.clientId]);
  if (!vehicle) {
    throw new ValidationError('Vehicle not found or does not belong to client', [
      { field: 'vehicleId', message: 'Vehicle does not exist or does not belong to the specified client' }
    ]);
  }
  
  // Check if service exists
  if (appointmentData.serviceId) {
    const service = await dbConnection.get('SELECT id FROM services WHERE id = ?', [appointmentData.serviceId]);
    if (!service) {
      throw new ValidationError('Service not found', [
        { field: 'serviceId', message: 'Service does not exist' }
      ]);
    }
  }
  
  // Check if mechanic exists
  if (appointmentData.assignedTo) {
    const mechanic = await dbConnection.get('SELECT id FROM users WHERE id = ? AND role IN ("mechanic", "manager", "owner")', [appointmentData.assignedTo]);
    if (!mechanic) {
      throw new ValidationError('Mechanic not found', [
        { field: 'assignedTo', message: 'Assigned mechanic does not exist' }
      ]);
    }
  }
  
  // Check for time conflicts
  const conflictingAppointment = await dbConnection.get(`
    SELECT id FROM appointments 
    WHERE appointment_date = ? 
      AND assigned_to = ?
      AND status IN ('scheduled', 'confirmed', 'in_progress')
      AND (
        (appointment_time <= ? AND datetime(appointment_date || ' ' || appointment_time, '+' || estimated_duration || ' minutes') > ?)
        OR
        (appointment_time < datetime(?, '+' || ? || ' minutes') AND appointment_time >= ?)
      )
  `, [
    appointmentData.appointmentDate,
    appointmentData.assignedTo,
    appointmentData.appointmentTime,
    appointmentData.appointmentDate + ' ' + appointmentData.appointmentTime,
    appointmentData.appointmentTime,
    appointmentData.estimatedDuration || 60,
    appointmentData.appointmentTime
  ]);
  
  if (conflictingAppointment) {
    throw new ValidationError('Time conflict', [
      { field: 'appointmentTime', message: 'The selected time conflicts with another appointment' }
    ]);
  }
  
  // Insert appointment
  const result = await dbConnection.run(`
    INSERT INTO appointments (
      client_id, vehicle_id, service_id, assigned_to, appointment_date, appointment_time,
      estimated_duration, status, priority, description, customer_notes, internal_notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    appointmentData.clientId,
    appointmentData.vehicleId,
    appointmentData.serviceId || null,
    appointmentData.assignedTo || null,
    appointmentData.appointmentDate,
    appointmentData.appointmentTime,
    appointmentData.estimatedDuration || 60,
    appointmentData.status || 'scheduled',
    appointmentData.priority || 'normal',
    appointmentData.description || '',
    appointmentData.customerNotes || null,
    appointmentData.internalNotes || null
  ]);
  
  // Get created appointment with details
  const newAppointment = await dbConnection.get(`
    SELECT 
      a.*,
      c.first_name || ' ' || c.last_name as client_name,
      v.make || ' ' || v.model || ' (' || v.year || ')' as vehicle_info,
      s.name as service_name,
      u.first_name || ' ' || u.last_name as assigned_mechanic
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN users u ON a.assigned_to = u.id
    WHERE a.id = ?
  `, [result.lastID]);
  
  logger.business('appointment_created', {
    appointmentId: newAppointment.id,
    clientId: appointmentData.clientId,
    vehicleId: appointmentData.vehicleId,
    date: appointmentData.appointmentDate,
    time: appointmentData.appointmentTime
  });
  
  res.status(201).json(newAppointment);
}));

/**
 * Update appointment
 * PUT /api/v1/appointments/:id
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const appointmentData = req.body;
  
  // Validate input
  validateAppointmentInput(appointmentData, true);
  
  // Check if appointment exists
  const existingAppointment = await dbConnection.get('SELECT * FROM appointments WHERE id = ?', [id]);
  if (!existingAppointment) {
    throw new NotFoundError('Appointment not found');
  }
  
  // Check if mechanic exists (if being updated)
  if (appointmentData.assignedTo) {
    const mechanic = await dbConnection.get('SELECT id FROM users WHERE id = ? AND role IN ("mechanic", "manager", "owner")', [appointmentData.assignedTo]);
    if (!mechanic) {
      throw new ValidationError('Mechanic not found', [
        { field: 'assignedTo', message: 'Assigned mechanic does not exist' }
      ]);
    }
  }
  
  // Update appointment
  await dbConnection.run(`
    UPDATE appointments SET
      service_id = COALESCE(?, service_id),
      assigned_to = COALESCE(?, assigned_to),
      appointment_date = COALESCE(?, appointment_date),
      appointment_time = COALESCE(?, appointment_time),
      estimated_duration = COALESCE(?, estimated_duration),
      status = COALESCE(?, status),
      priority = COALESCE(?, priority),
      description = COALESCE(?, description),
      customer_notes = COALESCE(?, customer_notes),
      internal_notes = COALESCE(?, internal_notes),
      reminder_sent = COALESCE(?, reminder_sent)
    WHERE id = ?
  `, [
    appointmentData.serviceId,
    appointmentData.assignedTo,
    appointmentData.appointmentDate,
    appointmentData.appointmentTime,
    appointmentData.estimatedDuration,
    appointmentData.status,
    appointmentData.priority,
    appointmentData.description,
    appointmentData.customerNotes,
    appointmentData.internalNotes,
    appointmentData.reminderSent,
    id
  ]);
  
  // Get updated appointment
  const updatedAppointment = await dbConnection.get(`
    SELECT 
      a.*,
      c.first_name || ' ' || c.last_name as client_name,
      v.make || ' ' || v.model || ' (' || v.year || ')' as vehicle_info,
      s.name as service_name,
      u.first_name || ' ' || u.last_name as assigned_mechanic
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN users u ON a.assigned_to = u.id
    WHERE a.id = ?
  `, [id]);
  
  logger.business('appointment_updated', {
    appointmentId: id,
    status: updatedAppointment.status
  });
  
  res.json(updatedAppointment);
}));

/**
 * Cancel appointment
 * DELETE /api/v1/appointments/:id
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if appointment exists
  const appointment = await dbConnection.get('SELECT * FROM appointments WHERE id = ?', [id]);
  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }
  
  // Check if appointment can be cancelled
  if (appointment.status === 'completed') {
    throw new ValidationError('Cannot cancel completed appointment', [
      { field: 'status', message: 'Completed appointments cannot be cancelled' }
    ]);
  }
  
  // Cancel appointment
  await dbConnection.run('UPDATE appointments SET status = "cancelled" WHERE id = ?', [id]);
  
  logger.business('appointment_cancelled', {
    appointmentId: id,
    clientId: appointment.client_id,
    date: appointment.appointment_date
  });
  
  res.json({ message: 'Appointment cancelled successfully' });
}));

/**
 * Get today's appointments
 * GET /api/v1/appointments/today
 */
router.get('/today', asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  
  const appointments = await dbConnection.all(`
    SELECT 
      a.*,
      c.first_name || ' ' || c.last_name as client_name,
      c.phone as client_phone,
      v.make || ' ' || v.model || ' (' || v.year || ')' as vehicle_info,
      v.license_plate,
      s.name as service_name,
      u.first_name || ' ' || u.last_name as assigned_mechanic
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN users u ON a.assigned_to = u.id
    WHERE a.appointment_date = ? AND a.status != 'cancelled'
    ORDER BY a.appointment_time ASC
  `, [today]);
  
  res.json(appointments);
}));

/**
 * Get calendar view data
 * GET /api/v1/appointments/calendar/:date
 */
router.get('/calendar/:date', asyncHandler(async (req, res) => {
  const { date } = req.params;
  const { view = 'month' } = req.query;
  
  let startDate, endDate;
  const targetDate = new Date(date);
  
  if (view === 'week') {
    // Get week view (7 days)
    startDate = new Date(targetDate);
    startDate.setDate(targetDate.getDate() - targetDate.getDay()); // Start of week
    endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6); // End of week
  } else {
    // Get month view
    startDate = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
    endDate = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);
  }
  
  const appointments = await dbConnection.all(`
    SELECT 
      a.*,
      c.first_name || ' ' || c.last_name as client_name,
      v.make || ' ' || v.model as vehicle_info,
      s.name as service_name,
      u.first_name || ' ' || u.last_name as assigned_mechanic
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN users u ON a.assigned_to = u.id
    WHERE a.appointment_date BETWEEN ? AND ? AND a.status != 'cancelled'
    ORDER BY a.appointment_date ASC, a.appointment_time ASC
  `, [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]]);
  
  res.json({
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    view,
    appointments
  });
}));

/**
 * Update appointment status
 * PUT /api/v1/appointments/:id/status
 */
router.put('/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  
  if (!status) {
    throw new ValidationError('Status is required', [
      { field: 'status', message: 'Status is required' }
    ]);
  }
  
  const validStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
  if (!validStatuses.includes(status)) {
    throw new ValidationError('Invalid status', [
      { field: 'status', message: 'Invalid appointment status' }
    ]);
  }
  
  // Check if appointment exists
  const appointment = await dbConnection.get('SELECT * FROM appointments WHERE id = ?', [id]);
  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }
  
  // Update status
  await dbConnection.run(`
    UPDATE appointments SET 
      status = ?,
      internal_notes = COALESCE(?, internal_notes)
    WHERE id = ?
  `, [status, notes, id]);
  
  // Get updated appointment
  const updatedAppointment = await dbConnection.get(`
    SELECT 
      a.*,
      c.first_name || ' ' || c.last_name as client_name,
      v.make || ' ' || v.model || ' (' || v.year || ')' as vehicle_info
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    WHERE a.id = ?
  `, [id]);
  
  logger.business('appointment_status_updated', {
    appointmentId: id,
    oldStatus: appointment.status,
    newStatus: status
  });
  
  res.json(updatedAppointment);
}));

module.exports = router;