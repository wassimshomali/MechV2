/**
 * Appointment Controller for MoMech
 * Business logic for appointment management operations
 */

const dbConnection = require('../database/connection');
const logger = require('../utils/logger');

class AppointmentController {
  /**
   * Get all appointments with pagination and filtering
   */
  async getAppointments(filters = {}) {
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
    } = filters;

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

    return {
      appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        totalPages: Math.ceil(totalResult.total / parseInt(limit))
      }
    };
  }

  /**
   * Get today's appointments
   */
  async getTodaysAppointments() {
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

    return appointments;
  }

  /**
   * Get calendar appointments for a specific date
   */
  async getCalendarAppointments(date) {
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format (YYYY-MM-DD required)');
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

    return appointments;
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(id) {
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
      throw new Error('Appointment not found');
    }

    return appointment;
  }

  /**
   * Create new appointment
   */
  async createAppointment(appointmentData) {
    // Validate required fields
    if (!appointmentData.clientId || !appointmentData.vehicleId || 
        !appointmentData.appointmentDate || !appointmentData.appointmentTime) {
      throw new Error('Client ID, vehicle ID, date, and time are required');
    }

    // Validate date and time formats
    if (!/^\d{4}-\d{2}-\d{2}$/.test(appointmentData.appointmentDate)) {
      throw new Error('Invalid date format (YYYY-MM-DD required)');
    }

    if (!/^\d{2}:\d{2}$/.test(appointmentData.appointmentTime)) {
      throw new Error('Invalid time format (HH:MM required)');
    }

    // Validate appointment is in the future
    const appointmentDateTime = new Date(`${appointmentData.appointmentDate}T${appointmentData.appointmentTime}`);
    if (appointmentDateTime <= new Date()) {
      throw new Error('Appointment must be in the future');
    }

    // Check if client exists
    const client = await dbConnection.get('SELECT id FROM clients WHERE id = ?', [appointmentData.clientId]);
    if (!client) {
      throw new Error('Client not found');
    }

    // Check if vehicle exists and belongs to client
    const vehicle = await dbConnection.get(
      'SELECT id FROM vehicles WHERE id = ? AND client_id = ?',
      [appointmentData.vehicleId, appointmentData.clientId]
    );
    if (!vehicle) {
      throw new Error('Vehicle not found or does not belong to client');
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
      throw new Error('This time slot is already booked');
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

    return newAppointment;
  }

  /**
   * Update appointment
   */
  async updateAppointment(id, appointmentData) {
    // Check if appointment exists
    const existingAppointment = await dbConnection.get('SELECT * FROM appointments WHERE id = ?', [id]);
    if (!existingAppointment) {
      throw new Error('Appointment not found');
    }

    // Validate date and time formats if provided
    if (appointmentData.appointmentDate && !/^\d{4}-\d{2}-\d{2}$/.test(appointmentData.appointmentDate)) {
      throw new Error('Invalid date format (YYYY-MM-DD required)');
    }

    if (appointmentData.appointmentTime && !/^\d{2}:\d{2}$/.test(appointmentData.appointmentTime)) {
      throw new Error('Invalid time format (HH:MM required)');
    }

    // Check for scheduling conflicts (if time is being changed)
    if (appointmentData.appointmentDate || appointmentData.appointmentTime || appointmentData.assignedTo !== undefined) {
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
        throw new Error('This time slot is already booked');
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

    return updatedAppointment;
  }

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(id, status) {
    // Validate status
    const validStatuses = ['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'];
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }

    // Check if appointment exists
    const appointment = await dbConnection.get('SELECT * FROM appointments WHERE id = ?', [id]);
    if (!appointment) {
      throw new Error('Appointment not found');
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

    return updatedAppointment;
  }

  /**
   * Delete appointment
   */
  async deleteAppointment(id) {
    // Check if appointment exists
    const appointment = await dbConnection.get('SELECT * FROM appointments WHERE id = ?', [id]);
    if (!appointment) {
      throw new Error('Appointment not found');
    }

    // Check if appointment can be deleted
    if (appointment.status === 'in_progress') {
      throw new Error('Cannot delete appointment in progress');
    }

    // Delete appointment (hard delete for appointments)
    await dbConnection.run('DELETE FROM appointments WHERE id = ?', [id]);

    logger.business('appointment_deleted', {
      appointmentId: id,
      date: appointment.appointment_date,
      time: appointment.appointment_time
    });

    return { message: 'Appointment deleted successfully' };
  }

  /**
   * Get available time slots for a date
   */
  async getAvailableTimeSlots(date, options = {}) {
    const { duration = 60, assignedTo } = options;

    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new Error('Invalid date format (YYYY-MM-DD required)');
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

    return {
      date,
      availableSlots,
      duration: requestedDuration,
      workingHours
    };
  }
}

module.exports = new AppointmentController();