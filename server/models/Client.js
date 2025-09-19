/**
 * Client Model for MoMech
 * Database model for client management
 */

const dbConnection = require('../database/connection');

class Client {
  constructor(data = {}) {
    this.id = data.id;
    this.firstName = data.first_name || data.firstName;
    this.lastName = data.last_name || data.lastName;
    this.email = data.email;
    this.phone = data.phone;
    this.address = data.address;
    this.city = data.city;
    this.state = data.state;
    this.zipCode = data.zip_code || data.zipCode;
    this.dateOfBirth = data.date_of_birth || data.dateOfBirth;
    this.notes = data.notes;
    this.preferredContactMethod = data.preferred_contact_method || data.preferredContactMethod || 'phone';
    this.isActive = data.is_active !== undefined ? data.is_active : true;
    this.createdAt = data.created_at || data.createdAt;
    this.updatedAt = data.updated_at || data.updatedAt;
  }

  /**
   * Get all clients with optional filtering
   */
  static async findAll(filters = {}) {
    const {
      search = '',
      active = true,
      limit = 50,
      offset = 0,
      sortBy = 'last_name',
      sortOrder = 'ASC'
    } = filters;

    let whereClause = 'WHERE is_active = ?';
    const params = [active ? 1 : 0];

    if (search) {
      whereClause += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const validSortFields = ['first_name', 'last_name', 'email', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'last_name';
    const sortDirection = sortOrder.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    const sql = `
      SELECT * FROM clients 
      ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      LIMIT ? OFFSET ?
    `;

    const rows = await dbConnection.all(sql, [...params, limit, offset]);
    return rows.map(row => new Client(row));
  }

  /**
   * Find client by ID
   */
  static async findById(id) {
    const row = await dbConnection.get('SELECT * FROM clients WHERE id = ?', [id]);
    return row ? new Client(row) : null;
  }

  /**
   * Find client by email
   */
  static async findByEmail(email) {
    const row = await dbConnection.get('SELECT * FROM clients WHERE email = ? AND is_active = 1', [email]);
    return row ? new Client(row) : null;
  }

  /**
   * Search clients by name, email, or phone
   */
  static async search(query, limit = 10) {
    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = `%${query}%`;
    const rows = await dbConnection.all(`
      SELECT * FROM clients 
      WHERE is_active = 1 
        AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)
      ORDER BY last_name, first_name
      LIMIT ?
    `, [searchTerm, searchTerm, searchTerm, searchTerm, limit]);

    return rows.map(row => new Client(row));
  }

  /**
   * Get client count
   */
  static async count(filters = {}) {
    const { active = true, search = '' } = filters;

    let whereClause = 'WHERE is_active = ?';
    const params = [active ? 1 : 0];

    if (search) {
      whereClause += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    const result = await dbConnection.get(`SELECT COUNT(*) as count FROM clients ${whereClause}`, params);
    return result.count;
  }

  /**
   * Save client (create or update)
   */
  async save() {
    const now = new Date().toISOString();

    if (this.id) {
      // Update existing client
      await dbConnection.run(`
        UPDATE clients SET
          first_name = ?, last_name = ?, email = ?, phone = ?, address = ?,
          city = ?, state = ?, zip_code = ?, date_of_birth = ?, notes = ?,
          preferred_contact_method = ?, updated_at = ?
        WHERE id = ?
      `, [
        this.firstName, this.lastName, this.email, this.phone, this.address,
        this.city, this.state, this.zipCode, this.dateOfBirth, this.notes,
        this.preferredContactMethod, now, this.id
      ]);
    } else {
      // Create new client
      const result = await dbConnection.run(`
        INSERT INTO clients (
          first_name, last_name, email, phone, address, city, state, zip_code,
          date_of_birth, notes, preferred_contact_method, is_active, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        this.firstName, this.lastName, this.email, this.phone, this.address,
        this.city, this.state, this.zipCode, this.dateOfBirth, this.notes,
        this.preferredContactMethod, this.isActive ? 1 : 0, now, now
      ]);

      this.id = result.lastID;
      this.createdAt = now;
    }

    this.updatedAt = now;
    return this;
  }

  /**
   * Soft delete client
   */
  async delete() {
    if (!this.id) {
      throw new Error('Cannot delete client without ID');
    }

    await dbConnection.run('UPDATE clients SET is_active = 0, updated_at = ? WHERE id = ?', [
      new Date().toISOString(), this.id
    ]);

    this.isActive = false;
    return this;
  }

  /**
   * Get client's vehicles
   */
  async getVehicles() {
    if (!this.id) {
      return [];
    }

    const rows = await dbConnection.all(`
      SELECT * FROM vehicles WHERE client_id = ? AND is_active = 1
      ORDER BY year DESC, make, model
    `, [this.id]);

    return rows;
  }

  /**
   * Get client's appointments
   */
  async getAppointments(limit = 10) {
    if (!this.id) {
      return [];
    }

    const rows = await dbConnection.all(`
      SELECT 
        a.*,
        v.make || ' ' || v.model as vehicle,
        s.name as service_name
      FROM appointments a
      LEFT JOIN vehicles v ON a.vehicle_id = v.id
      LEFT JOIN services s ON a.service_id = s.id
      WHERE a.client_id = ?
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
      LIMIT ?
    `, [this.id, limit]);

    return rows;
  }

  /**
   * Get client's invoices
   */
  async getInvoices(limit = 10) {
    if (!this.id) {
      return [];
    }

    const rows = await dbConnection.all(`
      SELECT * FROM invoices 
      WHERE client_id = ?
      ORDER BY invoice_date DESC
      LIMIT ?
    `, [this.id, limit]);

    return rows;
  }

  /**
   * Get client's service history summary
   */
  async getServiceSummary() {
    if (!this.id) {
      return {
        totalServices: 0,
        totalSpent: 0,
        lastServiceDate: null
      };
    }

    const result = await dbConnection.get(`
      SELECT 
        COUNT(*) as total_services,
        COALESCE(SUM(total_cost), 0) as total_spent,
        MAX(service_date) as last_service_date
      FROM vehicle_service_history vsh
      INNER JOIN vehicles v ON vsh.vehicle_id = v.id
      WHERE v.client_id = ?
    `, [this.id]);

    return {
      totalServices: result.total_services || 0,
      totalSpent: result.total_spent || 0,
      lastServiceDate: result.last_service_date
    };
  }

  /**
   * Validate client data
   */
  validate() {
    const errors = [];

    if (!this.firstName || this.firstName.trim().length === 0) {
      errors.push({ field: 'firstName', message: 'First name is required' });
    }

    if (!this.lastName || this.lastName.trim().length === 0) {
      errors.push({ field: 'lastName', message: 'Last name is required' });
    }

    if (this.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) {
      errors.push({ field: 'email', message: 'Invalid email format' });
    }

    if (this.phone && !/^[\d\s\-\(\)\+\.]+$/.test(this.phone)) {
      errors.push({ field: 'phone', message: 'Invalid phone number format' });
    }

    const validContactMethods = ['phone', 'email', 'text'];
    if (this.preferredContactMethod && !validContactMethods.includes(this.preferredContactMethod)) {
      errors.push({ field: 'preferredContactMethod', message: 'Invalid contact method' });
    }

    return errors;
  }

  /**
   * Get full name
   */
  getFullName() {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }

  /**
   * Get display address
   */
  getDisplayAddress() {
    const parts = [this.address, this.city, this.state, this.zipCode].filter(Boolean);
    return parts.join(', ');
  }

  /**
   * Convert to JSON
   */
  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      fullName: this.getFullName(),
      email: this.email,
      phone: this.phone,
      address: this.address,
      city: this.city,
      state: this.state,
      zipCode: this.zipCode,
      displayAddress: this.getDisplayAddress(),
      dateOfBirth: this.dateOfBirth,
      notes: this.notes,
      preferredContactMethod: this.preferredContactMethod,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Client;