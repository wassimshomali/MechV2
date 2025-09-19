/**
 * Vehicle Routes for MoMech
 * Handles vehicle management operations
 */

const express = require('express');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const dbConnection = require('../database/connection');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Validate vehicle input
 */
function validateVehicleInput(data, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate && !data.clientId) {
    errors.push({ field: 'clientId', message: 'Client ID is required' });
  }
  
  if (!isUpdate && !data.make) {
    errors.push({ field: 'make', message: 'Vehicle make is required' });
  }
  
  if (!isUpdate && !data.model) {
    errors.push({ field: 'model', message: 'Vehicle model is required' });
  }
  
  if (!isUpdate && !data.year) {
    errors.push({ field: 'year', message: 'Vehicle year is required' });
  }
  
  if (data.year && (data.year < 1900 || data.year > new Date().getFullYear() + 1)) {
    errors.push({ field: 'year', message: 'Invalid vehicle year' });
  }
  
  if (data.vin && data.vin.length !== 17) {
    errors.push({ field: 'vin', message: 'VIN must be 17 characters long' });
  }
  
  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

/**
 * Get all vehicles
 * GET /api/v1/vehicles
 */
router.get('/', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    search = '', 
    clientId,
    make,
    model,
    year,
    active = 'true',
    sortBy = 'year',
    sortOrder = 'DESC'
  } = req.query;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const searchTerm = `%${search}%`;
  
  // Build WHERE clause
  let whereClause = '';
  const params = [];
  
  if (active !== 'all') {
    whereClause += 'WHERE v.is_active = ?';
    params.push(active === 'true' ? 1 : 0);
  }
  
  if (clientId) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'v.client_id = ?';
    params.push(clientId);
  }
  
  if (make) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'v.make LIKE ?';
    params.push(`%${make}%`);
  }
  
  if (model) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'v.model LIKE ?';
    params.push(`%${model}%`);
  }
  
  if (year) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'v.year = ?';
    params.push(year);
  }
  
  if (search) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += '(v.make LIKE ? OR v.model LIKE ? OR v.vin LIKE ? OR v.license_plate LIKE ?)';
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  // Validate sort parameters
  const validSortFields = ['make', 'model', 'year', 'created_at'];
  const validSortOrders = ['ASC', 'DESC'];
  
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'year';
  const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
  
  // Get total count
  const totalResult = await dbConnection.get(`
    SELECT COUNT(*) as total 
    FROM vehicles v 
    LEFT JOIN clients c ON v.client_id = c.id
    ${whereClause}
  `, params);
  
  // Get vehicles
  const vehicles = await dbConnection.all(`
    SELECT 
      v.*,
      c.first_name || ' ' || c.last_name as client_name,
      c.email as client_email,
      c.phone as client_phone
    FROM vehicles v 
    LEFT JOIN clients c ON v.client_id = c.id
    ${whereClause}
    ORDER BY v.${sortField} ${sortDirection}
    LIMIT ? OFFSET ?
  `, [...params, parseInt(limit), offset]);
  
  res.json({
    vehicles,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalResult.total,
      totalPages: Math.ceil(totalResult.total / parseInt(limit))
    }
  });
}));

/**
 * Get vehicle by ID
 * GET /api/v1/vehicles/:id
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const vehicle = await dbConnection.get(`
    SELECT 
      v.*,
      c.first_name || ' ' || c.last_name as client_name,
      c.email as client_email,
      c.phone as client_phone,
      c.address as client_address
    FROM vehicles v 
    LEFT JOIN clients c ON v.client_id = c.id
    WHERE v.id = ?
  `, [id]);
  
  if (!vehicle) {
    throw new NotFoundError('Vehicle not found');
  }
  
  // Get service history
  const serviceHistory = await dbConnection.all(`
    SELECT 
      vsh.*,
      s.name as service_name,
      s.category as service_category,
      u.first_name || ' ' || u.last_name as mechanic_name
    FROM vehicle_service_history vsh
    LEFT JOIN services s ON vsh.service_id = s.id
    LEFT JOIN users u ON vsh.mechanic_id = u.id
    WHERE vsh.vehicle_id = ?
    ORDER BY vsh.service_date DESC
    LIMIT 10
  `, [id]);
  
  // Get upcoming appointments
  const upcomingAppointments = await dbConnection.all(`
    SELECT 
      a.*,
      s.name as service_name,
      u.first_name || ' ' || u.last_name as assigned_mechanic
    FROM appointments a
    LEFT JOIN services s ON a.service_id = s.id
    LEFT JOIN users u ON a.assigned_to = u.id
    WHERE a.vehicle_id = ? AND a.status IN ('scheduled', 'confirmed', 'in_progress')
    ORDER BY a.appointment_date ASC, a.appointment_time ASC
  `, [id]);
  
  res.json({
    ...vehicle,
    serviceHistory,
    upcomingAppointments
  });
}));

/**
 * Create new vehicle
 * POST /api/v1/vehicles
 */
router.post('/', asyncHandler(async (req, res) => {
  const vehicleData = req.body;
  
  // Validate input
  validateVehicleInput(vehicleData);
  
  // Check if client exists
  const client = await dbConnection.get('SELECT id FROM clients WHERE id = ?', [vehicleData.clientId]);
  if (!client) {
    throw new ValidationError('Invalid client', [
      { field: 'clientId', message: 'Client not found' }
    ]);
  }
  
  // Check for duplicate VIN
  if (vehicleData.vin) {
    const existingVehicle = await dbConnection.get(
      'SELECT id FROM vehicles WHERE vin = ?',
      [vehicleData.vin]
    );
    
    if (existingVehicle) {
      throw new ValidationError('VIN already exists', [
        { field: 'vin', message: 'This VIN is already registered' }
      ]);
    }
  }
  
  // Insert vehicle
  const result = await dbConnection.run(`
    INSERT INTO vehicles (
      client_id, make, model, year, vin, license_plate, color, 
      engine_type, transmission, mileage, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    vehicleData.clientId,
    vehicleData.make,
    vehicleData.model,
    vehicleData.year,
    vehicleData.vin || null,
    vehicleData.licensePlate || null,
    vehicleData.color || null,
    vehicleData.engineType || null,
    vehicleData.transmission || null,
    vehicleData.mileage || null,
    vehicleData.notes || null
  ]);
  
  // Get created vehicle
  const newVehicle = await dbConnection.get(
    'SELECT * FROM vehicles WHERE id = ?',
    [result.lastID]
  );
  
  logger.business('vehicle_created', {
    vehicleId: newVehicle.id,
    clientId: vehicleData.clientId,
    vehicle: `${newVehicle.year} ${newVehicle.make} ${newVehicle.model}`
  });
  
  res.status(201).json(newVehicle);
}));

/**
 * Update vehicle
 * PUT /api/v1/vehicles/:id
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const vehicleData = req.body;
  
  // Validate input
  validateVehicleInput(vehicleData, true);
  
  // Check if vehicle exists
  const existingVehicle = await dbConnection.get('SELECT * FROM vehicles WHERE id = ?', [id]);
  if (!existingVehicle) {
    throw new NotFoundError('Vehicle not found');
  }
  
  // Check for duplicate VIN (excluding current vehicle)
  if (vehicleData.vin) {
    const duplicateVehicle = await dbConnection.get(
      'SELECT id FROM vehicles WHERE vin = ? AND id != ?',
      [vehicleData.vin, id]
    );
    
    if (duplicateVehicle) {
      throw new ValidationError('VIN already exists', [
        { field: 'vin', message: 'This VIN is already registered' }
      ]);
    }
  }
  
  // Update vehicle
  await dbConnection.run(`
    UPDATE vehicles SET
      make = COALESCE(?, make),
      model = COALESCE(?, model),
      year = COALESCE(?, year),
      vin = COALESCE(?, vin),
      license_plate = COALESCE(?, license_plate),
      color = COALESCE(?, color),
      engine_type = COALESCE(?, engine_type),
      transmission = COALESCE(?, transmission),
      mileage = COALESCE(?, mileage),
      notes = COALESCE(?, notes)
    WHERE id = ?
  `, [
    vehicleData.make,
    vehicleData.model,
    vehicleData.year,
    vehicleData.vin,
    vehicleData.licensePlate,
    vehicleData.color,
    vehicleData.engineType,
    vehicleData.transmission,
    vehicleData.mileage,
    vehicleData.notes,
    id
  ]);
  
  // Get updated vehicle
  const updatedVehicle = await dbConnection.get('SELECT * FROM vehicles WHERE id = ?', [id]);
  
  logger.business('vehicle_updated', {
    vehicleId: id,
    vehicle: `${updatedVehicle.year} ${updatedVehicle.make} ${updatedVehicle.model}`
  });
  
  res.json(updatedVehicle);
}));

/**
 * Delete vehicle (soft delete)
 * DELETE /api/v1/vehicles/:id
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if vehicle exists
  const vehicle = await dbConnection.get('SELECT * FROM vehicles WHERE id = ?', [id]);
  if (!vehicle) {
    throw new NotFoundError('Vehicle not found');
  }
  
  // Check for active appointments
  const activeAppointments = await dbConnection.get(`
    SELECT COUNT(*) as count 
    FROM appointments 
    WHERE vehicle_id = ? AND status IN ('scheduled', 'confirmed', 'in_progress')
  `, [id]);
  
  if (activeAppointments.count > 0) {
    throw new ValidationError('Cannot delete vehicle with active appointments', [
      { field: 'vehicle', message: 'Vehicle has active appointments. Please cancel or complete them first.' }
    ]);
  }
  
  // Soft delete vehicle
  await dbConnection.run('UPDATE vehicles SET is_active = 0 WHERE id = ?', [id]);
  
  logger.business('vehicle_deleted', {
    vehicleId: id,
    vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`
  });
  
  res.json({ message: 'Vehicle deleted successfully' });
}));

/**
 * Get vehicle service history
 * GET /api/v1/vehicles/:id/service-history
 */
router.get('/:id/service-history', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 50 } = req.query;
  
  // Check if vehicle exists
  const vehicle = await dbConnection.get('SELECT id FROM vehicles WHERE id = ?', [id]);
  if (!vehicle) {
    throw new NotFoundError('Vehicle not found');
  }
  
  const serviceHistory = await dbConnection.all(`
    SELECT 
      vsh.*,
      s.name as service_name,
      s.category as service_category,
      u.first_name || ' ' || u.last_name as mechanic_name
    FROM vehicle_service_history vsh
    LEFT JOIN services s ON vsh.service_id = s.id
    LEFT JOIN users u ON vsh.mechanic_id = u.id
    WHERE vsh.vehicle_id = ?
    ORDER BY vsh.service_date DESC
    LIMIT ?
  `, [id, parseInt(limit)]);
  
  res.json(serviceHistory);
}));

/**
 * Search vehicles
 * GET /api/v1/vehicles/search
 */
router.get('/search', asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;
  
  if (!q || q.length < 2) {
    return res.json([]);
  }
  
  const searchTerm = `%${q}%`;
  
  const vehicles = await dbConnection.all(`
    SELECT 
      v.id,
      v.make,
      v.model,
      v.year,
      v.license_plate,
      v.vin,
      c.first_name || ' ' || c.last_name as client_name,
      v.year || ' ' || v.make || ' ' || v.model as vehicle_display
    FROM vehicles v
    LEFT JOIN clients c ON v.client_id = c.id
    WHERE v.is_active = 1 
      AND (v.make LIKE ? OR v.model LIKE ? OR v.vin LIKE ? OR v.license_plate LIKE ?)
    ORDER BY v.year DESC, v.make, v.model
    LIMIT ?
  `, [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)]);
  
  res.json(vehicles);
}));

module.exports = router;