/**
 * Invoice Detail Component
 */

import financialService from '../../services/financialService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { renderPageHeader, renderDetailCard, renderDetailGrid, statusBadge } from '../../utils/pageHelpers.js';

export class InvoiceDetail {
    constructor(params = {}) {
        this.id = params.id;
    }

    async render() {
        return `<div id="invoice-detail" class="max-w-4xl mx-auto"><div class="flex justify-center py-12"><div class="page-loader"></div></div></div>`;
    }

    async init() {
        try {
            const invoice = await financialService.getInvoice(this.id);
            document.getElementById('invoice-detail').innerHTML = `
                <div class="space-y-6">
                    ${renderPageHeader(
                        `Invoice ${invoice.invoiceNumber}`,
                        invoice.clientName || '',
                        `
                        <button onclick="window.location.hash = '/financial/invoices'" class="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white">Back</button>
                        `
                    )}
                    ${renderDetailCard('Invoice Details', renderDetailGrid([
                        { label: 'Status', value: statusBadge(invoice.status) },
                        { label: 'Invoice Date', value: formatDate(invoice.invoiceDate, 'short') },
                        { label: 'Due Date', value: formatDate(invoice.dueDate, 'short') },
                        { label: 'Subtotal', value: formatCurrency(invoice.subtotal) },
                        { label: 'Tax', value: formatCurrency(invoice.taxAmount) },
                        { label: 'Total', value: formatCurrency(invoice.totalAmount) },
                        { label: 'Paid', value: formatCurrency(invoice.paidAmount) },
                        { label: 'Balance Due', value: formatCurrency(invoice.balanceDue) },
                        { label: 'Notes', value: invoice.notes || '-' },
                    ]))}
                </div>
            `;
        } catch (error) {
            document.getElementById('invoice-detail').innerHTML = '<p class="text-red-600">Failed to load invoice.</p>';
        }
    }

    destroy() {}
}
