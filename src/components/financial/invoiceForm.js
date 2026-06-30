/**
 * Invoice Form Component
 */

import { Form } from '../common/form.js';
import financialService from '../../services/financialService.js';
import clientService from '../../services/clientService.js';

export class InvoiceForm {
    constructor(params = {}) {
        this.id = params.id;
        this.isEdit = Boolean(params.id);
    }

    async render() {
        return `
            <div class="max-w-3xl mx-auto space-y-6">
                <h1 class="text-2xl font-semibold text-gray-900">Create Invoice</h1>
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

        const fields = [
            { name: 'clientId', label: 'Client', type: 'select', required: true, options: clientOptions },
            { name: 'invoiceDate', label: 'Invoice Date', type: 'date', required: true },
            { name: 'dueDate', label: 'Due Date', type: 'date', required: true },
            { name: 'subtotal', label: 'Subtotal', type: 'number', required: true },
            { name: 'taxRate', label: 'Tax Rate (decimal)', type: 'number' },
            { name: 'notes', label: 'Notes', type: 'textarea' },
        ];

        const form = new Form({
            containerId: 'invoice-form-container',
            fields,
            data: { invoiceDate: today, dueDate: due, taxRate: 0.0825, subtotal: 0 },
            submitText: 'Create Invoice',
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
