/**
 * Vehicle Detail Component
 */

import vehicleService from '../../services/vehicleService.js';
import { formatDate, formatMileage, formatAddress } from '../../utils/formatters.js';
import { renderPageHeader, renderDetailCard, renderDetailGrid, statusBadge } from '../../utils/pageHelpers.js';

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
                        <button onclick="window.location.hash = '/vehicles/${this.id}/edit'" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm">Edit</button>
                        <button onclick="window.location.hash = '/vehicles'" class="px-4 py-2 border border-gray-300 rounded-md text-sm bg-white">Back</button>
                        `
                    )}
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        ${renderDetailCard('Vehicle Info', renderDetailGrid([
                            { label: 'VIN', value: vehicle.vin },
                            { label: 'License Plate', value: vehicle.licensePlate },
                            { label: 'Color', value: vehicle.color },
                            { label: 'Mileage', value: formatMileage(vehicle.mileage) },
                            { label: 'Engine', value: vehicle.engineType },
                            { label: 'Transmission', value: vehicle.transmissionType },
                            { label: 'Fuel Type', value: vehicle.fuelType },
                            { label: 'Notes', value: vehicle.notes },
                        ]))}
                        ${renderDetailCard('Owner', renderDetailGrid([
                            { label: 'Name', value: vehicle.clientName },
                            { label: 'Phone', value: vehicle.clientPhone },
                            { label: 'Email', value: vehicle.clientEmail },
                            { label: 'Address', value: formatAddress({ address: vehicle.clientAddress, city: vehicle.clientCity, state: vehicle.clientState, zipCode: vehicle.clientZip }) },
                        ]))}
                    </div>
                    ${vehicle.upcomingAppointments?.length ? renderDetailCard('Upcoming Appointments', `
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
            document.getElementById('vehicle-detail').innerHTML = '<p class="text-red-600">Failed to load vehicle.</p>';
        }
    }

    destroy() {}
}
