/**
 * Inventory Routes for MoMech
 * Handles inventory management operations
 */

const express = require('express');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const dbConnection = require('../database/connection');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Validate inventory item input
 */
function validateInventoryInput(data, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate && !data.name) {
    errors.push({ field: 'name', message: 'Item name is required' });
  }
  
  if (!isUpdate && !data.category) {
    errors.push({ field: 'category', message: 'Category is required' });
  }
  
  if (data.quantity !== undefined && (data.quantity < 0 || !Number.isInteger(data.quantity))) {
    errors.push({ field: 'quantity', message: 'Quantity must be a non-negative integer' });
  }
  
  if (data.minStockLevel !== undefined && (data.minStockLevel < 0 || !Number.isInteger(data.minStockLevel))) {
    errors.push({ field: 'minStockLevel', message: 'Minimum stock level must be a non-negative integer' });
  }
  
  if (data.unitPrice !== undefined && (data.unitPrice < 0 || isNaN(data.unitPrice))) {
    errors.push({ field: 'unitPrice', message: 'Unit price must be a non-negative number' });
  }
  
  if (data.supplierPrice !== undefined && (data.supplierPrice < 0 || isNaN(data.supplierPrice))) {
    errors.push({ field: 'supplierPrice', message: 'Supplier price must be a non-negative number' });
  }
  
  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

/**
 * Get all inventory items
 * GET /api/v1/inventory
 */
router.get('/', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    search = '', 
    category,
    lowStock = 'false',
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
  
  if (lowStock === 'true') {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'quantity <= min_stock_level';
  }
  
  if (search) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += '(name LIKE ? OR description LIKE ? OR sku LIKE ? OR barcode LIKE ?)';
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  // Validate sort parameters
  const validSortFields = ['name', 'category', 'quantity', 'unit_price', 'created_at'];
  const validSortOrders = ['ASC', 'DESC'];
  
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
  const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
  
  // Get total count
  const totalResult = await dbConnection.get(`
    SELECT COUNT(*) as total FROM inventory ${whereClause}
  `, params);
  
  // Get inventory items
  const items = await dbConnection.all(`
    SELECT 
      *,
      CASE 
        WHEN quantity <= 0 THEN 'out_of_stock'
        WHEN quantity <= min_stock_level THEN 'low_stock'
        ELSE 'in_stock'
      END as stock_status
    FROM inventory 
    ${whereClause}
    ORDER BY ${sortField} ${sortDirection}
    LIMIT ? OFFSET ?
  `, [...params, parseInt(limit), offset]);
  
  res.json({
    items,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalResult.total,
      totalPages: Math.ceil(totalResult.total / parseInt(limit))
    }
  });
}));

/**
 * Get low stock items
 * GET /api/v1/inventory/low-stock
 */
router.get('/low-stock', asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;
  
  const items = await dbConnection.all(`
    SELECT 
      *,
      CASE 
        WHEN quantity <= 0 THEN 'out_of_stock'
        WHEN quantity <= min_stock_level THEN 'low_stock'
        ELSE 'in_stock'
      END as stock_status
    FROM inventory 
    WHERE is_active = 1 AND quantity <= min_stock_level
    ORDER BY 
      CASE WHEN quantity <= 0 THEN 1 ELSE 2 END,
      quantity ASC,
      name ASC
    LIMIT ?
  `, [parseInt(limit)]);
  
  res.json(items);
}));

/**
 * Get inventory categories
 * GET /api/v1/inventory/categories
 */
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await dbConnection.all(`
    SELECT 
      category,
      COUNT(*) as item_count,
      SUM(quantity * unit_price) as total_value
    FROM inventory 
    WHERE is_active = 1
    GROUP BY category
    ORDER BY category ASC
  `);
  
  res.json(categories);
}));

/**
 * Get inventory item by ID
 * GET /api/v1/inventory/:id
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const item = await dbConnection.get(`
    SELECT 
      *,
      CASE 
        WHEN quantity <= 0 THEN 'out_of_stock'
        WHEN quantity <= min_stock_level THEN 'low_stock'
        ELSE 'in_stock'
      END as stock_status
    FROM inventory 
    WHERE id = ?
  `, [id]);
  
  if (!item) {
    throw new NotFoundError('Inventory item not found');
  }
  
  // Get recent stock movements
  const stockMovements = await dbConnection.all(`
    SELECT 
      sm.*,
      u.first_name || ' ' || u.last_name as user_name
    FROM stock_movements sm
    LEFT JOIN users u ON sm.user_id = u.id
    WHERE sm.inventory_id = ?
    ORDER BY sm.created_at DESC
    LIMIT 10
  `, [id]);
  
  res.json({
    ...item,
    stockMovements
  });
}));

/**
 * Create new inventory item
 * POST /api/v1/inventory
 */
router.post('/', asyncHandler(async (req, res) => {
  const itemData = req.body;
  
  // Validate input
  validateInventoryInput(itemData);
  
  // Check for duplicate SKU
  if (itemData.sku) {
    const existingItem = await dbConnection.get(
      'SELECT id FROM inventory WHERE sku = ?',
      [itemData.sku]
    );
    
    if (existingItem) {
      throw new ValidationError('SKU already exists', [
        { field: 'sku', message: 'This SKU is already in use' }
      ]);
    }
  }
  
  // Check for duplicate barcode
  if (itemData.barcode) {
    const existingItem = await dbConnection.get(
      'SELECT id FROM inventory WHERE barcode = ?',
      [itemData.barcode]
    );
    
    if (existingItem) {
      throw new ValidationError('Barcode already exists', [
        { field: 'barcode', message: 'This barcode is already in use' }
      ]);
    }
  }
  
  // Insert inventory item
  const result = await dbConnection.run(`
    INSERT INTO inventory (
      name, description, category, sku, barcode, quantity, min_stock_level,
      unit_price, supplier_price, supplier_name, supplier_part_number, location
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    itemData.name,
    itemData.description || null,
    itemData.category,
    itemData.sku || null,
    itemData.barcode || null,
    itemData.quantity || 0,
    itemData.minStockLevel || 5,
    itemData.unitPrice || 0,
    itemData.supplierPrice || 0,
    itemData.supplierName || null,
    itemData.supplierPartNumber || null,
    itemData.location || null
  ]);
  
  // Record initial stock movement if quantity > 0
  if (itemData.quantity > 0) {
    await dbConnection.run(`
      INSERT INTO stock_movements (
        inventory_id, movement_type, quantity, unit_cost, notes, user_id
      ) VALUES (?, 'in', ?, ?, 'Initial stock', ?)
    `, [
      result.lastID,
      itemData.quantity,
      itemData.supplierPrice || 0,
      null // TODO: Add user authentication to get user_id
    ]);
  }
  
  // Get created item
  const newItem = await dbConnection.get(
    'SELECT * FROM inventory WHERE id = ?',
    [result.lastID]
  );
  
  logger.business('inventory_item_created', {
    itemId: newItem.id,
    itemName: newItem.name,
    category: newItem.category,
    initialQuantity: newItem.quantity
  });
  
  res.status(201).json(newItem);
}));

/**
 * Update inventory item
 * PUT /api/v1/inventory/:id
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const itemData = req.body;
  
  // Validate input
  validateInventoryInput(itemData, true);
  
  // Check if item exists
  const existingItem = await dbConnection.get('SELECT * FROM inventory WHERE id = ?', [id]);
  if (!existingItem) {
    throw new NotFoundError('Inventory item not found');
  }
  
  // Check for duplicate SKU (excluding current item)
  if (itemData.sku) {
    const duplicateItem = await dbConnection.get(
      'SELECT id FROM inventory WHERE sku = ? AND id != ?',
      [itemData.sku, id]
    );
    
    if (duplicateItem) {
      throw new ValidationError('SKU already exists', [
        { field: 'sku', message: 'This SKU is already in use' }
      ]);
    }
  }
  
  // Check for duplicate barcode (excluding current item)
  if (itemData.barcode) {
    const duplicateItem = await dbConnection.get(
      'SELECT id FROM inventory WHERE barcode = ? AND id != ?',
      [itemData.barcode, id]
    );
    
    if (duplicateItem) {
      throw new ValidationError('Barcode already exists', [
        { field: 'barcode', message: 'This barcode is already in use' }
      ]);
    }
  }
  
  // Update inventory item
  await dbConnection.run(`
    UPDATE inventory SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      category = COALESCE(?, category),
      sku = COALESCE(?, sku),
      barcode = COALESCE(?, barcode),
      min_stock_level = COALESCE(?, min_stock_level),
      unit_price = COALESCE(?, unit_price),
      supplier_price = COALESCE(?, supplier_price),
      supplier_name = COALESCE(?, supplier_name),
      supplier_part_number = COALESCE(?, supplier_part_number),
      location = COALESCE(?, location)
    WHERE id = ?
  `, [
    itemData.name,
    itemData.description,
    itemData.category,
    itemData.sku,
    itemData.barcode,
    itemData.minStockLevel,
    itemData.unitPrice,
    itemData.supplierPrice,
    itemData.supplierName,
    itemData.supplierPartNumber,
    itemData.location,
    id
  ]);
  
  // Get updated item
  const updatedItem = await dbConnection.get('SELECT * FROM inventory WHERE id = ?', [id]);
  
  logger.business('inventory_item_updated', {
    itemId: id,
    itemName: updatedItem.name
  });
  
  res.json(updatedItem);
}));

/**
 * Delete inventory item (soft delete)
 * DELETE /api/v1/inventory/:id
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if item exists
  const item = await dbConnection.get('SELECT * FROM inventory WHERE id = ?', [id]);
  if (!item) {
    throw new NotFoundError('Inventory item not found');
  }
  
  // Soft delete item
  await dbConnection.run('UPDATE inventory SET is_active = 0 WHERE id = ?', [id]);
  
  logger.business('inventory_item_deleted', {
    itemId: id,
    itemName: item.name
  });
  
  res.json({ message: 'Inventory item deleted successfully' });
}));

/**
 * Update inventory quantity (stock movement)
 * POST /api/v1/inventory/:id/stock-movement
 */
router.post('/:id/stock-movement', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { movementType, quantity, unitCost, notes } = req.body;
  
  // Validate input
  if (!movementType || !['in', 'out', 'adjustment'].includes(movementType)) {
    throw new ValidationError('Invalid movement type', [
      { field: 'movementType', message: 'Movement type must be "in", "out", or "adjustment"' }
    ]);
  }
  
  if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
    throw new ValidationError('Invalid quantity', [
      { field: 'quantity', message: 'Quantity must be a positive integer' }
    ]);
  }
  
  // Check if item exists
  const item = await dbConnection.get('SELECT * FROM inventory WHERE id = ?', [id]);
  if (!item) {
    throw new NotFoundError('Inventory item not found');
  }
  
  // Calculate new quantity
  let newQuantity;
  const currentQuantity = item.quantity;
  
  switch (movementType) {
    case 'in':
      newQuantity = currentQuantity + quantity;
      break;
    case 'out':
      newQuantity = currentQuantity - quantity;
      if (newQuantity < 0) {
        throw new ValidationError('Insufficient stock', [
          { field: 'quantity', message: `Cannot remove ${quantity} items. Only ${currentQuantity} available.` }
        ]);
      }
      break;
    case 'adjustment':
      newQuantity = quantity; // Direct adjustment to specific quantity
      break;
  }
  
  // Start transaction
  await dbConnection.transaction([
    {
      sql: 'UPDATE inventory SET quantity = ? WHERE id = ?',
      params: [newQuantity, id]
    },
    {
      sql: `INSERT INTO stock_movements (
        inventory_id, movement_type, quantity, unit_cost, notes, user_id
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      params: [
        id,
        movementType,
        movementType === 'adjustment' ? (newQuantity - currentQuantity) : quantity,
        unitCost || 0,
        notes || null,
        null // TODO: Add user authentication to get user_id
      ]
    }
  ]);
  
  // Get updated item
  const updatedItem = await dbConnection.get('SELECT * FROM inventory WHERE id = ?', [id]);
  
  logger.business('stock_movement', {
    itemId: id,
    itemName: item.name,
    movementType,
    quantity: movementType === 'adjustment' ? (newQuantity - currentQuantity) : quantity,
    oldQuantity: currentQuantity,
    newQuantity
  });
  
  res.json({
    item: updatedItem,
    movement: {
      type: movementType,
      quantity: movementType === 'adjustment' ? (newQuantity - currentQuantity) : quantity,
      oldQuantity: currentQuantity,
      newQuantity
    }
  });
}));

/**
 * Get stock movements for an item
 * GET /api/v1/inventory/:id/stock-movements
 */
router.get('/:id/stock-movements', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { limit = 50 } = req.query;
  
  // Check if item exists
  const item = await dbConnection.get('SELECT id FROM inventory WHERE id = ?', [id]);
  if (!item) {
    throw new NotFoundError('Inventory item not found');
  }
  
  const movements = await dbConnection.all(`
    SELECT 
      sm.*,
      u.first_name || ' ' || u.last_name as user_name
    FROM stock_movements sm
    LEFT JOIN users u ON sm.user_id = u.id
    WHERE sm.inventory_id = ?
    ORDER BY sm.created_at DESC
    LIMIT ?
  `, [id, parseInt(limit)]);
  
  res.json(movements);
}));

/**
 * Search inventory items
 * GET /api/v1/inventory/search
 */
router.get('/search', asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;
  
  if (!q || q.length < 2) {
    return res.json([]);
  }
  
  const searchTerm = `%${q}%`;
  
  const items = await dbConnection.all(`
    SELECT 
      id,
      name,
      category,
      sku,
      barcode,
      quantity,
      unit_price,
      CASE 
        WHEN quantity <= 0 THEN 'out_of_stock'
        WHEN quantity <= min_stock_level THEN 'low_stock'
        ELSE 'in_stock'
      END as stock_status
    FROM inventory 
    WHERE is_active = 1 
      AND (name LIKE ? OR description LIKE ? OR sku LIKE ? OR barcode LIKE ?)
    ORDER BY name ASC
    LIMIT ?
  `, [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)]);
  
  res.json(items);
}));

/**
 * Get inventory summary/statistics
 * GET /api/v1/inventory/summary
 */
router.get('/summary', asyncHandler(async (req, res) => {
  const summary = await dbConnection.get(`
    SELECT 
      COUNT(*) as total_items,
      SUM(quantity) as total_quantity,
      SUM(quantity * unit_price) as total_value,
      COUNT(CASE WHEN quantity <= 0 THEN 1 END) as out_of_stock_items,
      COUNT(CASE WHEN quantity <= min_stock_level AND quantity > 0 THEN 1 END) as low_stock_items
    FROM inventory 
    WHERE is_active = 1
  `);
  
  const categoryBreakdown = await dbConnection.all(`
    SELECT 
      category,
      COUNT(*) as item_count,
      SUM(quantity) as total_quantity,
      SUM(quantity * unit_price) as total_value
    FROM inventory 
    WHERE is_active = 1
    GROUP BY category
    ORDER BY total_value DESC
  `);
  
  res.json({
    summary,
    categoryBreakdown
  });
}));

module.exports = router;