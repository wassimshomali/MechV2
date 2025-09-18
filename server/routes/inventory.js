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
  
  if (data.costPrice && (data.costPrice < 0 || data.costPrice > 99999.99)) {
    errors.push({ field: 'costPrice', message: 'Cost price must be between 0 and 99999.99' });
  }
  
  if (data.sellingPrice && (data.sellingPrice < 0 || data.sellingPrice > 99999.99)) {
    errors.push({ field: 'sellingPrice', message: 'Selling price must be between 0 and 99999.99' });
  }
  
  if (data.quantityOnHand && data.quantityOnHand < 0) {
    errors.push({ field: 'quantityOnHand', message: 'Quantity on hand cannot be negative' });
  }
  
  if (data.minimumQuantity && data.minimumQuantity < 0) {
    errors.push({ field: 'minimumQuantity', message: 'Minimum quantity cannot be negative' });
  }
  
  if (data.reorderPoint && data.reorderPoint < 0) {
    errors.push({ field: 'reorderPoint', message: 'Reorder point cannot be negative' });
  }
  
  if (data.reorderQuantity && data.reorderQuantity < 0) {
    errors.push({ field: 'reorderQuantity', message: 'Reorder quantity cannot be negative' });
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
    categoryId,
    supplierId,
    lowStock = false,
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
    whereClause += 'WHERE i.is_active = ?';
    params.push(active === 'true' ? 1 : 0);
  }
  
  if (categoryId) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'i.category_id = ?';
    params.push(categoryId);
  }
  
  if (supplierId) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'i.supplier_id = ?';
    params.push(supplierId);
  }
  
  if (lowStock === 'true') {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'i.quantity_on_hand <= i.minimum_quantity';
  }
  
  if (search) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += '(i.name LIKE ? OR i.description LIKE ? OR i.part_number LIKE ? OR i.barcode LIKE ?)';
    params.push(searchTerm, searchTerm, searchTerm, searchTerm);
  }
  
  // Validate sort parameters
  const validSortFields = ['name', 'part_number', 'quantity_on_hand', 'cost_price', 'selling_price', 'created_at'];
  const validSortOrders = ['ASC', 'DESC'];
  
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
  const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'ASC';
  
  // Get total count
  const totalResult = await dbConnection.get(`
    SELECT COUNT(*) as total 
    FROM inventory_items i
    LEFT JOIN inventory_categories c ON i.category_id = c.id
    LEFT JOIN suppliers s ON i.supplier_id = s.id
    ${whereClause}
  `, params);
  
  // Get inventory items
  const items = await dbConnection.all(`
    SELECT 
      i.*,
      c.name as category_name,
      s.name as supplier_name,
      CASE 
        WHEN i.quantity_on_hand <= i.minimum_quantity THEN 1 
        ELSE 0 
      END as is_low_stock
    FROM inventory_items i
    LEFT JOIN inventory_categories c ON i.category_id = c.id
    LEFT JOIN suppliers s ON i.supplier_id = s.id
    ${whereClause}
    ORDER BY i.${sortField} ${sortDirection}
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
 * Get inventory item by ID
 * GET /api/v1/inventory/:id
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const item = await dbConnection.get(`
    SELECT 
      i.*,
      c.name as category_name,
      c.description as category_description,
      s.name as supplier_name,
      s.contact_person as supplier_contact,
      s.phone as supplier_phone,
      s.email as supplier_email
    FROM inventory_items i
    LEFT JOIN inventory_categories c ON i.category_id = c.id
    LEFT JOIN suppliers s ON i.supplier_id = s.id
    WHERE i.id = ?
  `, [id]);
  
  if (!item) {
    throw new NotFoundError('Inventory item not found');
  }
  
  // Get recent movements
  const recentMovements = await dbConnection.all(`
    SELECT 
      im.*,
      u.first_name || ' ' || u.last_name as created_by_name
    FROM inventory_movements im
    LEFT JOIN users u ON im.created_by = u.id
    WHERE im.item_id = ?
    ORDER BY im.created_at DESC
    LIMIT 10
  `, [id]);
  
  // Calculate stock value
  const stockValue = item.quantity_on_hand * item.cost_price;
  
  res.json({
    ...item,
    stockValue,
    recentMovements,
    isLowStock: item.quantity_on_hand <= item.minimum_quantity
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
  
  // Check if category exists
  if (itemData.categoryId) {
    const category = await dbConnection.get('SELECT id FROM inventory_categories WHERE id = ?', [itemData.categoryId]);
    if (!category) {
      throw new ValidationError('Category not found', [
        { field: 'categoryId', message: 'Category does not exist' }
      ]);
    }
  }
  
  // Check if supplier exists
  if (itemData.supplierId) {
    const supplier = await dbConnection.get('SELECT id FROM suppliers WHERE id = ?', [itemData.supplierId]);
    if (!supplier) {
      throw new ValidationError('Supplier not found', [
        { field: 'supplierId', message: 'Supplier does not exist' }
      ]);
    }
  }
  
  // Check for duplicate barcode
  if (itemData.barcode) {
    const existingItem = await dbConnection.get(
      'SELECT id FROM inventory_items WHERE barcode = ?',
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
    INSERT INTO inventory_items (
      category_id, supplier_id, name, description, part_number, barcode,
      unit_of_measure, cost_price, selling_price, quantity_on_hand,
      minimum_quantity, maximum_quantity, reorder_point, reorder_quantity, location
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    itemData.categoryId || null,
    itemData.supplierId || null,
    itemData.name,
    itemData.description || null,
    itemData.partNumber || null,
    itemData.barcode || null,
    itemData.unitOfMeasure || 'each',
    itemData.costPrice || 0,
    itemData.sellingPrice || 0,
    itemData.quantityOnHand || 0,
    itemData.minimumQuantity || 5,
    itemData.maximumQuantity || null,
    itemData.reorderPoint || 10,
    itemData.reorderQuantity || 20,
    itemData.location || null
  ]);
  
  // Get created item with category and supplier info
  const newItem = await dbConnection.get(`
    SELECT 
      i.*,
      c.name as category_name,
      s.name as supplier_name
    FROM inventory_items i
    LEFT JOIN inventory_categories c ON i.category_id = c.id
    LEFT JOIN suppliers s ON i.supplier_id = s.id
    WHERE i.id = ?
  `, [result.lastID]);
  
  // Create initial inventory movement if quantity > 0
  if (itemData.quantityOnHand > 0) {
    await dbConnection.run(`
      INSERT INTO inventory_movements (item_id, movement_type, quantity, unit_cost, reference_type, notes, created_by)
      VALUES (?, 'in', ?, ?, 'initial_stock', 'Initial stock entry', 1)
    `, [result.lastID, itemData.quantityOnHand, itemData.costPrice || 0]);
  }
  
  logger.business('inventory_item_created', {
    itemId: newItem.id,
    itemName: newItem.name,
    quantity: newItem.quantity_on_hand
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
  const existingItem = await dbConnection.get('SELECT * FROM inventory_items WHERE id = ?', [id]);
  if (!existingItem) {
    throw new NotFoundError('Inventory item not found');
  }
  
  // Check for duplicate barcode (excluding current item)
  if (itemData.barcode) {
    const duplicateItem = await dbConnection.get(
      'SELECT id FROM inventory_items WHERE barcode = ? AND id != ?',
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
    UPDATE inventory_items SET
      category_id = COALESCE(?, category_id),
      supplier_id = COALESCE(?, supplier_id),
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      part_number = COALESCE(?, part_number),
      barcode = COALESCE(?, barcode),
      unit_of_measure = COALESCE(?, unit_of_measure),
      cost_price = COALESCE(?, cost_price),
      selling_price = COALESCE(?, selling_price),
      minimum_quantity = COALESCE(?, minimum_quantity),
      maximum_quantity = COALESCE(?, maximum_quantity),
      reorder_point = COALESCE(?, reorder_point),
      reorder_quantity = COALESCE(?, reorder_quantity),
      location = COALESCE(?, location)
    WHERE id = ?
  `, [
    itemData.categoryId,
    itemData.supplierId,
    itemData.name,
    itemData.description,
    itemData.partNumber,
    itemData.barcode,
    itemData.unitOfMeasure,
    itemData.costPrice,
    itemData.sellingPrice,
    itemData.minimumQuantity,
    itemData.maximumQuantity,
    itemData.reorderPoint,
    itemData.reorderQuantity,
    itemData.location,
    id
  ]);
  
  // Get updated item
  const updatedItem = await dbConnection.get(`
    SELECT 
      i.*,
      c.name as category_name,
      s.name as supplier_name
    FROM inventory_items i
    LEFT JOIN inventory_categories c ON i.category_id = c.id
    LEFT JOIN suppliers s ON i.supplier_id = s.id
    WHERE i.id = ?
  `, [id]);
  
  logger.business('inventory_item_updated', {
    itemId: id,
    itemName: updatedItem.name
  });
  
  res.json(updatedItem);
}));

/**
 * Delete inventory item
 * DELETE /api/v1/inventory/:id
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if item exists
  const item = await dbConnection.get('SELECT * FROM inventory_items WHERE id = ?', [id]);
  if (!item) {
    throw new NotFoundError('Inventory item not found');
  }
  
  // Check if item is used in any work orders
  const workOrderUsage = await dbConnection.get(`
    SELECT COUNT(*) as count 
    FROM work_order_items 
    WHERE item_id = ?
  `, [id]);
  
  if (workOrderUsage.count > 0) {
    throw new ValidationError('Cannot delete item used in work orders', [
      { field: 'item', message: 'Item is referenced in work orders and cannot be deleted' }
    ]);
  }
  
  // Soft delete item
  await dbConnection.run('UPDATE inventory_items SET is_active = 0 WHERE id = ?', [id]);
  
  logger.business('inventory_item_deleted', {
    itemId: id,
    itemName: item.name
  });
  
  res.json({ message: 'Inventory item deleted successfully' });
}));

/**
 * Get low stock items
 * GET /api/v1/inventory/low-stock
 */
router.get('/low-stock', asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;
  
  const lowStockItems = await dbConnection.all(`
    SELECT 
      i.*,
      c.name as category_name,
      s.name as supplier_name,
      (i.reorder_point - i.quantity_on_hand) as shortage_amount
    FROM inventory_items i
    LEFT JOIN inventory_categories c ON i.category_id = c.id
    LEFT JOIN suppliers s ON i.supplier_id = s.id
    WHERE i.is_active = 1 AND i.quantity_on_hand <= i.minimum_quantity
    ORDER BY (i.quantity_on_hand / NULLIF(i.minimum_quantity, 0)) ASC
    LIMIT ?
  `, [parseInt(limit)]);
  
  res.json(lowStockItems);
}));

/**
 * Adjust stock quantity
 * POST /api/v1/inventory/:id/adjust
 */
router.post('/:id/adjust', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { quantity, type, unitCost, notes, reason } = req.body;
  
  if (!quantity || quantity === 0) {
    throw new ValidationError('Quantity is required', [
      { field: 'quantity', message: 'Adjustment quantity must be specified and non-zero' }
    ]);
  }
  
  if (!type || !['in', 'out', 'adjustment'].includes(type)) {
    throw new ValidationError('Invalid adjustment type', [
      { field: 'type', message: 'Adjustment type must be "in", "out", or "adjustment"' }
    ]);
  }
  
  // Check if item exists
  const item = await dbConnection.get('SELECT * FROM inventory_items WHERE id = ?', [id]);
  if (!item) {
    throw new NotFoundError('Inventory item not found');
  }
  
  // Calculate new quantity
  let newQuantity;
  if (type === 'adjustment') {
    newQuantity = quantity; // Direct adjustment to specific quantity
  } else if (type === 'in') {
    newQuantity = item.quantity_on_hand + Math.abs(quantity);
  } else { // type === 'out'
    newQuantity = item.quantity_on_hand - Math.abs(quantity);
  }
  
  if (newQuantity < 0) {
    throw new ValidationError('Insufficient stock', [
      { field: 'quantity', message: 'Adjustment would result in negative stock' }
    ]);
  }
  
  // Begin transaction
  await dbConnection.run('BEGIN TRANSACTION');
  
  try {
    // Update inventory quantity
    await dbConnection.run(
      'UPDATE inventory_items SET quantity_on_hand = ? WHERE id = ?',
      [newQuantity, id]
    );
    
    // Record movement
    const movementQuantity = type === 'adjustment' 
      ? quantity - item.quantity_on_hand 
      : (type === 'in' ? Math.abs(quantity) : -Math.abs(quantity));
    
    await dbConnection.run(`
      INSERT INTO inventory_movements (item_id, movement_type, quantity, unit_cost, reference_type, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
      id,
      type,
      movementQuantity,
      unitCost || item.cost_price,
      reason || 'manual_adjustment',
      notes || `Manual ${type} adjustment`,
      1 // Assuming user ID 1 for now (should be from auth)
    ]);
    
    await dbConnection.run('COMMIT');
    
    // Get updated item
    const updatedItem = await dbConnection.get(`
      SELECT 
        i.*,
        c.name as category_name,
        s.name as supplier_name
      FROM inventory_items i
      LEFT JOIN inventory_categories c ON i.category_id = c.id
      LEFT JOIN suppliers s ON i.supplier_id = s.id
      WHERE i.id = ?
    `, [id]);
    
    logger.business('inventory_adjusted', {
      itemId: id,
      itemName: item.name,
      oldQuantity: item.quantity_on_hand,
      newQuantity: newQuantity,
      adjustmentType: type
    });
    
    res.json(updatedItem);
    
  } catch (error) {
    await dbConnection.run('ROLLBACK');
    throw error;
  }
}));

/**
 * Get inventory categories
 * GET /api/v1/inventory/categories
 */
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await dbConnection.all(`
    SELECT 
      c.*,
      COUNT(i.id) as item_count
    FROM inventory_categories c
    LEFT JOIN inventory_items i ON c.id = i.category_id AND i.is_active = 1
    WHERE c.is_active = 1
    GROUP BY c.id
    ORDER BY c.name ASC
  `);
  
  res.json(categories);
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
      i.id,
      i.name,
      i.part_number,
      i.description,
      i.quantity_on_hand,
      i.selling_price,
      c.name as category_name
    FROM inventory_items i
    LEFT JOIN inventory_categories c ON i.category_id = c.id
    WHERE i.is_active = 1 
      AND (i.name LIKE ? OR i.description LIKE ? OR i.part_number LIKE ? OR i.barcode LIKE ?)
    ORDER BY i.name ASC
    LIMIT ?
  `, [searchTerm, searchTerm, searchTerm, searchTerm, parseInt(limit)]);
  
  res.json(items);
}));

module.exports = router;