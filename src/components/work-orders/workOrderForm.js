/**
 * Work Order Form Component
 */

import { Form } from '../common/form.js';
import workOrderService from '../../services/workOrderService.js';
import clientService from '../../services/clientService.js';
import vehicleService from '../../services/vehicleService.js';
import { t } from '../../i18n/index.js';

function getWorkOrderFields(clientOptions, vehicleOptions) {
    return [
        { name: 'clientId', label: t('fields.client'), type: 'select', required: true, options: clientOptions },
        { name: 'vehicleId', label: t('fields.vehicle'), type: 'select', required: true, options: vehicleOptions },
        { name: 'description', label: t('fields.description'), type: 'textarea', required: true },
        { name: 'diagnosis', label: t('fields.diagnosis'), type: 'textarea' },
        { name: 'status', label: t('fields.status'), type: 'select', options: [
            { value: 'open', label: t('status.open') },
            { value: 'in_progress', label: t('status.in_progress') },
            { value: 'completed', label: t('status.completed') },
            { value: 'cancelled', label: t('status.cancelled') },
        ]},
        { name: 'priority', label: t('fields.priority'), type: 'select', options: [
            { value: 'low', label: t('priority.low') },
            { value: 'normal', label: t('priority.normal') },
            { value: 'high', label: t('priority.high') },
        ]},
        { name: 'totalLaborHours', label: t('fields.laborHours'), type: 'number' },
        { name: 'totalPartsCost', label: t('fields.partsCost'), type: 'number' },
        { name: 'totalLaborCost', label: t('fields.laborCost'), type: 'number' },
    ];
}

export class WorkOrderForm {
    constructor(params = {}) {
        this.id = params.id;
        this.isEdit = Boolean(params.id);
    }

    async render() {
        return `
            <div class="max-w-3xl mx-auto space-y-6">
                <h1 class="text-2xl font-semibold text-gray-900">${this.isEdit ? t('workOrders.editWorkOrder') : t('workOrders.newWorkOrder')}</h1>
                <div class="bg-white rounded-lg shadow p-6">
                    <div id="work-order-form-container"></div>
                </div>
            </div>
        `;
    }

    async init() {
        const [clientsRes, vehiclesRes] = await Promise.all([
            clientService.getClients({ limit: 100 }),
            vehicleService.getVehicles({ limit: 100 }),
        ]);

        const clientOptions = clientsRes.clients.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }));
        const vehicleOptions = vehiclesRes.vehicles.map(v => ({ value: v.id, label: `${v.year} ${v.make} ${v.model}` }));

        let data = { status: 'open', priority: 'normal' };
        if (this.isEdit) {
            const wo = await workOrderService.getWorkOrder(this.id);
            data = {
                clientId: wo.clientId,
                vehicleId: wo.vehicleId,
                description: wo.description,
                diagnosis: wo.diagnosis,
                status: wo.status,
                priority: wo.priority,
                totalLaborHours: wo.totalLaborHours,
                totalPartsCost: wo.totalPartsCost,
                totalLaborCost: wo.totalLaborCost,
            };
        }

        const form = new Form({
            containerId: 'work-order-form-container',
            fields: getWorkOrderFields(clientOptions, vehicleOptions),
            data,
            submitText: this.isEdit ? t('workOrders.updateWorkOrder') : t('workOrders.createWorkOrder'),
            onSubmit: async (formData) => {
                const payload = {
                    ...formData,
                    clientId: Number(formData.clientId),
                    vehicleId: Number(formData.vehicleId),
                    totalLaborHours: Number(formData.totalLaborHours || 0),
                    totalPartsCost: Number(formData.totalPartsCost || 0),
                    totalLaborCost: Number(formData.totalLaborCost || 0),
                };
                if (this.isEdit) {
                    await workOrderService.updateWorkOrder(this.id, payload);
                    window.location.hash = `/work-orders/${this.id}`;
                } else {
                    const created = await workOrderService.createWorkOrder(payload);
                    window.location.hash = `/work-orders/${created.id}`;
                }
            },
        });
        form.init();
        document.querySelector('#cancel-btn')?.addEventListener('click', () => {
            window.location.hash = this.isEdit ? `/work-orders/${this.id}` : '/work-orders';
        });
    }

    destroy() {}
}
