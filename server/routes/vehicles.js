/**
 * Vehicle Routes — stub for development
 */
const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const dbConnection = require('../database/connection');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const vehicles = await dbConnection.all(`
    SELECT v.id, v.year, v.make, v.model, v.vin,
      c.first_name || ' ' || c.last_name as client_name
    FROM vehicles v
    LEFT JOIN clients c ON v.client_id = c.id
    WHERE v.is_active = 1
    ORDER BY v.updated_at DESC
    LIMIT 50
  `).catch(() => []);

  res.json({ vehicles: vehicles || [] });
}));

module.exports = router;
