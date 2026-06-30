/**
 * Appointment Form Component
 */

import { Form } from '../common/form.js';
import appointmentService from '../../services/appointmentService.js';
import clientService from '../../services/clientService.js';
import vehicleService from '../../services/vehicleService.js';
import serviceService from '../../services/serviceService.js';

export class AppointmentForm {
    constructor(params = {}) {
        this.id = params.id;
        this.isEdit = Boolean(params.id);
        this.form = null;
    }

    async render() {
        return `
            <div class="max-w-3xl mx-auto space-y-6">
                <h1 class="text-2xl font-semibold text-gray-900">${this.isEdit ? 'Edit' : 'New'} Appointment</h1>
                <div class="bg-white rounded-lg shadow p-6">
                    <div id="appointment-form-container"></div>
                </div>
            </div>
        `;
    }

    async init() {
        const [clientsRes, servicesRes] = await Promise.all([
            clientService.getClients({ limit: 100 }),
            serviceService.getServices({ limit: 100 }),
        ]);

        const clientOptions = clientsRes.clients.map(c => ({ value: c.id, label: `${c.firstName} ${c.lastName}` }));
        const serviceOptions = servicesRes.services.map(s => ({ value: s.id, label: s.name }));
        const vehiclesRes = await vehicleService.getVehicles({ limit: 100 });
        const vehicleOptions = vehiclesRes.vehicles.map(v => ({ value: v.id, label: `${v.year} ${v.make} ${v.model}` }));

        let data = { status: 'scheduled', priority: 'normal', estimatedDuration: 60 };
        if (this.isEdit) {
            const appt = await appointmentService.getAppointment(this.id);
            data = {
                clientId: appt.clientId,
                vehicleId: appt.vehicleId,
                serviceId: appt.serviceId,
                appointmentDate: appt.appointmentDate,
                appointmentTime: appt.appointmentTime,
                estimatedDuration: appt.estimatedDuration,
                status: appt.status,
                priority: appt.priority,
                description: appt.description,
                customerNotes: appt.customerNotes,
            };
        }

        const fields = [
            { name: 'clientId', label: 'Client', type: 'select', required: true, options: clientOptions },
            { name: 'vehicleId', label: 'Vehicle', type: 'select', required: true, options: vehicleOptions },
            { name: 'serviceId', label: 'Service', type: 'select', required: true, options: serviceOptions },
            { name: 'appointmentDate', label: 'Date', type: 'date', required: true },
            { name: 'appointmentTime', label: 'Time', type: 'time', required: true },
            { name: 'estimatedDuration', label: 'Duration (min)', type: 'number' },
            { name: 'status', label: 'Status', type: 'select', options: [
                { value: 'scheduled', label: 'Scheduled' },
                { value: 'confirmed', label: 'Confirmed' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
            ]},
            { name: 'priority', label: 'Priority', type: 'select', options: [
                { value: 'low', label: 'Low' },
                { value: 'normal', label: 'Normal' },
                { value: 'high', label: 'High' },
            ]},
            { name: 'description', label: 'Description', type: 'textarea' },
            { name: 'customerNotes', label: 'Customer Notes', type: 'textarea' },
        ];

        this.form = new Form({
            containerId: 'appointment-form-container',
            fields,
            data,
            submitText: this.isEdit ? 'Update Appointment' : 'Create Appointment',
            onSubmit: async (formData) => {
                const payload = {
                    ...formData,
                    clientId: Number(formData.clientId),
                    vehicleId: Number(formData.vehicleId),
                    serviceId: Number(formData.serviceId),
                    estimatedDuration: Number(formData.estimatedDuration),
                };
                if (this.isEdit) {
                    await appointmentService.updateAppointment(this.id, payload);
                    window.location.hash = '/appointments';
                } else {
                    await appointmentService.createAppointment(payload);
                    window.location.hash = '/appointments';
                }
            },
        });
        this.form.init();
        document.querySelector('#cancel-btn')?.addEventListener('click', () => window.location.hash = '/appointments');
    }

    destroy() {}
}
