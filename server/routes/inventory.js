/**
 * Inventory Routes — stub for development
 */
const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const dbConnection = require('../database/connection');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const items = await dbConnection.all(`
    SELECT id, name, part_number, quantity_on_hand, minimum_quantity, unit_price
    FROM inventory_items
    WHERE is_active = 1
    ORDER BY name
    LIMIT 100
  `).catch(() => []);

  res.json({ items: items || [] });
}));

router.get('/low-stock', asyncHandler(async (req, res) => {
  const items = await dbConnection.all(`
    SELECT id, name, part_number, quantity_on_hand, minimum_quantity
    FROM inventory_items
    WHERE quantity_on_hand <= minimum_quantity AND is_active = 1
    ORDER BY quantity_on_hand ASC
  `).catch(() => []);

  res.json({ items: items || [] });
}));

module.exports = router;
