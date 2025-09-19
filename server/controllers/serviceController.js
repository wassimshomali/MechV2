/**
 * Service Controller for MoMech
 * Business logic for service management operations
 */

const dbConnection = require('../database/connection');
const logger = require('../utils/logger');

class ServiceController {
  /**
   * Get all services with pagination and filtering
   */
  async getServices(filters = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      category,
      active = 'true',
      sortBy = 'name',
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

    if (category) {
      whereClause += whereClause ? ' AND ' : 'WHERE ';
      whereClause += 'category = ?';
      params.push(category);
    }

    if (search) {
      whereClause += whereClause ? ' AND ' : 'WHERE ';
      whereClause += '(name LIKE ? OR description LIKE ?)';
      params.push(searchTerm, searchTerm);
    }

    // Validate sort parameters
    const validSortFields = ['name', 'category', 'base_price', 'estimated_duration', 'created_at'];
    const validSortOrders = ['ASC', 'DESC'];

    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';

    // Get total count
    const totalResult = await dbConnection.get(`
      SELECT COUNT(*) as total FROM services ${whereClause}
    `, params);

    // Get services
    const services = await dbConnection.all(`
      SELECT * FROM services 
      ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    return {
      services,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        totalPages: Math.ceil(totalResult.total / parseInt(limit))
      }
    };
  }

  /**
   * Get service categories
   */
  async getServiceCategories() {
    const categories = await dbConnection.all(`
      SELECT 
        category,
        COUNT(*) as service_count,
        AVG(base_price) as average_price,
        AVG(estimated_duration) as average_duration
      FROM services 
      WHERE is_active = 1
      GROUP BY category
      ORDER BY category ASC
    `);

    return categories;
  }

  /**
   * Get service by ID
   */
  async getServiceById(id) {
    const service = await dbConnection.get(`
      SELECT * FROM services WHERE id = ?
    `, [id]);

    if (!service) {
      throw new Error('Service not found');
    }

    // Get recent usage statistics
    const usageStats = await dbConnection.get(`
      SELECT 
        COUNT(*) as times_used,
        AVG(total_cost) as average_cost,
        MAX(service_date) as last_used
      FROM vehicle_service_history 
      WHERE service_id = ?
    `, [id]);

    return {
      ...service,
      usageStats
    };
  }

  /**
   * Create new service
   */
  async createService(serviceData) {
    // Validate required fields
    if (!serviceData.name || !serviceData.category) {
      throw new Error('Service name and category are required');
    }

    // Validate numeric fields
    if (serviceData.basePrice !== undefined && (serviceData.basePrice < 0 || isNaN(serviceData.basePrice))) {
      throw new Error('Base price must be a non-negative number');
    }

    if (serviceData.estimatedDuration !== undefined && (serviceData.estimatedDuration < 15 || serviceData.estimatedDuration > 480)) {
      throw new Error('Duration must be between 15 minutes and 8 hours');
    }

    // Insert service
    const result = await dbConnection.run(`
      INSERT INTO services (
        name, description, category, base_price, estimated_duration, 
        labor_rate, parts_markup, instructions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      serviceData.name,
      serviceData.description || null,
      serviceData.category,
      serviceData.basePrice || 0,
      serviceData.estimatedDuration || 60,
      serviceData.laborRate || null,
      serviceData.partsMarkup || null,
      serviceData.instructions || null
    ]);

    // Get created service
    const newService = await dbConnection.get(
      'SELECT * FROM services WHERE id = ?',
      [result.lastID]
    );

    logger.business('service_created', {
      serviceId: newService.id,
      serviceName: newService.name,
      category: newService.category
    });

    return newService;
  }

  /**
   * Update service
   */
  async updateService(id, serviceData) {
    // Check if service exists
    const existingService = await dbConnection.get('SELECT * FROM services WHERE id = ?', [id]);
    if (!existingService) {
      throw new Error('Service not found');
    }

    // Validate numeric fields if provided
    if (serviceData.basePrice !== undefined && (serviceData.basePrice < 0 || isNaN(serviceData.basePrice))) {
      throw new Error('Base price must be a non-negative number');
    }

    if (serviceData.estimatedDuration !== undefined && (serviceData.estimatedDuration < 15 || serviceData.estimatedDuration > 480)) {
      throw new Error('Duration must be between 15 minutes and 8 hours');
    }

    // Update service
    await dbConnection.run(`
      UPDATE services SET
        name = COALESCE(?, name),
        description = COALESCE(?, description),
        category = COALESCE(?, category),
        base_price = COALESCE(?, base_price),
        estimated_duration = COALESCE(?, estimated_duration),
        labor_rate = COALESCE(?, labor_rate),
        parts_markup = COALESCE(?, parts_markup),
        instructions = COALESCE(?, instructions)
      WHERE id = ?
    `, [
      serviceData.name,
      serviceData.description,
      serviceData.category,
      serviceData.basePrice,
      serviceData.estimatedDuration,
      serviceData.laborRate,
      serviceData.partsMarkup,
      serviceData.instructions,
      id
    ]);

    // Get updated service
    const updatedService = await dbConnection.get('SELECT * FROM services WHERE id = ?', [id]);

    logger.business('service_updated', {
      serviceId: id,
      serviceName: updatedService.name
    });

    return updatedService;
  }

  /**
   * Delete service (soft delete)
   */
  async deleteService(id) {
    // Check if service exists
    const service = await dbConnection.get('SELECT * FROM services WHERE id = ?', [id]);
    if (!service) {
      throw new Error('Service not found');
    }

    // Soft delete service
    await dbConnection.run('UPDATE services SET is_active = 0 WHERE id = ?', [id]);

    logger.business('service_deleted', {
      serviceId: id,
      serviceName: service.name
    });

    return { message: 'Service deleted successfully' };
  }

  /**
   * Search services
   */
  async searchServices(query, limit = 10) {
    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = `%${query}%`;

    const services = await dbConnection.all(`
      SELECT 
        id, name, category, base_price, estimated_duration
      FROM services 
      WHERE is_active = 1 
        AND (name LIKE ? OR description LIKE ?)
      ORDER BY name ASC
      LIMIT ?
    `, [searchTerm, searchTerm, parseInt(limit)]);

    return services;
  }
}

module.exports = new ServiceController();