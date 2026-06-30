/**
 * Work Order Form Component
 */

import { Form } from '../common/form.js';
import workOrderService from '../../services/workOrderService.js';
import clientService from '../../services/clientService.js';
import vehicleService from '../../services/vehicleService.js';

export class WorkOrderForm {
    constructor(params = {}) {
        this.id = params.id;
        this.isEdit = Boolean(params.id);
    }

    async render() {
        return `
            <div class="max-w-3xl mx-auto space-y-6">
                <h1 class="text-2xl font-semibold text-gray-900">${this.isEdit ? 'Edit' : 'New'} Work Order</h1>
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

        const fields = [
            { name: 'clientId', label: 'Client', type: 'select', required: true, options: clientsRes.clients.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` })) },
            { name: 'vehicleId', label: 'Vehicle', type: 'select', required: true, options: vehiclesRes.vehicles.map(v => ({ value: v.id, label: `${v.year} ${v.make} ${v.model}` })) },
            { name: 'description', label: 'Description', type: 'textarea', required: true },
            { name: 'diagnosis', label: 'Diagnosis', type: 'textarea' },
            { name: 'status', label: 'Status', type: 'select', options: [
                { value: 'open', label: 'Open' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
            ]},
            { name: 'priority', label: 'Priority', type: 'select', options: [
                { value: 'low', label: 'Low' },
                { value: 'normal', label: 'Normal' },
                { value: 'high', label: 'High' },
            ]},
            { name: 'totalLaborHours', label: 'Labor Hours', type: 'number' },
            { name: 'totalPartsCost', label: 'Parts Cost', type: 'number' },
            { name: 'totalLaborCost', label: 'Labor Cost', type: 'number' },
        ];

        const form = new Form({
            containerId: 'work-order-form-container',
            fields,
            data,
            submitText: this.isEdit ? 'Update Work Order' : 'Create Work Order',
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
