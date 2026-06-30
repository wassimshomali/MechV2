/**
 * Financial Routes for MoMech
 * Handles invoices, payments, and financial reporting
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
  
  if (!isUpdate && !data.invoiceDate) {
    errors.push({ field: 'invoiceDate', message: 'Invoice date is required' });
  }
  
  if (!isUpdate && !data.dueDate) {
    errors.push({ field: 'dueDate', message: 'Due date is required' });
  }
  
  if (data.subtotal && data.subtotal < 0) {
    errors.push({ field: 'subtotal', message: 'Subtotal cannot be negative' });
  }
  
  if (data.taxRate && (data.taxRate < 0 || data.taxRate > 1)) {
    errors.push({ field: 'taxRate', message: 'Tax rate must be between 0 and 1' });
  }
  
  if (data.totalAmount && data.totalAmount < 0) {
    errors.push({ field: 'totalAmount', message: 'Total amount cannot be negative' });
  }
  
  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

/**
 * Validate payment input
 */
function validatePaymentInput(data) {
  const errors = [];
  
  if (!data.clientId) {
    errors.push({ field: 'clientId', message: 'Client ID is required' });
  }
  
  if (!data.amount || data.amount <= 0) {
    errors.push({ field: 'amount', message: 'Payment amount must be greater than 0' });
  }
  
  if (!data.paymentMethod) {
    errors.push({ field: 'paymentMethod', message: 'Payment method is required' });
  }
  
  const validMethods = ['cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'other'];
  if (data.paymentMethod && !validMethods.includes(data.paymentMethod)) {
    errors.push({ field: 'paymentMethod', message: 'Invalid payment method' });
  }
  
  if (!data.paymentDate) {
    errors.push({ field: 'paymentDate', message: 'Payment date is required' });
  }
  
  if (errors.length > 0) {
    throw new ValidationError('Validation failed', errors);
  }
}

/**
 * Generate next invoice number
 */
async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const result = await dbConnection.get(`
    SELECT COUNT(*) as count 
    FROM invoices 
    WHERE strftime('%Y', invoice_date) = ?
  `, [year.toString()]);
  
  const nextNumber = (result.count + 1).toString().padStart(4, '0');
  return `INV-${year}-${nextNumber}`;
}

/**
 * Get all invoices
 * GET /api/v1/invoices
 */
router.get('/invoices', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    search = '', 
    status,
    clientId,
    dateFrom,
    dateTo,
    overdue = false,
    sortBy = 'invoice_date',
    sortOrder = 'DESC'
  } = req.query;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  const searchTerm = `%${search}%`;
  
  // Build WHERE clause
  let whereClause = 'WHERE 1=1';
  const params = [];
  
  if (status) {
    whereClause += ' AND i.status = ?';
    params.push(status);
  }
  
  if (clientId) {
    whereClause += ' AND i.client_id = ?';
    params.push(clientId);
  }
  
  if (dateFrom) {
    whereClause += ' AND i.invoice_date >= ?';
    params.push(dateFrom);
  }
  
  if (dateTo) {
    whereClause += ' AND i.invoice_date <= ?';
    params.push(dateTo);
  }
  
  if (overdue === 'true') {
    whereClause += ' AND i.due_date < date("now") AND i.status != "paid"';
  }
  
  if (search) {
    whereClause += ' AND (i.invoice_number LIKE ? OR c.first_name LIKE ? OR c.last_name LIKE ?)';
    params.push(searchTerm, searchTerm, searchTerm);
  }
  
  // Validate sort parameters
  const validSortFields = ['invoice_number', 'invoice_date', 'due_date', 'total_amount', 'status', 'client_name'];
  const validSortOrders = ['ASC', 'DESC'];
  
  const sortField = validSortFields.includes(sortBy) ? sortBy : 'invoice_date';
  const sortDirection = validSortOrders.includes(sortOrder.toUpperCase()) ? sortOrder.toUpperCase() : 'DESC';
  
  // Get total count
  const totalResult = await dbConnection.get(`
    SELECT COUNT(*) as total 
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    ${whereClause}
  `, params);
  
  // Get invoices
  const invoices = await dbConnection.all(`
    SELECT 
      i.*,
      c.first_name || ' ' || c.last_name as client_name,
      c.email as client_email,
      c.phone as client_phone,
      CASE 
        WHEN i.due_date < date('now') AND i.status != 'paid' THEN 1 
        ELSE 0 
      END as is_overdue
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    ${whereClause}
    ORDER BY ${sortField === 'client_name' ? 'c.first_name' : 'i.' + sortField} ${sortDirection}
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
router.get('/invoices/:id', asyncHandler(async (req, res) => {
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
      w.work_order_number,
      w.description as work_order_description
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    LEFT JOIN work_orders w ON i.work_order_id = w.id
    WHERE i.id = ?
  `, [id]);
  
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }
  
  // Get invoice items
  const items = await dbConnection.all(`
    SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY id
  `, [id]);
  
  // Get payments
  const payments = await dbConnection.all(`
    SELECT 
      p.*,
      u.first_name || ' ' || u.last_name as created_by_name
    FROM payments p
    LEFT JOIN users u ON p.created_by = u.id
    WHERE p.invoice_id = ?
    ORDER BY p.payment_date DESC
  `, [id]);
  
  res.json({
    ...invoice,
    items,
    payments,
    isOverdue: invoice.due_date < new Date().toISOString().split('T')[0] && invoice.status !== 'paid'
  });
}));

/**
 * Create new invoice
 * POST /api/v1/invoices
 */
router.post('/invoices', asyncHandler(async (req, res) => {
  const invoiceData = req.body;
  
  // Validate input
  validateInvoiceInput(invoiceData);
  
  // Check if client exists
  const client = await dbConnection.get('SELECT id FROM clients WHERE id = ?', [invoiceData.clientId]);
  if (!client) {
    throw new ValidationError('Client not found', [
      { field: 'clientId', message: 'Client does not exist' }
    ]);
  }
  
  // Check if work order exists (if provided)
  if (invoiceData.workOrderId) {
    const workOrder = await dbConnection.get('SELECT id FROM work_orders WHERE id = ?', [invoiceData.workOrderId]);
    if (!workOrder) {
      throw new ValidationError('Work order not found', [
        { field: 'workOrderId', message: 'Work order does not exist' }
      ]);
    }
  }
  
  // Generate invoice number
  const invoiceNumber = await generateInvoiceNumber();
  
  // Calculate totals
  const subtotal = invoiceData.subtotal || 0;
  const taxRate = invoiceData.taxRate || 0.0825; // Default 8.25%
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + taxAmount;
  
  // Insert invoice
  const result = await dbConnection.run(`
    INSERT INTO invoices (
      client_id, work_order_id, invoice_number, invoice_date, due_date, status,
      subtotal, tax_rate, tax_amount, total_amount, balance_due, payment_terms, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    invoiceData.clientId,
    invoiceData.workOrderId || null,
    invoiceNumber,
    invoiceData.invoiceDate,
    invoiceData.dueDate,
    invoiceData.status || 'draft',
    subtotal,
    taxRate,
    taxAmount,
    totalAmount,
    totalAmount, // Initial balance due equals total
    invoiceData.paymentTerms || 30,
    invoiceData.notes || null
  ]);
  
  // Insert invoice items if provided
  if (invoiceData.items && invoiceData.items.length > 0) {
    for (const item of invoiceData.items) {
      await dbConnection.run(`
        INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price, item_type)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [
        result.lastID,
        item.description,
        item.quantity,
        item.unitPrice,
        item.quantity * item.unitPrice,
        item.itemType || 'service'
      ]);
    }
  }
  
  // Get created invoice with details
  const newInvoice = await dbConnection.get(`
    SELECT 
      i.*,
      c.first_name || ' ' || c.last_name as client_name
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    WHERE i.id = ?
  `, [result.lastID]);
  
  logger.business('invoice_created', {
    invoiceId: newInvoice.id,
    invoiceNumber: newInvoice.invoice_number,
    clientId: invoiceData.clientId,
    amount: totalAmount
  });
  
  res.status(201).json(newInvoice);
}));

/**
 * Update invoice
 * PUT /api/v1/invoices/:id
 */
router.put('/invoices/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  const invoiceData = req.body;
  
  // Validate input
  validateInvoiceInput(invoiceData, true);
  
  // Check if invoice exists
  const existingInvoice = await dbConnection.get('SELECT * FROM invoices WHERE id = ?', [id]);
  if (!existingInvoice) {
    throw new NotFoundError('Invoice not found');
  }
  
  // Don't allow editing paid invoices
  if (existingInvoice.status === 'paid' && invoiceData.status !== 'paid') {
    throw new ValidationError('Cannot edit paid invoice', [
      { field: 'status', message: 'Paid invoices cannot be modified' }
    ]);
  }
  
  // Update invoice
  await dbConnection.run(`
    UPDATE invoices SET
      due_date = COALESCE(?, due_date),
      status = COALESCE(?, status),
      subtotal = COALESCE(?, subtotal),
      tax_rate = COALESCE(?, tax_rate),
      tax_amount = COALESCE(?, tax_amount),
      total_amount = COALESCE(?, total_amount),
      balance_due = COALESCE(?, balance_due),
      payment_terms = COALESCE(?, payment_terms),
      notes = COALESCE(?, notes),
      internal_notes = COALESCE(?, internal_notes),
      sent_at = COALESCE(?, sent_at)
    WHERE id = ?
  `, [
    invoiceData.dueDate,
    invoiceData.status,
    invoiceData.subtotal,
    invoiceData.taxRate,
    invoiceData.taxAmount,
    invoiceData.totalAmount,
    invoiceData.balanceDue,
    invoiceData.paymentTerms,
    invoiceData.notes,
    invoiceData.internalNotes,
    invoiceData.sentAt,
    id
  ]);
  
  // Get updated invoice
  const updatedInvoice = await dbConnection.get(`
    SELECT 
      i.*,
      c.first_name || ' ' || c.last_name as client_name
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    WHERE i.id = ?
  `, [id]);
  
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
router.delete('/invoices/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if invoice exists
  const invoice = await dbConnection.get('SELECT * FROM invoices WHERE id = ?', [id]);
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }
  
  // Don't allow deleting paid invoices
  if (invoice.status === 'paid') {
    throw new ValidationError('Cannot delete paid invoice', [
      { field: 'status', message: 'Paid invoices cannot be deleted' }
    ]);
  }
  
  // Check for payments
  const payments = await dbConnection.get('SELECT COUNT(*) as count FROM payments WHERE invoice_id = ?', [id]);
  if (payments.count > 0) {
    throw new ValidationError('Cannot delete invoice with payments', [
      { field: 'payments', message: 'Invoice has associated payments and cannot be deleted' }
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
 * Mark invoice as sent
 * POST /api/v1/invoices/:id/send
 */
router.post('/invoices/:id/send', asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  // Check if invoice exists
  const invoice = await dbConnection.get('SELECT * FROM invoices WHERE id = ?', [id]);
  if (!invoice) {
    throw new NotFoundError('Invoice not found');
  }
  
  // Update invoice status to sent
  await dbConnection.run(`
    UPDATE invoices SET 
      status = 'sent', 
      sent_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `, [id]);
  
  // Get updated invoice
  const updatedInvoice = await dbConnection.get(`
    SELECT 
      i.*,
      c.first_name || ' ' || c.last_name as client_name,
      c.email as client_email
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    WHERE i.id = ?
  `, [id]);
  
  logger.business('invoice_sent', {
    invoiceId: id,
    invoiceNumber: invoice.invoice_number,
    clientEmail: updatedInvoice.client_email
  });
  
  res.json(updatedInvoice);
}));

/**
 * Get all payments
 * GET /api/v1/payments
 */
router.get('/payments', asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    clientId,
    invoiceId,
    paymentMethod,
    dateFrom,
    dateTo,
    sortBy = 'payment_date',
    sortOrder = 'DESC'
  } = req.query;
  
  const offset = (parseInt(page) - 1) * parseInt(limit);
  
  // Build WHERE clause
  let whereClause = 'WHERE 1=1';
  const params = [];
  
  if (clientId) {
    whereClause += ' AND p.client_id = ?';
    params.push(clientId);
  }
  
  if (invoiceId) {
    whereClause += ' AND p.invoice_id = ?';
    params.push(invoiceId);
  }
  
  if (paymentMethod) {
    whereClause += ' AND p.payment_method = ?';
    params.push(paymentMethod);
  }
  
  if (dateFrom) {
    whereClause += ' AND p.payment_date >= ?';
    params.push(dateFrom);
  }
  
  if (dateTo) {
    whereClause += ' AND p.payment_date <= ?';
    params.push(dateTo);
  }
  
  // Get total count
  const totalResult = await dbConnection.get(`
    SELECT COUNT(*) as total 
    FROM payments p
    LEFT JOIN clients c ON p.client_id = c.id
    ${whereClause}
  `, params);
  
  // Get payments
  const payments = await dbConnection.all(`
    SELECT 
      p.*,
      c.first_name || ' ' || c.last_name as client_name,
      i.invoice_number,
      u.first_name || ' ' || u.last_name as created_by_name
    FROM payments p
    LEFT JOIN clients c ON p.client_id = c.id
    LEFT JOIN invoices i ON p.invoice_id = i.id
    LEFT JOIN users u ON p.created_by = u.id
    ${whereClause}
    ORDER BY p.${sortBy} ${sortOrder}
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
 * Record new payment
 * POST /api/v1/payments
 */
router.post('/payments', asyncHandler(async (req, res) => {
  const paymentData = req.body;
  
  // Validate input
  validatePaymentInput(paymentData);
  
  // Check if client exists
  const client = await dbConnection.get('SELECT id FROM clients WHERE id = ?', [paymentData.clientId]);
  if (!client) {
    throw new ValidationError('Client not found', [
      { field: 'clientId', message: 'Client does not exist' }
    ]);
  }
  
  // Check if invoice exists (if provided)
  let invoice = null;
  if (paymentData.invoiceId) {
    invoice = await dbConnection.get('SELECT * FROM invoices WHERE id = ?', [paymentData.invoiceId]);
    if (!invoice) {
      throw new ValidationError('Invoice not found', [
        { field: 'invoiceId', message: 'Invoice does not exist' }
      ]);
    }
    
    // Check if payment amount doesn't exceed balance due
    if (paymentData.amount > invoice.balance_due) {
      throw new ValidationError('Payment exceeds balance due', [
        { field: 'amount', message: 'Payment amount cannot exceed the invoice balance due' }
      ]);
    }
  }
  
  // Insert payment
  const result = await dbConnection.run(`
    INSERT INTO payments (
      client_id, invoice_id, payment_method, reference_number, amount, payment_date, notes, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    paymentData.clientId,
    paymentData.invoiceId || null,
    paymentData.paymentMethod,
    paymentData.referenceNumber || null,
    paymentData.amount,
    paymentData.paymentDate,
    paymentData.notes || null,
    1 // Assuming user ID 1 for now (should be from auth)
  ]);
  
  // Get created payment with details
  const newPayment = await dbConnection.get(`
    SELECT 
      p.*,
      c.first_name || ' ' || c.last_name as client_name,
      i.invoice_number
    FROM payments p
    LEFT JOIN clients c ON p.client_id = c.id
    LEFT JOIN invoices i ON p.invoice_id = i.id
    WHERE p.id = ?
  `, [result.lastID]);
  
  logger.business('payment_recorded', {
    paymentId: newPayment.id,
    clientId: paymentData.clientId,
    invoiceId: paymentData.invoiceId,
    amount: paymentData.amount,
    method: paymentData.paymentMethod
  });
  
  res.status(201).json(newPayment);
}));

/**
 * Get revenue reports
 * GET /api/v1/reports/revenue
 */
router.get('/reports/revenue', asyncHandler(async (req, res) => {
  const { 
    period = 'month',
    startDate,
    endDate
  } = req.query;
  
  let dateRange, groupBy, dateFormat;
  
  if (startDate && endDate) {
    dateRange = `i.invoice_date BETWEEN '${startDate}' AND '${endDate}'`;
    groupBy = "strftime('%Y-%m-%d', i.invoice_date)";
    dateFormat = '%Y-%m-%d';
  } else {
    switch (period) {
      case 'week':
        dateRange = "i.invoice_date >= date('now', '-7 days')";
        groupBy = "strftime('%Y-%m-%d', i.invoice_date)";
        dateFormat = '%Y-%m-%d';
        break;
      case 'year':
        dateRange = "i.invoice_date >= date('now', '-12 months')";
        groupBy = "strftime('%Y-%m', i.invoice_date)";
        dateFormat = '%Y-%m';
        break;
      default: // month
        dateRange = "i.invoice_date >= date('now', '-30 days')";
        groupBy = "strftime('%Y-%m-%d', i.invoice_date)";
        dateFormat = '%Y-%m-%d';
    }
  }
  
  const revenueData = await dbConnection.all(`
    SELECT 
      ${groupBy} as period,
      COUNT(*) as invoice_count,
      COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END), 0) as paid_revenue,
      COALESCE(SUM(i.total_amount), 0) as total_invoiced,
      COALESCE(SUM(CASE WHEN i.status != 'paid' THEN i.balance_due ELSE 0 END), 0) as outstanding_amount
    FROM invoices i
    WHERE ${dateRange}
    GROUP BY ${groupBy}
    ORDER BY period ASC
  `);
  
  // Get summary statistics
  const summary = await dbConnection.get(`
    SELECT 
      COUNT(*) as total_invoices,
      COALESCE(SUM(CASE WHEN i.status = 'paid' THEN i.total_amount ELSE 0 END), 0) as total_paid,
      COALESCE(SUM(i.total_amount), 0) as total_invoiced,
      COALESCE(SUM(CASE WHEN i.status != 'paid' THEN i.balance_due ELSE 0 END), 0) as total_outstanding,
      COALESCE(AVG(CASE WHEN i.status = 'paid' THEN i.total_amount END), 0) as avg_invoice_amount
    FROM invoices i
    WHERE ${dateRange}
  `);
  
  res.json({
    period,
    data: revenueData,
    summary
  });
}));

/**
 * Get outstanding invoices report
 * GET /api/v1/reports/outstanding
 */
router.get('/reports/outstanding', asyncHandler(async (req, res) => {
  const { limit = 50 } = req.query;
  
  const outstandingInvoices = await dbConnection.all(`
    SELECT 
      i.*,
      c.first_name || ' ' || c.last_name as client_name,
      c.phone as client_phone,
      c.email as client_email,
      julianday('now') - julianday(i.due_date) as days_overdue
    FROM invoices i
    LEFT JOIN clients c ON i.client_id = c.id
    WHERE i.status != 'paid' AND i.balance_due > 0
    ORDER BY 
      CASE WHEN i.due_date < date('now') THEN 1 ELSE 2 END,
      i.due_date ASC
    LIMIT ?
  `, [parseInt(limit)]);
  
  // Get summary
  const summary = await dbConnection.get(`
    SELECT 
      COUNT(*) as total_outstanding,
      COALESCE(SUM(i.balance_due), 0) as total_amount,
      COUNT(CASE WHEN i.due_date < date('now') THEN 1 END) as overdue_count,
      COALESCE(SUM(CASE WHEN i.due_date < date('now') THEN i.balance_due ELSE 0 END), 0) as overdue_amount
    FROM invoices i
    WHERE i.status != 'paid' AND i.balance_due > 0
  `);
  
  res.json({
    invoices: outstandingInvoices,
    summary
  });
}));

module.exports = router;