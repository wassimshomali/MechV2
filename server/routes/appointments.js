/**
 * Appointment Routes
 */
const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const dbConnection = require('../database/connection');

const router = express.Router();

router.get('/today', asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const appointments = await dbConnection.all(`
    SELECT
      a.id,
      a.appointment_date,
      a.appointment_time,
      a.status,
      c.first_name || ' ' || c.last_name AS client_name,
      v.year || ' ' || v.make || ' ' || v.model AS vehicle,
      COALESCE(s.name, a.description, 'General Service') AS service_name
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    LEFT JOIN services s ON a.service_id = s.id
    WHERE a.appointment_date = ?
      AND a.status != 'cancelled'
    ORDER BY a.appointment_time
  `, [today]);

  res.json({ appointments });
}));

router.get('/', asyncHandler(async (req, res) => {
  const appointments = await dbConnection.all(`
    SELECT
      a.id,
      a.appointment_date,
      a.appointment_time,
      a.status,
      c.first_name || ' ' || c.last_name AS client_name,
      v.year || ' ' || v.make || ' ' || v.model AS vehicle,
      COALESCE(s.name, a.description, 'General Service') AS service_name
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    LEFT JOIN services s ON a.service_id = s.id
    WHERE a.appointment_date >= date('now')
      AND a.status != 'cancelled'
    ORDER BY a.appointment_date, a.appointment_time
    LIMIT 100
  `);

  res.json({ appointments });
}));

module.exports = router;
