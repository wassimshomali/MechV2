/**
 * Client Controller for MoMech
 * Business logic for client management operations
 */

const dbConnection = require('../database/connection');
const logger = require('../utils/logger');

class ClientController {
  /**
   * Get all clients with pagination and filtering
   */
  async getClients(filters = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      active = 'true',
      sortBy = 'last_name',
      sortOrder = 'ASC'
    } = filters;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const searchTerm = `%${search}%`;

    // Build WHERE clause
    let whereClause = '';
    const params = [];

    if (active !== 'all') {
      whereClause += 'WHERE is_active = ?';
      params.push(active === 'true' ? 1 : 0);
    }

    if (search) {
      whereClause += whereClause ? ' AND ' : 'WHERE ';
      whereClause += '(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Validate sort parameters
    const validSortFields = ['first_name', 'last_name', 'email', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];

    const sortField = validSortFields.includes(sortBy) ? sortBy : 'last_name';
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    // Get total count
    const totalResult = await dbConnection.get(`
      SELECT COUNT(*) as total FROM clients ${whereClause}
    `, params);

    // Get clients
    const clients = await dbConnection.all(`
      SELECT 
        id, first_name, last_name, email, phone, address, city, state, zip_code,
        preferred_contact_method, is_active, created_at, updated_at
      FROM clients 
      ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // Get vehicle count for each client
    const clientsWithVehicles = await Promise.all(
      clients.map(async (client) => {
        const vehicleCount = await dbConnection.get(
          'SELECT COUNT(*) as count FROM vehicles WHERE client_id = ? AND is_active = 1',
          [client.id]
        );
        return {
          ...client,
          vehicleCount: vehicleCount.count
        };
      })
    );

    return {
      clients: clientsWithVehicles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        totalPages: Math.ceil(totalResult.total / parseInt(limit))
      }
    };
  }

  /**
   * Get client by ID with related data
   */
  async getClientById(id) {
    const client = await dbConnection.get(`
      SELECT * FROM clients WHERE id = ?
    `, [id]);

    if (!client) {
      throw new Error('Client not found');
    }

    // Get client's vehicles
    const vehicles = await dbConnection.all(`
      SELECT * FROM vehicles WHERE client_id = ? AND is_active = 1 ORDER BY year DESC, make, model
    `, [id]);

    // Get recent appointments
    const recentAppointments = await dbConnection.all(`
      SELECT 
        a.*,
        v.make || ' ' || v.model as vehicle,
        s.name as service_name
      FROM appointments a
      LEFT JOIN vehicles v ON a.vehicle_id = v.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.client_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT 5
    `, [id]);

    // Get service history summary
    const serviceHistory = await dbConnection.get(`
      SELECT 
        COUNT(*) as total_services,
        COALESCE(SUM(total_cost), 0) as total_spent,
        MAX(service_date) as last_service_date
      FROM vehicle_service_history vsh
      INNER JOIN vehicles v ON vsh.vehicle_id = v.id
      WHERE v.client_id = ?
    `, [id]);

    return {
      ...client,
      vehicles,
      recentAppointments,
      serviceHistory
    };
  }

  /**
   * Create new client
   */
  async createClient(clientData) {
    // Validate required fields
    if (!clientData.firstName || !clientData.lastName) {
      throw new Error('First name and last name are required');
    }

    // Check for duplicate email
    if (clientData.email) {
      const existingClient = await dbConnection.get(
        'SELECT id FROM clients WHERE email = ?',
        [clientData.email]
      );

      if (existingClient) {
        throw new Error('Email already exists');
      }
    }

    // Insert client
    const result = await dbConnection.run(`
      INSERT INTO clients (
        first_name, last_name, email, phone, address, city, state, zip_code,
        date_of_birth, notes, preferred_contact_method
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      clientData.firstName,
      clientData.lastName,
      clientData.email || null,
      clientData.phone || null,
      clientData.address || null,
      clientData.city || null,
      clientData.state || null,
      clientData.zipCode || null,
      clientData.dateOfBirth || null,
      clientData.notes || null,
      clientData.preferredContactMethod || 'phone'
    ]);

    // Get created client
    const newClient = await dbConnection.get(
      'SELECT * FROM clients WHERE id = ?',
      [result.lastID]
    );

    logger.business('client_created', {
      clientId: newClient.id,
      clientName: `${newClient.first_name} ${newClient.last_name}`
    });

    return newClient;
  }

  /**
   * Update client
   */
  async updateClient(id, clientData) {
    // Check if client exists
    const existingClient = await dbConnection.get('SELECT * FROM clients WHERE id = ?', [id]);
    if (!existingClient) {
      throw new Error('Client not found');
    }

    // Check for duplicate email (excluding current client)
    if (clientData.email) {
      const duplicateClient = await dbConnection.get(
        'SELECT id FROM clients WHERE email = ? AND id != ?',
        [clientData.email, id]
      );

      if (duplicateClient) {
        throw new Error('Email already exists');
      }
    }

    // Update client
    await dbConnection.run(`
      UPDATE clients SET
        first_name = COALESCE(?, first_name),
        last_name = COALESCE(?, last_name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        city = COALESCE(?, city),
        state = COALESCE(?, state),
        zip_code = COALESCE(?, zip_code),
        date_of_birth = COALESCE(?, date_of_birth),
        notes = COALESCE(?, notes),
        preferred_contact_method = COALESCE(?, preferred_contact_method)
      WHERE id = ?
    `, [
      clientData.firstName,
      clientData.lastName,
      clientData.email,
      clientData.phone,
      clientData.address,
      clientData.city,
      clientData.state,
      clientData.zipCode,
      clientData.dateOfBirth,
      clientData.notes,
      clientData.preferredContactMethod,
      id
    ]);

    // Get updated client
    const updatedClient = await dbConnection.get('SELECT * FROM clients WHERE id = ?', [id]);

    logger.business('client_updated', {
      clientId: id,
      clientName: `${updatedClient.first_name} ${updatedClient.last_name}`
    });

    return updatedClient;
  }

  /**
   * Delete client (soft delete)
   */
  async deleteClient(id) {
    // Check if client exists
    const client = await dbConnection.get('SELECT * FROM clients WHERE id = ?', [id]);
    if (!client) {
      throw new Error('Client not found');
    }

    // Check for active appointments
    const activeAppointments = await dbConnection.get(`
      SELECT COUNT(*) as count 
      FROM appointments 
      WHERE client_id = ? AND status IN ('scheduled', 'confirmed', 'in_progress')
    `, [id]);

    if (activeAppointments.count > 0) {
      throw new Error('Cannot delete client with active appointments');
    }

    // Soft delete client and their vehicles
    await dbConnection.transaction([
      {
        sql: 'UPDATE clients SET is_active = 0 WHERE id = ?',
        params: [id]
      },
      {
        sql: 'UPDATE vehicles SET is_active = 0 WHERE client_id = ?',
        params: [id]
      }
    ]);

    logger.business('client_deleted', {
      clientId: id,
      clientName: `${client.first_name} ${client.last_name}`
    });

    return { message: 'Client deleted successfully' };
  }

  /**
   * Search clients
   */
  async searchClients(query, limit = 10) {
    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = `%${query}%`;

    const clients = await dbConnection.all(`
      SELECT 
        id, first_name, last_name, email, phone,
        first_name || ' ' || last_name as full_name
      FROM clients 
      WHERE is_active = 1 
        AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)
      ORDER BY last_name, first_name
      LIMIT ?
    `, [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)]);

    return clients;
  }

  /**
   * Get client's vehicles
   */
  async getClientVehicles(clientId) {
    // Check if client exists
    const client = await dbConnection.get('SELECT id FROM clients WHERE id = ?', [clientId]);
    if (!client) {
      throw new Error('Client not found');
    }

    const vehicles = await dbConnection.all(`
      SELECT * FROM vehicles 
      WHERE client_id = ? AND is_active = 1 
      ORDER BY year DESC, make, model
    `, [clientId]);

    return vehicles;
  }

  /**
   * Get client's appointments
   */
  async getClientAppointments(clientId, options = {}) {
    const { limit = 10, status } = options;

    // Check if client exists
    const client = await dbConnection.get('SELECT id FROM clients WHERE id = ?', [clientId]);
    if (!client) {
      throw new Error('Client not found');
    }

    let whereClause = 'WHERE a.client_id = ?';
    const params = [clientId];

    if (status) {
      whereClause += ' AND a.status = ?';
      params.push(status);
    }

    const appointments = await dbConnection.all(`
      SELECT 
        a.*,
        v.make || ' ' || v.model as vehicle,
        s.name as service_name,
        u.first_name || ' ' || u.last_name as assigned_mechanic
      FROM appointments a
      LEFT JOIN vehicles v ON a.vehicle_id = v.id
      LEFT JOIN services s ON a.service_id = s.id
      LEFT JOIN users u ON a.assigned_to = u.id
      ${whereClause}
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT ?
    `, [...params, parseInt(limit)]);

    return appointments;
  }
}

module.exports = new ClientController();