/**
 * Vehicle Form Component
 */

import { Form } from '../common/form.js';
import vehicleService from '../../services/vehicleService.js';
import clientService from '../../services/clientService.js';
import { t } from '../../i18n/index.js';

function getVehicleFields(clientOptions) {
    return [
        { name: 'clientId', label: t('vehicles.owner'), type: 'select', required: true, options: clientOptions },
        { name: 'year', label: t('fields.year'), type: 'number', required: true },
        { name: 'make', label: t('fields.make'), type: 'text', required: true },
        { name: 'model', label: t('fields.model'), type: 'text', required: true },
        { name: 'vin', label: t('fields.vin'), type: 'text' },
        { name: 'licensePlate', label: t('fields.licensePlate'), type: 'text' },
        { name: 'color', label: t('fields.color'), type: 'text' },
        { name: 'mileage', label: t('fields.mileage'), type: 'number' },
        { name: 'fuelType', label: t('fields.fuelType'), type: 'select', options: [
            { value: 'gasoline', label: 'Gasoline' },
            { value: 'diesel', label: 'Diesel' },
            { value: 'electric', label: 'Electric' },
            { value: 'hybrid', label: 'Hybrid' },
        ]},
        { name: 'engineType', label: t('fields.engine'), type: 'text' },
        { name: 'transmissionType', label: t('fields.transmission'), type: 'text' },
        { name: 'notes', label: t('fields.notes'), type: 'textarea' },
    ];
}

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
                <h1 class="text-2xl font-semibold text-gray-900">${this.isEdit ? t('vehicles.editVehicle') : t('vehicles.addVehicleTitle')}</h1>
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

        this.form = new Form({
            containerId: 'vehicle-form-container',
            fields: getVehicleFields(this.clientOptions),
            data,
            submitText: this.isEdit ? t('vehicles.updateVehicle') : t('vehicles.createVehicle'),
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
