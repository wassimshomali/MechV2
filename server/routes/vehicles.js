/**
 * Vehicle Routes
 */
const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const dbConnection = require('../database/connection');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const vehicles = await dbConnection.all(`
    SELECT
      v.id,
      v.year,
      v.make,
      v.model,
      v.vin,
      v.license_plate,
      v.mileage,
      c.first_name || ' ' || c.last_name AS client_name,
      (
        SELECT vsh.description || ' — ' || vsh.service_date
        FROM vehicle_service_history vsh
        WHERE vsh.vehicle_id = v.id
        ORDER BY vsh.service_date DESC
        LIMIT 1
      ) AS last_service
    FROM vehicles v
    LEFT JOIN clients c ON v.client_id = c.id
    WHERE v.is_active = 1
    ORDER BY v.updated_at DESC
    LIMIT 100
  `);

  res.json({ vehicles });
}));

router.get('/service-history', asyncHandler(async (req, res) => {
  const history = await dbConnection.all(`
    SELECT
      vsh.id,
      vsh.service_date,
      vsh.service_type,
      vsh.description,
      vsh.total_cost,
      vsh.mileage,
      v.year || ' ' || v.make || ' ' || v.model AS vehicle,
      c.first_name || ' ' || c.last_name AS client_name,
      COALESCE(u.first_name || ' ' || u.last_name, 'Unassigned') AS mechanic
    FROM vehicle_service_history vsh
    LEFT JOIN vehicles v ON vsh.vehicle_id = v.id
    LEFT JOIN clients c ON v.client_id = c.id
    LEFT JOIN users u ON vsh.performed_by = u.id
    ORDER BY vsh.service_date DESC
    LIMIT 100
  `);

  res.json({ history });
}));

module.exports = router;
