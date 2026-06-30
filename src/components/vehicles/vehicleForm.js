/**
 * Vehicle Form Component
 */

import { Form } from '../common/form.js';
import vehicleService from '../../services/vehicleService.js';
import clientService from '../../services/clientService.js';

export class VehicleForm {
    constructor(params = {}) {
        this.id = params.id;
        this.isEdit = Boolean(params.id);
        this.form = null;
        this.clientOptions = [];
    }

    async render() {
        return `
            <div class="max-w-3xl mx-auto space-y-6">
                <h1 class="text-2xl font-semibold text-gray-900">${this.isEdit ? 'Edit' : 'Add'} Vehicle</h1>
                <div class="bg-white rounded-lg shadow p-6">
                    <div id="vehicle-form-container"></div>
                </div>
            </div>
        `;
    }

    async init() {
        const clientsRes = await clientService.getClients({ limit: 100, active: 'true' });
        this.clientOptions = clientsRes.clients.map(c => ({
            value: c.id,
            label: `${c.firstName} ${c.lastName}`,
        }));

        let data = { fuelType: 'gasoline' };
        if (this.isEdit) {
            const vehicle = await vehicleService.getVehicle(this.id);
            data = {
                clientId: vehicle.clientId,
                make: vehicle.make,
                model: vehicle.model,
                year: vehicle.year,
                vin: vehicle.vin,
                licensePlate: vehicle.licensePlate,
                color: vehicle.color,
                engineType: vehicle.engineType,
                transmissionType: vehicle.transmissionType,
                mileage: vehicle.mileage,
                fuelType: vehicle.fuelType || 'gasoline',
                notes: vehicle.notes,
            };
        }

        const fields = [
            { name: 'clientId', label: 'Owner', type: 'select', required: true, options: this.clientOptions },
            { name: 'year', label: 'Year', type: 'number', required: true },
            { name: 'make', label: 'Make', type: 'text', required: true },
            { name: 'model', label: 'Model', type: 'text', required: true },
            { name: 'vin', label: 'VIN', type: 'text' },
            { name: 'licensePlate', label: 'License Plate', type: 'text' },
            { name: 'color', label: 'Color', type: 'text' },
            { name: 'mileage', label: 'Mileage', type: 'number' },
            { name: 'fuelType', label: 'Fuel Type', type: 'select', options: [
                { value: 'gasoline', label: 'Gasoline' },
                { value: 'diesel', label: 'Diesel' },
                { value: 'electric', label: 'Electric' },
                { value: 'hybrid', label: 'Hybrid' },
            ]},
            { name: 'engineType', label: 'Engine', type: 'text' },
            { name: 'transmissionType', label: 'Transmission', type: 'text' },
            { name: 'notes', label: 'Notes', type: 'textarea' },
        ];

        this.form = new Form({
            containerId: 'vehicle-form-container',
            fields,
            data,
            submitText: this.isEdit ? 'Update Vehicle' : 'Create Vehicle',
            onSubmit: async (formData) => {
                const payload = { ...formData, clientId: Number(formData.clientId), year: Number(formData.year), mileage: formData.mileage ? Number(formData.mileage) : null };
                if (this.isEdit) {
                    await vehicleService.updateVehicle(this.id, payload);
                    window.location.hash = `/vehicles/${this.id}`;
                } else {
                    const created = await vehicleService.createVehicle(payload);
                    window.location.hash = `/vehicles/${created.id}`;
                }
            },
        });
        this.form.init();
        document.querySelector('#cancel-btn')?.addEventListener('click', () => {
            window.location.hash = this.isEdit ? `/vehicles/${this.id}` : '/vehicles';
        });
    }

    destroy() {}
}
