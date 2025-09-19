/**
 * Service Routes for MoMech
 * Handles service management operations
 */

const express = require('express');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const dbConnection = require('../database/connection');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Validate service input
 */
function validateServiceInput(data, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate && !data.name) {
    errors.push({ field: 'name', message: 'Service name is required' });
  }
  
  if (!isUpdate && !data.category) {
    errors.push({ field: 'category', message: 'Service category is required' });
  }
  
  if (data.basePrice !== undefined && (data.basePrice < 0 || isNaN(data.basePrice))) {
    errors.push({ field: 'basePrice', message: 'Base price must be a non-negative number' });
  }
  
  if (data.estimatedDuration !== undefined && (data.estimatedDuration < 15 || data.estimatedDuration > 480)) {
    errors.push({ field: 'estimatedDuration', message: 'Duration must be between 15 minutes and 8 hours' });
  }
  
  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

/**
 * Get all services
 * GET /api/v1/services
 */
router.get('/', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    search = '', 
    category,
    active = 'true',
    sortBy = 'name',
    sortOrder = 'ASC'
  } = req.query;
  
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
  
  res.json({
    services,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalResult.total,
      totalPages: Math.ceil(totalResult.total / parseInt(limit))
    }
  });
}));

/**
 * Get service categories
 * GET /api/v1/services/categories
 */
router.get('/categories', asyncHandler(async (req, res) => {
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
  
  res.json(categories);
}));

/**
 * Get service by ID
 * GET /api/v1/services/:id
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const service = await dbConnection.get(`
    SELECT * FROM services WHERE id = ?
  `, [id]);
  
  if (!service) {
    throw new NotFoundError('Service not found');
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
  
  res.json({
    ...service,
    usageStats
  });
}));

/**
 * Create new service
 * POST /api/v1/services
 */
router.post('/', asyncHandler(async (req, res) => {
  const serviceData = req.body;
  
  // Validate input
  validateServiceInput(serviceData);
  
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
  
  res.status(201).json(newService);
}));

/**
 * Update service
 * PUT /api/v1/services/:id
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const serviceData = req.body;
  
  // Validate input
  validateServiceInput(serviceData, true);
  
  // Check if service exists
  const existingService = await dbConnection.get('SELECT * FROM services WHERE id = ?', [id]);
  if (!existingService) {
    throw new NotFoundError('Service not found');
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
  
  res.json(updatedService);
}));

/**
 * Delete service (soft delete)
 * DELETE /api/v1/services/:id
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if service exists
  const service = await dbConnection.get('SELECT * FROM services WHERE id = ?', [id]);
  if (!service) {
    throw new NotFoundError('Service not found');
  }
  
  // Soft delete service
  await dbConnection.run('UPDATE services SET is_active = 0 WHERE id = ?', [id]);
  
  logger.business('service_deleted', {
    serviceId: id,
    serviceName: service.name
  });
  
  res.json({ message: 'Service deleted successfully' });
}));

/**
 * Search services
 * GET /api/v1/services/search
 */
router.get('/search', asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;
  
  if (!q || q.length < 2) {
    return res.json([]);
  }
  
  const searchTerm = `%${q}%`;
  
  const services = await dbConnection.all(`
    SELECT 
      id,
      name,
      category,
      base_price,
      estimated_duration
    FROM services 
    WHERE is_active = 1 
      AND (name LIKE ? OR description LIKE ?)
    ORDER BY name ASC
    LIMIT ?
  `, [searchTerm, searchTerm, parseInt(limit)]);
  
  res.json(services);
}));

module.exports = router;