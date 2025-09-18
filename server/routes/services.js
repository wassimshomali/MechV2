/**
 * Services Routes for MoMech
 * Handles service templates and categories
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
  
  if (data.estimatedDuration && (data.estimatedDuration < 15 || data.estimatedDuration > 480)) {
    errors.push({ field: 'estimatedDuration', message: 'Duration must be between 15 and 480 minutes' });
  }
  
  if (data.laborRate && (data.laborRate < 0 || data.laborRate > 999.99)) {
    errors.push({ field: 'laborRate', message: 'Labor rate must be between 0 and 999.99' });
  }
  
  if (data.partsMarkup && (data.partsMarkup < 0 || data.partsMarkup > 1)) {
    errors.push({ field: 'partsMarkup', message: 'Parts markup must be between 0 and 1' });
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
    categoryId,
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
    whereClause += 'WHERE s.is_active = ?';
    params.push(active === 'true' ? 1 : 0);
  }
  
  if (categoryId) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 's.category_id = ?';
    params.push(categoryId);
  }
  
  if (search) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += '(s.name LIKE ? OR s.description LIKE ?)';
    params.push(searchTerm, searchTerm);
  }
  
  // Validate sort parameters
  const validSortFields = ['name', 'estimated_duration', 'labor_rate', 'category_name', 'created_at'];
  const validSortOrders = ['ASC', 'DESC'];
  
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
  const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
  
  // Get total count
  const totalResult = await dbConnection.get(`
    SELECT COUNT(*) as total 
    FROM services s
    LEFT JOIN service_categories c ON s.category_id = c.id
    ${whereClause}
  `, params);
  
  // Get services
  const services = await dbConnection.all(`
    SELECT 
      s.*,
      c.name as category_name,
      c.color as category_color
    FROM services s
    LEFT JOIN service_categories c ON s.category_id = c.id
    ${whereClause}
    ORDER BY ${sortField === 'category_name' ? 'c.name' : 's.' + sortField} ${sortDirection}
    LIMIT ? OFFSET ?
  `, [...params, parseInt(limit), offset]);
  
  // Get usage statistics for each service
  const servicesWithStats = await Promise.all(
    services.map(async (service) => {
      const usage = await dbConnection.get(
        'SELECT COUNT(*) as count FROM appointments WHERE service_id = ?',
        [service.id]
      );
      
      return {
        ...service,
        usageCount: usage.count
      };
    })
  );
  
  res.json({
    services: servicesWithStats,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalResult.total,
      totalPages: Math.ceil(totalResult.total / parseInt(limit))
    }
  });
}));

/**
 * Get service by ID
 * GET /api/v1/services/:id
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const service = await dbConnection.get(`
    SELECT 
      s.*,
      c.name as category_name,
      c.description as category_description,
      c.color as category_color
    FROM services s
    LEFT JOIN service_categories c ON s.category_id = c.id
    WHERE s.id = ?
  `, [id]);
  
  if (!service) {
    throw new NotFoundError('Service not found');
  }
  
  // Get recent appointments using this service
  const recentAppointments = await dbConnection.all(`
    SELECT 
      a.id,
      a.appointment_date,
      a.status,
      c.first_name || ' ' || c.last_name as client_name,
      v.make || ' ' || v.model as vehicle_info
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    WHERE a.service_id = ?
    ORDER BY a.appointment_date DESC
    LIMIT 10
  `, [id]);
  
  // Get usage statistics
  const stats = await dbConnection.get(`
    SELECT 
      COUNT(*) as total_appointments,
      COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_appointments,
      AVG(CASE WHEN w.total_cost > 0 THEN w.total_cost END) as avg_cost
    FROM appointments a
    LEFT JOIN work_orders w ON a.id = w.appointment_id
    WHERE a.service_id = ?
  `, [id]);
  
  res.json({
    ...service,
    recentAppointments,
    stats
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
  
  // Check if category exists (if provided)
  if (serviceData.categoryId) {
    const category = await dbConnection.get('SELECT id FROM service_categories WHERE id = ?', [serviceData.categoryId]);
    if (!category) {
      throw new ValidationError('Category not found', [
        { field: 'categoryId', message: 'Service category does not exist' }
      ]);
    }
  }
  
  // Insert service
  const result = await dbConnection.run(`
    INSERT INTO services (
      category_id, name, description, estimated_duration, labor_rate, parts_markup
    ) VALUES (?, ?, ?, ?, ?, ?)
  `, [
    serviceData.categoryId || null,
    serviceData.name,
    serviceData.description || null,
    serviceData.estimatedDuration || 60,
    serviceData.laborRate || 0,
    serviceData.partsMarkup || 0.20
  ]);
  
  // Get created service with category info
  const newService = await dbConnection.get(`
    SELECT 
      s.*,
      c.name as category_name
    FROM services s
    LEFT JOIN service_categories c ON s.category_id = c.id
    WHERE s.id = ?
  `, [result.lastID]);
  
  logger.business('service_created', {
    serviceId: newService.id,
    serviceName: newService.name
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
      category_id = COALESCE(?, category_id),
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      estimated_duration = COALESCE(?, estimated_duration),
      labor_rate = COALESCE(?, labor_rate),
      parts_markup = COALESCE(?, parts_markup),
      is_active = COALESCE(?, is_active)
    WHERE id = ?
  `, [
    serviceData.categoryId,
    serviceData.name,
    serviceData.description,
    serviceData.estimatedDuration,
    serviceData.laborRate,
    serviceData.partsMarkup,
    serviceData.isActive,
    id
  ]);
  
  // Get updated service
  const updatedService = await dbConnection.get(`
    SELECT 
      s.*,
      c.name as category_name
    FROM services s
    LEFT JOIN service_categories c ON s.category_id = c.id
    WHERE s.id = ?
  `, [id]);
  
  logger.business('service_updated', {
    serviceId: id,
    serviceName: updatedService.name
  });
  
  res.json(updatedService);
}));

/**
 * Delete service
 * DELETE /api/v1/services/:id
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if service exists
  const service = await dbConnection.get('SELECT * FROM services WHERE id = ?', [id]);
  if (!service) {
    throw new NotFoundError('Service not found');
  }
  
  // Check if service is used in appointments
  const appointments = await dbConnection.get('SELECT COUNT(*) as count FROM appointments WHERE service_id = ?', [id]);
  if (appointments.count > 0) {
    throw new ValidationError('Cannot delete service with appointments', [
      { field: 'service', message: 'Service is referenced in appointments and cannot be deleted' }
    ]);
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
 * Get service categories
 * GET /api/v1/service-categories
 */
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await dbConnection.all(`
    SELECT 
      c.*,
      COUNT(s.id) as service_count
    FROM service_categories c
    LEFT JOIN services s ON c.id = s.category_id AND s.is_active = 1
    WHERE c.is_active = 1
    GROUP BY c.id
    ORDER BY c.name ASC
  `);
  
  res.json(categories);
}));

/**
 * Create service category
 * POST /api/v1/service-categories
 */
router.post('/categories', asyncHandler(async (req, res) => {
  const { name, description, color } = req.body;
  
  if (!name) {
    throw new ValidationError('Category name is required', [
      { field: 'name', message: 'Category name is required' }
    ]);
  }
  
  // Check for duplicate name
  const existingCategory = await dbConnection.get(
    'SELECT id FROM service_categories WHERE name = ?',
    [name]
  );
  
  if (existingCategory) {
    throw new ValidationError('Category name already exists', [
      { field: 'name', message: 'This category name is already in use' }
    ]);
  }
  
  // Insert category
  const result = await dbConnection.run(`
    INSERT INTO service_categories (name, description, color)
    VALUES (?, ?, ?)
  `, [name, description || null, color || '#3b82f6']);
  
  // Get created category
  const newCategory = await dbConnection.get(
    'SELECT * FROM service_categories WHERE id = ?',
    [result.lastID]
  );
  
  logger.business('service_category_created', {
    categoryId: newCategory.id,
    categoryName: newCategory.name
  });
  
  res.status(201).json(newCategory);
}));

/**
 * Update service category
 * PUT /api/v1/service-categories/:id
 */
router.put('/categories/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, color, isActive } = req.body;
  
  // Check if category exists
  const existingCategory = await dbConnection.get('SELECT * FROM service_categories WHERE id = ?', [id]);
  if (!existingCategory) {
    throw new NotFoundError('Service category not found');
  }
  
  // Check for duplicate name (excluding current category)
  if (name) {
    const duplicateCategory = await dbConnection.get(
      'SELECT id FROM service_categories WHERE name = ? AND id != ?',
      [name, id]
    );
    
    if (duplicateCategory) {
      throw new ValidationError('Category name already exists', [
        { field: 'name', message: 'This category name is already in use' }
      ]);
    }
  }
  
  // Update category
  await dbConnection.run(`
    UPDATE service_categories SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      color = COALESCE(?, color),
      is_active = COALESCE(?, is_active)
    WHERE id = ?
  `, [name, description, color, isActive, id]);
  
  // Get updated category
  const updatedCategory = await dbConnection.get(
    'SELECT * FROM service_categories WHERE id = ?',
    [id]
  );
  
  logger.business('service_category_updated', {
    categoryId: id,
    categoryName: updatedCategory.name
  });
  
  res.json(updatedCategory);
}));

/**
 * Delete service category
 * DELETE /api/v1/service-categories/:id
 */
router.delete('/categories/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if category exists
  const category = await dbConnection.get('SELECT * FROM service_categories WHERE id = ?', [id]);
  if (!category) {
    throw new NotFoundError('Service category not found');
  }
  
  // Check if category has services
  const services = await dbConnection.get('SELECT COUNT(*) as count FROM services WHERE category_id = ?', [id]);
  if (services.count > 0) {
    throw new ValidationError('Cannot delete category with services', [
      { field: 'category', message: 'Category has associated services and cannot be deleted' }
    ]);
  }
  
  // Soft delete category
  await dbConnection.run('UPDATE service_categories SET is_active = 0 WHERE id = ?', [id]);
  
  logger.business('service_category_deleted', {
    categoryId: id,
    categoryName: category.name
  });
  
  res.json({ message: 'Service category deleted successfully' });
}));

module.exports = router;