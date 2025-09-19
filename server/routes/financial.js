/**
 * Financial Routes for MoMech
 * Handles invoicing, payments, and financial reporting operations
 */

const express = require('express');
const { asyncHandler, ValidationError, NotFoundError } = require('../middleware/errorHandler');
const dbConnection = require('../database/connection');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Validate invoice input
 */
function validateInvoiceInput(data, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate && !data.clientId) {
    errors.push({ field: 'clientId', message: 'Client ID is required' });
  }
  
  if (!isUpdate && !data.vehicleId) {
    errors.push({ field: 'vehicleId', message: 'Vehicle ID is required' });
  }
  
  if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
    errors.push({ field: 'items', message: 'At least one item is required' });
  } else {
    data.items.forEach((item, index) => {
      if (!item.description) {
        errors.push({ field: `items[${index}].description`, message: 'Item description is required' });
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push({ field: `items[${index}].quantity`, message: 'Item quantity must be positive' });
      }
      if (!item.unitPrice || item.unitPrice < 0) {
        errors.push({ field: `items[${index}].unitPrice`, message: 'Item unit price must be non-negative' });
      }
    });
  }
  
  if (data.taxRate !== undefined && (data.taxRate < 0 || data.taxRate > 1)) {
    errors.push({ field: 'taxRate', message: 'Tax rate must be between 0 and 1' });
  }
  
  if (data.discountAmount !== undefined && data.discountAmount < 0) {
    errors.push({ field: 'discountAmount', message: 'Discount amount must be non-negative' });
  }
  
  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

/**
 * Validate payment input
 */
function validatePaymentInput(data, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate && !data.invoiceId) {
    errors.push({ field: 'invoiceId', message: 'Invoice ID is required' });
  }
  
  if (!isUpdate && !data.amount) {
    errors.push({ field: 'amount', message: 'Payment amount is required' });
  }
  
  if (data.amount && data.amount <= 0) {
    errors.push({ field: 'amount', message: 'Payment amount must be positive' });
  }
  
  if (!data.paymentMethod) {
    errors.push({ field: 'paymentMethod', message: 'Payment method is required' });
  }
  
  const validPaymentMethods = ['cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'other'];
  if (data.paymentMethod && !validPaymentMethods.includes(data.paymentMethod)) {
    errors.push({ field: 'paymentMethod', message: 'Invalid payment method' });
  }
  
  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

/**
 * Generate invoice number
 */
async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  
  const lastInvoice = await dbConnection.get(`
    SELECT invoice_number FROM invoices 
    WHERE invoice_number LIKE ? 
    ORDER BY invoice_number DESC 
    LIMIT 1
  `, [`${prefix}%`]);
  
  let nextNumber = 1;
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoice_number.split('-')[2]);
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${String(nextNumber).padStart(4, '0')}`;
}

/**
 * Get all invoices
 * GET /api/v1/invoices
 */
router.get('/', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    status,
    clientId,
    startDate,
    endDate,
    sortBy = 'created_at',
    sortOrder = 'DESC'
  } = req.query;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  // Build WHERE clause
  let whereClause = '';
  const params = [];
  
  if (status) {
    whereClause += 'WHERE i.status = ?';
    params.push(status);
  }
  
  if (clientId) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'i.client_id = ?';
    params.push(clientId);
  }
  
  if (startDate) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'i.invoice_date >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'i.invoice_date <= ?';
    params.push(endDate);
  }
  
  // Validate sort parameters
  const validSortFields = ['invoice_date', 'due_date', 'total_amount', 'status', 'created_at'];
  const validSortOrders = ['ASC', 'DESC'];
  
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
  const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
  
  // Get total count
  const totalResult = await dbConnection.get(`
    SELECT COUNT(*) as total FROM invoices i ${whereClause}
  `, params);
  
  // Get invoices
  const invoices = await dbConnection.all(`
    SELECT 
      i.*,
      c.first_name || ' ' || c.last_name as client_name,
      c.email as client_email,
      c.phone as client_phone,
      v.year || ' ' || v.make || ' ' || v.model as vehicle_display,
      COALESCE(SUM(p.amount), 0) as total_paid,
      (i.total_amount - COALESCE(SUM(p.amount), 0)) as balance_due
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    LEFT JOIN vehicles v ON i.vehicle_id = v.id
    LEFT JOIN payments p ON i.id = p.invoice_id
    ${whereClause}
    GROUP BY i.id
    ORDER BY i.${sortField} ${sortDirection}
    LIMIT ? OFFSET ?
  `, [...params, parseInt(limit), offset]);
  
  res.json({
    invoices,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalResult.total,
      totalPages: Math.ceil(totalResult.total / parseInt(limit))
    }
  });
}));

/**
 * Get invoice by ID
 * GET /api/v1/invoices/:id
 */
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const invoice = await dbConnection.get(`
    SELECT 
      i.*,
      c.first_name || ' ' || c.last_name as client_name,
      c.email as client_email,
      c.phone as client_phone,
      c.address as client_address,
      c.city as client_city,
      c.state as client_state,
      c.zip_code as client_zip,
      v.year || ' ' || v.make || ' ' || v.model as vehicle_display,
      v.license_plate,
      v.vin
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    LEFT JOIN vehicles v ON i.vehicle_id = v.id
    WHERE i.id = ?
  `, [id]);
  
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }
  
  // Get invoice items
  const items = await dbConnection.all(`
    SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY line_number
  `, [id]);
  
  // Get payments
  const payments = await dbConnection.all(`
    SELECT * FROM payments WHERE invoice_id = ? ORDER BY payment_date DESC
  `, [id]);
  
  // Calculate totals
  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
  const balanceDue = invoice.total_amount - totalPaid;
  
  res.json({
    ...invoice,
    items,
    payments,
    totalPaid,
    balanceDue
  });
}));

/**
 * Create new invoice
 * POST /api/v1/invoices
 */
router.post('/', asyncHandler(async (req, res) => {
  const invoiceData = req.body;
  
  // Validate input
  validateInvoiceInput(invoiceData);
  
  // Check if client exists
  const client = await dbConnection.get('SELECT id FROM clients WHERE id = ?', [invoiceData.clientId]);
  if (!client) {
    throw new ValidationError('Invalid client', [
      { field: 'clientId', message: 'Client not found' }
    ]);
  }
  
  // Check if vehicle exists and belongs to client
  const vehicle = await dbConnection.get(
    'SELECT id FROM vehicles WHERE id = ? AND client_id = ?', 
    [invoiceData.vehicleId, invoiceData.clientId]
  );
  if (!vehicle) {
    throw new ValidationError('Invalid vehicle', [
      { field: 'vehicleId', message: 'Vehicle not found or does not belong to client' }
    ]);
  }
  
  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber();
  
  // Calculate totals
  const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = subtotal * (invoiceData.taxRate || 0.08);
  const totalAmount = subtotal + taxAmount - (invoiceData.discountAmount || 0);
  
  // Calculate due date (30 days from invoice date)
  const invoiceDate = invoiceData.invoiceDate || new Date().toISOString().split('T')[0];
  const dueDate = new Date(invoiceDate);
  dueDate.setDate(dueDate.getDate() + 30);
  
  // Start transaction
  const invoiceResult = await dbConnection.run(`
    INSERT INTO invoices (
      invoice_number, client_id, vehicle_id, appointment_id, invoice_date, due_date,
      subtotal, tax_rate, tax_amount, discount_amount, total_amount, status, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    invoiceNumber,
    invoiceData.clientId,
    invoiceData.vehicleId,
    invoiceData.appointmentId || null,
    invoiceDate,
    dueDate.toISOString().split('T')[0],
    subtotal,
    invoiceData.taxRate || 0.08,
    taxAmount,
    invoiceData.discountAmount || 0,
    totalAmount,
    invoiceData.status || 'pending',
    invoiceData.notes || null
  ]);
  
  // Insert invoice items
  const itemPromises = invoiceData.items.map((item, index) => {
    return dbConnection.run(`
      INSERT INTO invoice_items (
        invoice_id, line_number, description, quantity, unit_price, total_price
      ) VALUES (?, ?, ?, ?, ?, ?)
    `, [
      invoiceResult.lastID,
      index + 1,
      item.description,
      item.quantity,
      item.unitPrice,
      item.quantity * item.unitPrice
    ]);
  });
  
  await Promise.all(itemPromises);
  
  // Get created invoice
  const newInvoice = await dbConnection.get(
    'SELECT * FROM invoices WHERE id = ?',
    [invoiceResult.lastID]
  );
  
  logger.business('invoice_created', {
    invoiceId: newInvoice.id,
    invoiceNumber: newInvoice.invoice_number,
    clientId: invoiceData.clientId,
    totalAmount: totalAmount
  });
  
  res.status(201).json(newInvoice);
}));

/**
 * Update invoice
 * PUT /api/v1/invoices/:id
 */
router.put('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const invoiceData = req.body;
  
  // Check if invoice exists
  const existingInvoice = await dbConnection.get('SELECT * FROM invoices WHERE id = ?', [id]);
  if (!existingInvoice) {
    throw new NotFoundError('Invoice not found');
  }
  
  // Check if invoice can be updated
  if (existingInvoice.status === 'paid') {
    throw new ValidationError('Cannot update paid invoice', [
      { field: 'status', message: 'Paid invoices cannot be modified' }
    ]);
  }
  
  // Validate input if items are being updated
  if (invoiceData.items) {
    validateInvoiceInput(invoiceData, true);
    
    // Recalculate totals
    const subtotal = invoiceData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * (invoiceData.taxRate || existingInvoice.tax_rate);
    const totalAmount = subtotal + taxAmount - (invoiceData.discountAmount || existingInvoice.discount_amount);
    
    // Update invoice
    await dbConnection.run(`
      UPDATE invoices SET
        subtotal = ?,
        tax_rate = COALESCE(?, tax_rate),
        tax_amount = ?,
        discount_amount = COALESCE(?, discount_amount),
        total_amount = ?,
        notes = COALESCE(?, notes)
      WHERE id = ?
    `, [
      subtotal,
      invoiceData.taxRate,
      taxAmount,
      invoiceData.discountAmount,
      totalAmount,
      invoiceData.notes,
      id
    ]);
    
    // Delete existing items and insert new ones
    await dbConnection.run('DELETE FROM invoice_items WHERE invoice_id = ?', [id]);
    
    const itemPromises = invoiceData.items.map((item, index) => {
      return dbConnection.run(`
        INSERT INTO invoice_items (
          invoice_id, line_number, description, quantity, unit_price, total_price
        ) VALUES (?, ?, ?, ?, ?, ?)
      `, [
        id,
        index + 1,
        item.description,
        item.quantity,
        item.unitPrice,
        item.quantity * item.unitPrice
      ]);
    });
    
    await Promise.all(itemPromises);
  } else {
    // Update only basic fields
    await dbConnection.run(`
      UPDATE invoices SET
        due_date = COALESCE(?, due_date),
        status = COALESCE(?, status),
        notes = COALESCE(?, notes)
      WHERE id = ?
    `, [
      invoiceData.dueDate,
      invoiceData.status,
      invoiceData.notes,
      id
    ]);
  }
  
  // Get updated invoice
  const updatedInvoice = await dbConnection.get('SELECT * FROM invoices WHERE id = ?', [id]);
  
  logger.business('invoice_updated', {
    invoiceId: id,
    invoiceNumber: updatedInvoice.invoice_number
  });
  
  res.json(updatedInvoice);
}));

/**
 * Delete invoice
 * DELETE /api/v1/invoices/:id
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if invoice exists
  const invoice = await dbConnection.get('SELECT * FROM invoices WHERE id = ?', [id]);
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }
  
  // Check if invoice has payments
  const payments = await dbConnection.get('SELECT COUNT(*) as count FROM payments WHERE invoice_id = ?', [id]);
  if (payments.count > 0) {
    throw new ValidationError('Cannot delete invoice with payments', [
      { field: 'invoice', message: 'Invoice has associated payments. Please delete payments first.' }
    ]);
  }
  
  // Delete invoice and items
  await dbConnection.transaction([
    {
      sql: 'DELETE FROM invoice_items WHERE invoice_id = ?',
      params: [id]
    },
    {
      sql: 'DELETE FROM invoices WHERE id = ?',
      params: [id]
    }
  ]);
  
  logger.business('invoice_deleted', {
    invoiceId: id,
    invoiceNumber: invoice.invoice_number
  });
  
  res.json({ message: 'Invoice deleted successfully' });
}));

/**
 * Get all payments
 * GET /api/v1/payments
 */
router.get('/payments', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    invoiceId,
    paymentMethod,
    startDate,
    endDate,
    sortBy = 'payment_date',
    sortOrder = 'DESC'
  } = req.query;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  // Build WHERE clause
  let whereClause = '';
  const params = [];
  
  if (invoiceId) {
    whereClause += 'WHERE p.invoice_id = ?';
    params.push(invoiceId);
  }
  
  if (paymentMethod) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'p.payment_method = ?';
    params.push(paymentMethod);
  }
  
  if (startDate) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'p.payment_date >= ?';
    params.push(startDate);
  }
  
  if (endDate) {
    whereClause += whereClause ? ' AND ' : 'WHERE ';
    whereClause += 'p.payment_date <= ?';
    params.push(endDate);
  }
  
  // Validate sort parameters
  const validSortFields = ['payment_date', 'amount', 'payment_method', 'created_at'];
  const validSortOrders = ['ASC', 'DESC'];
  
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'payment_date';
  const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
  
  // Get total count
  const totalResult = await dbConnection.get(`
    SELECT COUNT(*) as total FROM payments p ${whereClause}
  `, params);
  
  // Get payments
  const payments = await dbConnection.all(`
    SELECT 
      p.*,
      i.invoice_number,
      i.total_amount as invoice_total,
      c.first_name || ' ' || c.last_name as client_name
    FROM payments p
    LEFT JOIN invoices i ON p.invoice_id = i.id
    LEFT JOIN clients c ON i.client_id = c.id
    ${whereClause}
    ORDER BY p.${sortField} ${sortDirection}
    LIMIT ? OFFSET ?
  `, [...params, parseInt(limit), offset]);
  
  res.json({
    payments,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: totalResult.total,
      totalPages: Math.ceil(totalResult.total / parseInt(limit))
    }
  });
}));

/**
 * Create new payment
 * POST /api/v1/payments
 */
router.post('/payments', asyncHandler(async (req, res) => {
  const paymentData = req.body;
  
  // Validate input
  validatePaymentInput(paymentData);
  
  // Check if invoice exists
  const invoice = await dbConnection.get('SELECT * FROM invoices WHERE id = ?', [paymentData.invoiceId]);
  if (!invoice) {
    throw new ValidationError('Invalid invoice', [
      { field: 'invoiceId', message: 'Invoice not found' }
    ]);
  }
  
  // Get current payments total
  const paymentsTotal = await dbConnection.get(`
    SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE invoice_id = ?
  `, [paymentData.invoiceId]);
  
  const currentBalance = invoice.total_amount - paymentsTotal.total;
  
  // Check if payment amount exceeds balance
  if (paymentData.amount > currentBalance) {
    throw new ValidationError('Payment exceeds balance', [
      { field: 'amount', message: `Payment amount cannot exceed remaining balance of $${currentBalance.toFixed(2)}` }
    ]);
  }
  
  // Insert payment
  const result = await dbConnection.run(`
    INSERT INTO payments (
      invoice_id, amount, payment_method, payment_date, reference_number, notes
    ) VALUES (?, ?, ?, ?, ?, ?)
  `, [
    paymentData.invoiceId,
    paymentData.amount,
    paymentData.paymentMethod,
    paymentData.paymentDate || new Date().toISOString().split('T')[0],
    paymentData.referenceNumber || null,
    paymentData.notes || null
  ]);
  
  // Update invoice status if fully paid
  const newBalance = currentBalance - paymentData.amount;
  if (newBalance === 0) {
    await dbConnection.run('UPDATE invoices SET status = "paid" WHERE id = ?', [paymentData.invoiceId]);
  } else if (invoice.status === 'pending') {
    await dbConnection.run('UPDATE invoices SET status = "partial" WHERE id = ?', [paymentData.invoiceId]);
  }
  
  // Get created payment
  const newPayment = await dbConnection.get(
    'SELECT * FROM payments WHERE id = ?',
    [result.lastID]
  );
  
  logger.business('payment_created', {
    paymentId: newPayment.id,
    invoiceId: paymentData.invoiceId,
    invoiceNumber: invoice.invoice_number,
    amount: paymentData.amount,
    paymentMethod: paymentData.paymentMethod
  });
  
  res.status(201).json(newPayment);
}));

/**
 * Get financial summary/dashboard
 * GET /api/v1/financial/summary
 */
router.get('/summary', asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  let dateFilter = '';
  const params = [];
  
  if (startDate && endDate) {
    dateFilter = 'WHERE i.invoice_date BETWEEN ? AND ?';
    params.push(startDate, endDate);
  } else if (startDate) {
    dateFilter = 'WHERE i.invoice_date >= ?';
    params.push(startDate);
  } else if (endDate) {
    dateFilter = 'WHERE i.invoice_date <= ?';
    params.push(endDate);
  }
  
  // Get invoice summary
  const invoiceSummary = await dbConnection.get(`
    SELECT 
      COUNT(*) as total_invoices,
      SUM(total_amount) as total_invoiced,
      SUM(CASE WHEN status = 'paid' THEN total_amount ELSE 0 END) as total_paid,
      SUM(CASE WHEN status = 'pending' THEN total_amount ELSE 0 END) as total_pending,
      SUM(CASE WHEN status = 'overdue' THEN total_amount ELSE 0 END) as total_overdue
    FROM invoices i ${dateFilter}
  `, params);
  
  // Get payment summary
  const paymentSummary = await dbConnection.get(`
    SELECT 
      COUNT(*) as total_payments,
      SUM(amount) as total_received,
      AVG(amount) as average_payment
    FROM payments p
    LEFT JOIN invoices i ON p.invoice_id = i.id
    ${dateFilter ? dateFilter.replace('i.invoice_date', 'p.payment_date') : ''}
  `, params);
  
  // Get monthly revenue trend (last 12 months)
  const monthlyRevenue = await dbConnection.all(`
    SELECT 
      strftime('%Y-%m', payment_date) as month,
      SUM(amount) as revenue
    FROM payments 
    WHERE payment_date >= date('now', '-12 months')
    GROUP BY strftime('%Y-%m', payment_date)
    ORDER BY month DESC
    LIMIT 12
  `);
  
  // Get top clients by revenue
  const topClients = await dbConnection.all(`
    SELECT 
      c.id,
      c.first_name || ' ' || c.last_name as client_name,
      SUM(p.amount) as total_paid,
      COUNT(DISTINCT i.id) as invoice_count
    FROM clients c
    LEFT JOIN invoices i ON c.id = i.client_id
    LEFT JOIN payments p ON i.id = p.invoice_id
    WHERE p.payment_date >= date('now', '-12 months')
    GROUP BY c.id
    ORDER BY total_paid DESC
    LIMIT 10
  `);
  
  res.json({
    invoiceSummary,
    paymentSummary,
    monthlyRevenue,
    topClients
  });
}));

module.exports = router;