/**
 * Financial Routes — stub for development
 */
const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const dbConnection = require('../database/connection');

const router = express.Router();

router.get('/invoices', asyncHandler(async (req, res) => {
  const invoices = await dbConnection.all(`
    SELECT i.id, i.invoice_number, i.total_amount, i.status, i.invoice_date,
      c.first_name || ' ' || c.last_name as client_name
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    ORDER BY i.invoice_date DESC
    LIMIT 50
  `).catch(() => []);

  res.json({ invoices: invoices || [] });
}));

router.get('/payments', asyncHandler(async (req, res) => {
  const payments = await dbConnection.all(`
    SELECT p.id, p.amount, p.payment_method, p.payment_date,
      c.first_name || ' ' || c.last_name as client_name,
      i.invoice_number
    FROM payments p
    LEFT JOIN clients c ON p.client_id = c.id
    LEFT JOIN invoices i ON p.invoice_id = i.id
    ORDER BY p.payment_date DESC
    LIMIT 50
  `).catch(() => []);

  res.json({ payments: payments || [] });
}));

module.exports = router;
