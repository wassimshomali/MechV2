/**
 * Inventory Routes
 */
const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const dbConnection = require('../database/connection');

const router = express.Router();

router.get('/low-stock', asyncHandler(async (req, res) => {
  const items = await dbConnection.all(`
    SELECT id, name, part_number, quantity_on_hand, minimum_quantity, selling_price
    FROM inventory_items
    WHERE quantity_on_hand <= minimum_quantity AND is_active = 1
    ORDER BY quantity_on_hand ASC
  `);

  res.json({ items });
}));

router.get('/', asyncHandler(async (req, res) => {
  const items = await dbConnection.all(`
    SELECT id, name, part_number, quantity_on_hand, minimum_quantity, selling_price
    FROM inventory_items
    WHERE is_active = 1
    ORDER BY name
    LIMIT 200
  `);

  res.json({ items });
}));

module.exports = router;
