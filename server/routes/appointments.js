/**
 * Appointment Routes — stub for development
 */
const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const dbConnection = require('../database/connection');

const router = express.Router();

router.get('/', asyncHandler(async (req, res) => {
  const appointments = await dbConnection.all(`
    SELECT a.id, a.appointment_date, a.appointment_time, a.status,
      c.first_name || ' ' || c.last_name as client_name,
      v.make || ' ' || v.model as vehicle,
      s.name as service_name
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    LEFT JOIN services s ON a.service_id = s.id
    WHERE a.appointment_date >= date('now')
    ORDER BY a.appointment_date, a.appointment_time
    LIMIT 50
  `).catch(() => []);

  res.json({ appointments: appointments || [] });
}));

router.get('/today', asyncHandler(async (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const appointments = await dbConnection.all(`
    SELECT a.id, a.appointment_time, a.status,
      c.first_name || ' ' || c.last_name as client_name,
      v.make || ' ' || v.model as vehicle,
      s.name as service_name
    FROM appointments a
    LEFT JOIN clients c ON a.client_id = c.id
    LEFT JOIN vehicles v ON a.vehicle_id = v.id
    LEFT JOIN services s ON a.service_id = s.id
    WHERE a.appointment_date = ?
    ORDER BY a.appointment_time
  `, [today]).catch(() => []);

  res.json({ appointments: appointments || [] });
}));

module.exports = router;
