/**
 * Appointment Routes for MoMech
 * Handles appointment scheduling and management operations
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
  
  // Validate date format
  if (data.appointmentDate && !/^\d{4}-\d{2}-\d{2}$/.test(data.appointmentDate)) {
    errors.push({ field: 'appointmentDate', message: 'Invalid date format (YYYY-MM-DD)' });
  }
  
  // Validate time format
  if (data.appointmentTime && !/^\d{2}:\d{2}$/.test(data.appointmentTime)) {
    errors.push({ field: 'appointmentTime', message: 'Invalid time format (HH:MM)' });
  }
  
  // Validate appointment is in the future
  if (data.appointmentDate && data.appointmentTime) {
    const appointmentDateTime = new Date(`${data.appointmentDate}T${data.appointmentTime}`);
    if (appointmentDateTime <= new Date()) {
      errors.push({ field: 'appointmentDate', message: 'Appointment must be in the future' });
    }
  }
  
  // Validate duration
  if (data.estimatedDuration && (data.estimatedDuration < 15 || data.estimatedDuration > 480)) {
    errors.push({ field: 'estimatedDuration', message: 'Duration must be between 15 minutes and 8 hours' });
  }
  
  // Validate status
  const validStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
  if (data.status && !validStatuses.includes(data.status)) {
    errors.push({ field: 'status', message: 'Invalid appointment status' });
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
    date,
    status,
    clientId,
    vehicleId,
    assignedTo,
    sortBy = 'appointment_date',
    sortOrder = 'ASC'
  } = req.query;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  // Build WHERE clause
  let whereClause = '';
  const params = [];
  
  if (date) {
    whereClause += 'WHERE a.appointment_date = ?';
    params.push(date);
  }
  
  if (status) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'a.status = ?';
    params.push(status);
  }
  
  if (clientId) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'a.client_id = ?';
    params.push(clientId);
  }
  
  if (vehicleId) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'a.vehicle_id = ?';
    params.push(vehicleId);
  }
  
  if (assignedTo) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'a.assigned_to = ?';
    params.push(assignedTo);
  }
  
  // Validate sort parameters
  const validSortFields = ['appointment_date', 'appointment_time', 'status', 'created_at'];
  const validSortOrders = ['ASC', 'DESC'];
  
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'appointment_date';
  const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
  
  // Get total count
  const totalResult = await dbConnection.get(`
    SELECT COUNT(*) as total FROM appointments a ${whereClause}
  `, params);
  
  // Get appointments
  const appointments = await dbConnection.all(`
    SELECT 
      a.*,
      c.first_name || ' ' || c.last_name as client_name,
      c.phone as client_phone,
      v.year || ' ' || v.make || ' ' || v.model as vehicle_display,
      v.license_plate,
      s.name as service_name,
      s.category as service_category,
      s.estimated_duration as service_duration,
      u.first_name || ' ' || u.last_name as assigned_mechanic
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN users u ON a.assigned_to = u.id
    ${whereClause}
    ORDER BY a.${sortField} ${sortDirection}, a.appointment_time ${sortDirection}
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
      v.year || ' ' || v.make || ' ' || v.model as vehicle_display,
      v.license_plate,
      s.name as service_name,
      s.category as service_category,
      u.first_name || ' ' || u.last_name as assigned_mechanic
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN users u ON a.assigned_to = u.id
    WHERE a.appointment_date = ?
    ORDER BY a.appointment_time ASC
  `, [today]);
  
  res.json(appointments);
}));

/**
 * Get calendar appointments for a specific date
 * GET /api/v1/appointments/calendar/:date
 */
router.get('/calendar/:date', asyncHandler(async (req, res) => {
  const { date } = req.params;
  
  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ValidationError('Invalid date format', [
      { field: 'date', message: 'Date must be in YYYY-MM-DD format' }
    ]);
  }
  
  const appointments = await dbConnection.all(`
    SELECT 
      a.*,
      c.first_name || ' ' || c.last_name as client_name,
      c.phone as client_phone,
      v.year || ' ' || v.make || ' ' || v.model as vehicle_display,
      s.name as service_name,
      s.category as service_category,
      s.estimated_duration,
      u.first_name || ' ' || u.last_name as assigned_mechanic
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN users u ON a.assigned_to = u.id
    WHERE a.appointment_date = ?
    ORDER BY a.appointment_time ASC
  `, [date]);
  
  res.json(appointments);
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
      c.email as client_email,
      c.phone as client_phone,
      c.address as client_address,
      v.year || ' ' || v.make || ' ' || v.model as vehicle_display,
      v.license_plate,
      v.vin,
      v.mileage,
      s.name as service_name,
      s.description as service_description,
      s.category as service_category,
      s.estimated_duration as service_duration,
      s.base_price as service_price,
      u.first_name || ' ' || u.last_name as assigned_mechanic
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
  
  res.json(appointment);
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
    throw new ValidationError('Invalid client', [
      { field: 'clientId', message: 'Client not found' }
    ]);
  }
  
  // Check if vehicle exists and belongs to client
  const vehicle = await dbConnection.get(
    'SELECT id FROM vehicles WHERE id = ? AND client_id = ?', 
    [appointmentData.vehicleId, appointmentData.clientId]
  );
  if (!vehicle) {
    throw new ValidationError('Invalid vehicle', [
      { field: 'vehicleId', message: 'Vehicle not found or does not belong to client' }
    ]);
  }
  
  // Check for scheduling conflicts
  const conflictingAppointment = await dbConnection.get(`
    SELECT id FROM appointments 
    WHERE appointment_date = ? 
      AND appointment_time = ? 
      AND status NOT IN ('cancelled', 'completed')
      AND assigned_to = ?
  `, [
    appointmentData.appointmentDate, 
    appointmentData.appointmentTime,
    appointmentData.assignedTo || null
  ]);
  
  if (conflictingAppointment) {
    throw new ValidationError('Time slot conflict', [
      { field: 'appointmentTime', message: 'This time slot is already booked' }
    ]);
  }
  
  // Insert appointment
  const result = await dbConnection.run(`
    INSERT INTO appointments (
      client_id, vehicle_id, service_id, appointment_date, appointment_time,
      estimated_duration, status, notes, assigned_to, priority
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    appointmentData.clientId,
    appointmentData.vehicleId,
    appointmentData.serviceId || null,
    appointmentData.appointmentDate,
    appointmentData.appointmentTime,
    appointmentData.estimatedDuration || 60,
    appointmentData.status || 'scheduled',
    appointmentData.notes || null,
    appointmentData.assignedTo || null,
    appointmentData.priority || 'normal'
  ]);
  
  // Get created appointment
  const newAppointment = await dbConnection.get(
    'SELECT * FROM appointments WHERE id = ?',
    [result.lastID]
  );
  
  logger.business('appointment_created', {
    appointmentId: newAppointment.id,
    clientId: appointmentData.clientId,
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
  
  // Check for scheduling conflicts (if time is being changed)
  if (appointmentData.appointmentDate || appointmentData.appointmentTime || appointmentData.assignedTo) {
    const checkDate = appointmentData.appointmentDate || existingAppointment.appointment_date;
    const checkTime = appointmentData.appointmentTime || existingAppointment.appointment_time;
    const checkAssignee = appointmentData.assignedTo !== undefined ? appointmentData.assignedTo : existingAppointment.assigned_to;
    
    const conflictingAppointment = await dbConnection.get(`
      SELECT id FROM appointments 
      WHERE appointment_date = ? 
        AND appointment_time = ? 
        AND status NOT IN ('cancelled', 'completed')
        AND assigned_to = ?
        AND id != ?
    `, [checkDate, checkTime, checkAssignee, id]);
    
    if (conflictingAppointment) {
      throw new ValidationError('Time slot conflict', [
        { field: 'appointmentTime', message: 'This time slot is already booked' }
      ]);
    }
  }
  
  // Update appointment
  await dbConnection.run(`
    UPDATE appointments SET
      appointment_date = COALESCE(?, appointment_date),
      appointment_time = COALESCE(?, appointment_time),
      service_id = COALESCE(?, service_id),
      estimated_duration = COALESCE(?, estimated_duration),
      status = COALESCE(?, status),
      notes = COALESCE(?, notes),
      assigned_to = COALESCE(?, assigned_to),
      priority = COALESCE(?, priority)
    WHERE id = ?
  `, [
    appointmentData.appointmentDate,
    appointmentData.appointmentTime,
    appointmentData.serviceId,
    appointmentData.estimatedDuration,
    appointmentData.status,
    appointmentData.notes,
    appointmentData.assignedTo,
    appointmentData.priority,
    id
  ]);
  
  // Get updated appointment
  const updatedAppointment = await dbConnection.get('SELECT * FROM appointments WHERE id = ?', [id]);
  
  logger.business('appointment_updated', {
    appointmentId: id,
    status: updatedAppointment.status
  });
  
  res.json(updatedAppointment);
}));

/**
 * Delete appointment
 * DELETE /api/v1/appointments/:id
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if appointment exists
  const appointment = await dbConnection.get('SELECT * FROM appointments WHERE id = ?', [id]);
  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }
  
  // Check if appointment can be deleted
  if (appointment.status === 'in_progress') {
    throw new ValidationError('Cannot delete appointment in progress', [
      { field: 'status', message: 'Appointment is currently in progress' }
    ]);
  }
  
  // Delete appointment (hard delete for appointments)
  await dbConnection.run('DELETE FROM appointments WHERE id = ?', [id]);
  
  logger.business('appointment_deleted', {
    appointmentId: id,
    date: appointment.appointment_date,
    time: appointment.appointment_time
  });
  
  res.json({ message: 'Appointment deleted successfully' });
}));

/**
 * Update appointment status
 * PATCH /api/v1/appointments/:id/status
 */
router.patch('/:id/status', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  // Validate status
  const validStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
  if (!status || !validStatuses.includes(status)) {
    throw new ValidationError('Invalid status', [
      { field: 'status', message: 'Status must be one of: ' + validStatuses.join(', ') }
    ]);
  }
  
  // Check if appointment exists
  const appointment = await dbConnection.get('SELECT * FROM appointments WHERE id = ?', [id]);
  if (!appointment) {
    throw new NotFoundError('Appointment not found');
  }
  
  // Update status
  await dbConnection.run('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
  
  // If marking as completed, update the actual end time
  if (status === 'completed') {
    await dbConnection.run(
      'UPDATE appointments SET actual_end_time = datetime("now", "localtime") WHERE id = ?', 
      [id]
    );
  }
  
  // Get updated appointment
  const updatedAppointment = await dbConnection.get('SELECT * FROM appointments WHERE id = ?', [id]);
  
  logger.business('appointment_status_updated', {
    appointmentId: id,
    oldStatus: appointment.status,
    newStatus: status
  });
  
  res.json(updatedAppointment);
}));

/**
 * Get available time slots for a date
 * GET /api/v1/appointments/available-slots/:date
 */
router.get('/available-slots/:date', asyncHandler(async (req, res) => {
  const { date } = req.params;
  const { duration = 60, assignedTo } = req.query;
  
  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new ValidationError('Invalid date format', [
      { field: 'date', message: 'Date must be in YYYY-MM-DD format' }
    ]);
  }
  
  // Get existing appointments for the date
  let whereClause = 'WHERE appointment_date = ? AND status NOT IN ("cancelled", "completed")';
  const params = [date];
  
  if (assignedTo) {
    whereClause += ' AND assigned_to = ?';
    params.push(assignedTo);
  }
  
  const existingAppointments = await dbConnection.all(`
    SELECT appointment_time, estimated_duration 
    FROM appointments 
    ${whereClause}
    ORDER BY appointment_time
  `, params);
  
  // Generate available time slots (8 AM to 6 PM, 30-minute intervals)
  const workingHours = { start: '08:00', end: '18:00' };
  const slotInterval = 30; // minutes
  const requestedDuration = parseInt(duration);
  
  const availableSlots = [];
  const startTime = new Date(`${date}T${workingHours.start}:00`);
  const endTime = new Date(`${date}T${workingHours.end}:00`);
  
  let currentTime = new Date(startTime);
  
  while (currentTime < endTime) {
    const timeStr = currentTime.toTimeString().substr(0, 5);
    const slotEnd = new Date(currentTime.getTime() + requestedDuration * 60000);
    
    // Check if this slot conflicts with existing appointments
    let hasConflict = false;
    
    for (const appointment of existingAppointments) {
      const appointmentStart = new Date(`${date}T${appointment.appointment_time}:00`);
      const appointmentEnd = new Date(appointmentStart.getTime() + appointment.estimated_duration * 60000);
      
      // Check for overlap
      if (currentTime < appointmentEnd && slotEnd > appointmentStart) {
        hasConflict = true;
        break;
      }
    }
    
    if (!hasConflict && slotEnd <= endTime) {
      availableSlots.push(timeStr);
    }
    
    currentTime = new Date(currentTime.getTime() + slotInterval * 60000);
  }
  
  res.json({
    date,
    availableSlots,
    duration: requestedDuration,
    workingHours
  });
}));

module.exports = router;