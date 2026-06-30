/**
 * Invoice Form Component
 */

import { Form } from '../common/form.js';
import financialService from '../../services/financialService.js';
import clientService from '../../services/clientService.js';
import { t } from '../../i18n/index.js';

function getInvoiceFields(clientOptions) {
    return [
        { name: 'clientId', label: t('fields.client'), type: 'select', required: true, options: clientOptions },
        { name: 'invoiceDate', label: t('fields.invoiceDate'), type: 'date', required: true },
        { name: 'dueDate', label: t('fields.dueDate'), type: 'date', required: true },
        { name: 'subtotal', label: t('fields.subtotal'), type: 'number', required: true },
        { name: 'taxRate', label: t('fields.taxRate'), type: 'number' },
        { name: 'notes', label: t('fields.notes'), type: 'textarea' },
    ];
}

export class InvoiceForm {
    constructor(params = {}) {
        this.id = params.id;
        this.isEdit = Boolean(params.id);
    }

    async render() {
        return `
            <div class="max-w-3xl mx-auto space-y-6">
                <h1 class="text-2xl font-semibold text-gray-900">${t('financial.createInvoiceTitle')}</h1>
                <div class="bg-white rounded-lg shadow p-6">
                    <div id="invoice-form-container"></div>
                </div>
            </div>
        `;
    }

    async init() {
        const clientsRes = await clientService.getClients({ limit: 100 });
        const clientOptions = clientsRes.clients.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }));
        const today = new Date().toISOString().split('T')[0];
        const due = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];

        const form = new Form({
            containerId: 'invoice-form-container',
            fields: getInvoiceFields(clientOptions),
            data: { invoiceDate: today, dueDate: due, taxRate: 0.0825, subtotal: 0 },
            submitText: t('financial.createInvoice'),
            onSubmit: async (formData) => {
                const subtotal = Number(formData.subtotal);
                const taxRate = Number(formData.taxRate || 0);
                const taxAmount = subtotal * taxRate;
                await financialService.createInvoice({
                    clientId: Number(formData.clientId),
                    invoiceDate: formData.invoiceDate,
                    dueDate: formData.dueDate,
                    subtotal,
                    taxRate,
                    taxAmount,
                    totalAmount: subtotal + taxAmount,
                    notes: formData.notes,
                    status: 'draft',
                });
                window.location.hash = '/financial/invoices';
            },
        });
        form.init();
        document.querySelector('#cancel-btn')?.addEventListener('click', () => window.location.hash = '/financial/invoices');
    }

    destroy() {}
}
