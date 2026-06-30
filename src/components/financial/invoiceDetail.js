/**
 * Invoice Detail Component
 */

import financialService from '../../services/financialService.js';
import { formatCurrency, formatDate } from '../../utils/formatters.js';
import { renderPageHeader, renderDetailCard, renderDetailGrid, statusBadge } from '../../utils/pageHelpers.js';
import { t } from '../../i18n/index.js';

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
                        `${t('financial.invoiceNumber')} ${invoice.invoiceNumber}`,
                        invoice.clientName || '',
                        `
                        <button onclick="window.location.hash = '/financial/invoices'" class="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white">${t('common.back')}</button>
                        `
                    )}
                    ${renderDetailCard(t('financial.invoiceDetails'), renderDetailGrid([
                        { label: t('fields.status'), value: statusBadge(invoice.status) },
                        { label: t('fields.invoiceDate'), value: formatDate(invoice.invoiceDate, 'short') },
                        { label: t('fields.dueDate'), value: formatDate(invoice.dueDate, 'short') },
                        { label: t('fields.subtotal'), value: formatCurrency(invoice.subtotal) },
                        { label: t('fields.tax'), value: formatCurrency(invoice.taxAmount) },
                        { label: t('fields.total'), value: formatCurrency(invoice.totalAmount) },
                        { label: t('fields.paid'), value: formatCurrency(invoice.paidAmount) },
                        { label: t('fields.balanceDue'), value: formatCurrency(invoice.balanceDue) },
                        { label: t('fields.notes'), value: invoice.notes || '-' },
                    ]))}
                </div>
            `;
        } catch (error) {
            document.getElementById('invoice-detail').innerHTML = `<p class="text-red-600">${t('financial.errorLoadingInvoice')}</p>`;
        }
    }

    destroy() {}
}
