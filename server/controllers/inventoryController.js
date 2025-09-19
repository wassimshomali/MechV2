/**
 * Inventory Controller for MoMech
 * Business logic for inventory management operations
 */

const dbConnection = require('../database/connection');
const logger = require('../utils/logger');

class InventoryController {
  /**
   * Get all inventory items with pagination and filtering
   */
  async getInventoryItems(filters = {}) {
    const {
      page = 1,
      limit = 20,
      search = '',
      category,
      lowStock = 'false',
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

    return {
      items,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        totalPages: Math.ceil(totalResult.total / parseInt(limit))
      }
    };
  }

  /**
   * Get low stock items
   */
  async getLowStockItems(limit = 50) {
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

    return items;
  }

  /**
   * Get inventory categories
   */
  async getInventoryCategories() {
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

    return categories;
  }

  /**
   * Get inventory item by ID
   */
  async getInventoryItemById(id) {
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
      throw new Error('Inventory item not found');
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

    return {
      ...item,
      stockMovements
    };
  }

  /**
   * Create new inventory item
   */
  async createInventoryItem(itemData) {
    // Validate required fields
    if (!itemData.name || !itemData.category) {
      throw new Error('Name and category are required');
    }

    // Validate numeric fields
    if (itemData.quantity !== undefined && (itemData.quantity < 0 || !Number.isInteger(itemData.quantity))) {
      throw new Error('Quantity must be a non-negative integer');
    }

    if (itemData.unitPrice !== undefined && (itemData.unitPrice < 0 || isNaN(itemData.unitPrice))) {
      throw new Error('Unit price must be a non-negative number');
    }

    // Check for duplicate SKU
    if (itemData.sku) {
      const existingItem = await dbConnection.get(
        'SELECT id FROM inventory WHERE sku = ?',
        [itemData.sku]
      );

      if (existingItem) {
        throw new Error('SKU already exists');
      }
    }

    // Check for duplicate barcode
    if (itemData.barcode) {
      const existingItem = await dbConnection.get(
        'SELECT id FROM inventory WHERE barcode = ?',
        [itemData.barcode]
      );

      if (existingItem) {
        throw new Error('Barcode already exists');
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

    return newItem;
  }

  /**
   * Update inventory item
   */
  async updateInventoryItem(id, itemData) {
    // Check if item exists
    const existingItem = await dbConnection.get('SELECT * FROM inventory WHERE id = ?', [id]);
    if (!existingItem) {
      throw new Error('Inventory item not found');
    }

    // Validate numeric fields if provided
    if (itemData.quantity !== undefined && (itemData.quantity < 0 || !Number.isInteger(itemData.quantity))) {
      throw new Error('Quantity must be a non-negative integer');
    }

    if (itemData.unitPrice !== undefined && (itemData.unitPrice < 0 || isNaN(itemData.unitPrice))) {
      throw new Error('Unit price must be a non-negative number');
    }

    // Check for duplicate SKU (excluding current item)
    if (itemData.sku) {
      const duplicateItem = await dbConnection.get(
        'SELECT id FROM inventory WHERE sku = ? AND id != ?',
        [itemData.sku, id]
      );

      if (duplicateItem) {
        throw new Error('SKU already exists');
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

    return updatedItem;
  }

  /**
   * Delete inventory item (soft delete)
   */
  async deleteInventoryItem(id) {
    // Check if item exists
    const item = await dbConnection.get('SELECT * FROM inventory WHERE id = ?', [id]);
    if (!item) {
      throw new Error('Inventory item not found');
    }

    // Soft delete item
    await dbConnection.run('UPDATE inventory SET is_active = 0 WHERE id = ?', [id]);

    logger.business('inventory_item_deleted', {
      itemId: id,
      itemName: item.name
    });

    return { message: 'Inventory item deleted successfully' };
  }

  /**
   * Update inventory quantity (stock movement)
   */
  async updateStock(id, movementData) {
    const { movementType, quantity, unitCost, notes } = movementData;

    // Validate input
    if (!movementType || !['in', 'out', 'adjustment'].includes(movementType)) {
      throw new Error('Invalid movement type');
    }

    if (!quantity || quantity <= 0 || !Number.isInteger(quantity)) {
      throw new Error('Quantity must be a positive integer');
    }

    // Check if item exists
    const item = await dbConnection.get('SELECT * FROM inventory WHERE id = ?', [id]);
    if (!item) {
      throw new Error('Inventory item not found');
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
          throw new Error(`Cannot remove ${quantity} items. Only ${currentQuantity} available.`);
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

    return {
      item: updatedItem,
      movement: {
        type: movementType,
        quantity: movementType === 'adjustment' ? (newQuantity - currentQuantity) : quantity,
        oldQuantity: currentQuantity,
        newQuantity
      }
    };
  }

  /**
   * Search inventory items
   */
  async searchInventoryItems(query, limit = 10) {
    if (!query || query.length < 2) {
      return [];
    }

    const searchTerm = `%${query}%`;

    const items = await dbConnection.all(`
      SELECT 
        id, name, category, sku, barcode, quantity, unit_price,
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

    return items;
  }

  /**
   * Get inventory summary/statistics
   */
  async getInventorySummary() {
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

    return {
      summary,
      categoryBreakdown
    };
  }
}

module.exports = new InventoryController();