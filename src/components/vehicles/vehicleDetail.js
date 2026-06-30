/**
 * Vehicle Detail Component
 */

import vehicleService from '../../services/vehicleService.js';
import { formatDate, formatMileage, formatAddress } from '../../utils/formatters.js';
import { renderPageHeader, renderDetailCard, renderDetailGrid, statusBadge } from '../../utils/pageHelpers.js';
import { t } from '../../i18n/index.js';

export class VehicleDetail {
    constructor(params = {}) {
        this.id = params.id;
    }

    async render() {
        return `<div id="vehicle-detail" class="max-w-5xl mx-auto"><div class="flex justify-center py-12"><div class="page-loader"></div></div></div>`;
    }

    async init() {
        try {
            const vehicle = await vehicleService.getVehicle(this.id);
            const container = document.getElementById('vehicle-detail');
            container.innerHTML = `
                <div class="space-y-6">
                    ${renderPageHeader(
                        `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
                        vehicle.clientName || '',
                        `
                        <button onclick="window.location.hash = '/vehicles/${this.id}/edit'" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">${t('common.edit')}</button>
                        <button onclick="window.location.hash = '/vehicles'" class="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white">${t('common.back')}</button>
                        `
                    )}
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        ${renderDetailCard(t('vehicles.vehicleDetails'), renderDetailGrid([
                            { label: t('fields.vin'), value: vehicle.vin },
                            { label: t('fields.licensePlate'), value: vehicle.licensePlate },
                            { label: t('fields.color'), value: vehicle.color },
                            { label: t('fields.mileage'), value: formatMileage(vehicle.mileage) },
                            { label: t('fields.engine'), value: vehicle.engineType },
                            { label: t('fields.transmission'), value: vehicle.transmissionType },
                            { label: t('fields.fuelType'), value: vehicle.fuelType },
                            { label: t('fields.notes'), value: vehicle.notes },
                        ]))}
                        ${renderDetailCard(t('vehicles.owner'), renderDetailGrid([
                            { label: t('fields.name'), value: vehicle.clientName },
                            { label: t('fields.phone'), value: vehicle.clientPhone },
                            { label: t('fields.email'), value: vehicle.clientEmail },
                            { label: t('fields.address'), value: formatAddress({ address: vehicle.clientAddress, city: vehicle.clientCity, state: vehicle.clientState, zipCode: vehicle.clientZip }) },
                        ]))}
                    </div>
                    ${vehicle.upcomingAppointments?.length ? renderDetailCard(t('appointments.title'), `
                        <ul class="divide-y divide-gray-200">${vehicle.upcomingAppointments.map(a => `
                            <li class="py-2 flex justify-between text-sm">
                                <span>${formatDate(a.appointmentDate, 'short')} ${a.appointmentTime}</span>
                                ${statusBadge(a.status)}
                            </li>
                        `).join('')}</ul>
                    `) : ''}
                </div>
            `;
            replaceFeatherIcons();
        } catch (error) {
            document.getElementById('vehicle-detail').innerHTML = `<p class="text-red-600">${t('vehicles.errorLoading')}</p>`;
        }
    }

    destroy() {}
}
