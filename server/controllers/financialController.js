/**
 * Financial Controller for MoMech
 * Business logic for financial management operations
 */

const dbConnection = require('../database/connection');
const logger = require('../utils/logger');

class FinancialController {
  /**
   * Generate invoice number
   */
  async generateInvoiceNumber() {
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
   * Get all invoices with pagination and filtering
   */
  async getInvoices(filters = {}) {
    const {
      page = 1,
      limit = 20,
      status,
      clientId,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = filters;

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

    return {
      invoices,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        totalPages: Math.ceil(totalResult.total / parseInt(limit))
      }
    };
  }

  /**
   * Get invoice by ID
   */
  async getInvoiceById(id) {
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
      throw new Error('Invoice not found');
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

    return {
      ...invoice,
      items,
      payments,
      totalPaid,
      balanceDue
    };
  }

  /**
   * Create new invoice
   */
  async createInvoice(invoiceData) {
    // Validate required fields
    if (!invoiceData.clientId || !invoiceData.vehicleId) {
      throw new Error('Client ID and vehicle ID are required');
    }

    if (!invoiceData.items || !Array.isArray(invoiceData.items) || invoiceData.items.length === 0) {
      throw new Error('At least one item is required');
    }

    // Validate items
    invoiceData.items.forEach((item, index) => {
      if (!item.description) {
        throw new Error(`Item ${index + 1}: Description is required`);
      }
      if (!item.quantity || item.quantity <= 0) {
        throw new Error(`Item ${index + 1}: Quantity must be positive`);
      }
      if (!item.unitPrice || item.unitPrice < 0) {
        throw new Error(`Item ${index + 1}: Unit price must be non-negative`);
      }
    });

    // Check if client exists
    const client = await dbConnection.get('SELECT id FROM clients WHERE id = ?', [invoiceData.clientId]);
    if (!client) {
      throw new Error('Client not found');
    }

    // Check if vehicle exists and belongs to client
    const vehicle = await dbConnection.get(
      'SELECT id FROM vehicles WHERE id = ? AND client_id = ?',
      [invoiceData.vehicleId, invoiceData.clientId]
    );
    if (!vehicle) {
      throw new Error('Vehicle not found or does not belong to client');
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber();

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

    return newInvoice;
  }

  /**
   * Update invoice
   */
  async updateInvoice(id, invoiceData) {
    // Check if invoice exists
    const existingInvoice = await dbConnection.get('SELECT * FROM invoices WHERE id = ?', [id]);
    if (!existingInvoice) {
      throw new Error('Invoice not found');
    }

    // Check if invoice can be updated
    if (existingInvoice.status === 'paid') {
      throw new Error('Paid invoices cannot be modified');
    }

    // Validate input if items are being updated
    if (invoiceData.items) {
      if (!Array.isArray(invoiceData.items) || invoiceData.items.length === 0) {
        throw new Error('At least one item is required');
      }

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

    return updatedInvoice;
  }

  /**
   * Delete invoice
   */
  async deleteInvoice(id) {
    // Check if invoice exists
    const invoice = await dbConnection.get('SELECT * FROM invoices WHERE id = ?', [id]);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Check if invoice has payments
    const payments = await dbConnection.get('SELECT COUNT(*) as count FROM payments WHERE invoice_id = ?', [id]);
    if (payments.count > 0) {
      throw new Error('Invoice has associated payments. Please delete payments first.');
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

    return { message: 'Invoice deleted successfully' };
  }

  /**
   * Get all payments with pagination and filtering
   */
  async getPayments(filters = {}) {
    const {
      page = 1,
      limit = 20,
      invoiceId,
      paymentMethod,
      startDate,
      endDate,
      sortBy = 'payment_date',
      sortOrder = 'DESC'
    } = filters;

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

    return {
      payments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalResult.total,
        totalPages: Math.ceil(totalResult.total / parseInt(limit))
      }
    };
  }

  /**
   * Create new payment
   */
  async createPayment(paymentData) {
    // Validate required fields
    if (!paymentData.invoiceId || !paymentData.amount || !paymentData.paymentMethod) {
      throw new Error('Invoice ID, amount, and payment method are required');
    }

    if (paymentData.amount <= 0) {
      throw new Error('Payment amount must be positive');
    }

    // Validate payment method
    const validPaymentMethods = ['cash', 'check', 'credit_card', 'debit_card', 'bank_transfer', 'other'];
    if (!validPaymentMethods.includes(paymentData.paymentMethod)) {
      throw new Error('Invalid payment method');
    }

    // Check if invoice exists
    const invoice = await dbConnection.get('SELECT * FROM invoices WHERE id = ?', [paymentData.invoiceId]);
    if (!invoice) {
      throw new Error('Invoice not found');
    }

    // Get current payments total
    const paymentsTotal = await dbConnection.get(`
      SELECT COALESCE(SUM(amount), 0) as total FROM payments WHERE invoice_id = ?
    `, [paymentData.invoiceId]);

    const currentBalance = invoice.total_amount - paymentsTotal.total;

    // Check if payment amount exceeds balance
    if (paymentData.amount > currentBalance) {
      throw new Error(`Payment amount cannot exceed remaining balance of $${currentBalance.toFixed(2)}`);
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

    return newPayment;
  }

  /**
   * Get financial summary/dashboard
   */
  async getFinancialSummary(filters = {}) {
    const { startDate, endDate } = filters;

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

    return {
      invoiceSummary,
      paymentSummary,
      monthlyRevenue,
      topClients
    };
  }
}

module.exports = new FinancialController();