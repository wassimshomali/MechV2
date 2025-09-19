/**
 * Vehicle Controller for MoMech
 * Business logic for vehicle management operations
 */

const dbConnection = require('../database/connection');
const logger = require('../utils/logger');

class VehicleController {
  /**
   * Get all vehicles with pagination and filtering
   */
  async getVehicles(filters = {}) {
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
    } = filters;

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

    return {
      vehicles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        totalPages: Math.ceil(totalResult.total / parseInt(limit))
      }
    };
  }

  /**
   * Get vehicle by ID with related data
   */
  async getVehicleById(id) {
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
      throw new Error('Vehicle not found');
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

    return {
      ...vehicle,
      serviceHistory,
      upcomingAppointments
    };
  }

  /**
   * Create new vehicle
   */
  async createVehicle(vehicleData) {
    // Validate required fields
    if (!vehicleData.clientId || !vehicleData.make || !vehicleData.model || !vehicleData.year) {
      throw new Error('Client ID, make, model, and year are required');
    }

    // Validate year
    const currentYear = new Date().getFullYear();
    if (vehicleData.year < 1900 || vehicleData.year > currentYear + 1) {
      throw new Error('Invalid vehicle year');
    }

    // Check if client exists
    const client = await dbConnection.get('SELECT id FROM clients WHERE id = ?', [vehicleData.clientId]);
    if (!client) {
      throw new Error('Client not found');
    }

    // Check for duplicate VIN
    if (vehicleData.vin) {
      const existingVehicle = await dbConnection.get(
        'SELECT id FROM vehicles WHERE vin = ?',
        [vehicleData.vin]
      );

      if (existingVehicle) {
        throw new Error('VIN already exists');
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

    return newVehicle;
  }

  /**
   * Update vehicle
   */
  async updateVehicle(id, vehicleData) {
    // Check if vehicle exists
    const existingVehicle = await dbConnection.get('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (!existingVehicle) {
      throw new Error('Vehicle not found');
    }

    // Validate year if provided
    if (vehicleData.year) {
      const currentYear = new Date().getFullYear();
      if (vehicleData.year < 1900 || vehicleData.year > currentYear + 1) {
        throw new Error('Invalid vehicle year');
      }
    }

    // Check for duplicate VIN (excluding current vehicle)
    if (vehicleData.vin) {
      const duplicateVehicle = await dbConnection.get(
        'SELECT id FROM vehicles WHERE vin = ? AND id != ?',
        [vehicleData.vin, id]
      );

      if (duplicateVehicle) {
        throw new Error('VIN already exists');
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

    return updatedVehicle;
  }

  /**
   * Delete vehicle (soft delete)
   */
  async deleteVehicle(id) {
    // Check if vehicle exists
    const vehicle = await dbConnection.get('SELECT * FROM vehicles WHERE id = ?', [id]);
    if (!vehicle) {
      throw new Error('Vehicle not found');
    }

    // Check for active appointments
    const activeAppointments = await dbConnection.get(`
      SELECT COUNT(*) as count 
      FROM appointments 
      WHERE vehicle_id = ? AND status IN ('scheduled', 'confirmed', 'in_progress')
    `, [id]);

    if (activeAppointments.count > 0) {
      throw new Error('Cannot delete vehicle with active appointments');
    }

    // Soft delete vehicle
    await dbConnection.run('UPDATE vehicles SET is_active = 0 WHERE id = ?', [id]);

    logger.business('vehicle_deleted', {
      vehicleId: id,
      vehicle: `${vehicle.year} ${vehicle.make} ${vehicle.model}`
    });

    return { message: 'Vehicle deleted successfully' };
  }

  /**
   * Search vehicles
   */
  async searchVehicles(query, limit = 10) {
    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = `%${query}%`;

    const vehicles = await dbConnection.all(`
      SELECT 
        v.id, v.make, v.model, v.year, v.license_plate, v.vin,
        c.first_name || ' ' || c.last_name as client_name,
        v.year || ' ' || v.make || ' ' || v.model as vehicle_display
      FROM vehicles v
      LEFT JOIN clients c ON v.client_id = c.id
      WHERE v.is_active = 1 
        AND (v.make LIKE ? OR v.model LIKE ? OR v.vin LIKE ? OR v.license_plate LIKE ?)
      ORDER BY v.year DESC, v.make, v.model
      LIMIT ?
    `, [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)]);

    return vehicles;
  }

  /**
   * Get vehicle service history
   */
  async getVehicleServiceHistory(vehicleId, limit = 50) {
    // Check if vehicle exists
    const vehicle = await dbConnection.get('SELECT id FROM vehicles WHERE id = ?', [vehicleId]);
    if (!vehicle) {
      throw new Error('Vehicle not found');
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
    `, [vehicleId, parseInt(limit)]);

    return serviceHistory;
  }
}

module.exports = new VehicleController();