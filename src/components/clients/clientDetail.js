/**
 * Client Detail Component
 */

import clientService from '../../services/clientService.js';
import { formatDate, formatPhone, formatAddress } from '../../utils/formatters.js';
import { renderPageHeader, renderDetailCard, renderDetailGrid, renderPrimaryButton } from '../../utils/pageHelpers.js';

export class ClientDetail {
    constructor(params = {}) {
        this.id = params.id;
        this.client = null;
    }

    async render() {
        return `<div id="client-detail" class="max-w-5xl mx-auto space-y-6"><div class="flex justify-center py-12"><div class="page-loader"></div></div></div>`;
    }

    async init() {
        try {
            this.client = await clientService.getClient(this.id);
            const vehicles = this.client.vehicles || await clientService.getClientVehicles(this.id);
            const appointments = this.client.recentAppointments || await clientService.getClientAppointments(this.id, { limit: 5 });

            const container = document.getElementById('client-detail');
            container.innerHTML = `
                ${renderPageHeader(
                    `${this.client.firstName} ${this.client.lastName}`,
                    `Customer since ${formatDate(this.client.createdAt, 'short')}`,
                    `
                    <button onclick="window.location.hash = '/clients/${this.id}/edit'" class="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
                        <i data-feather="edit" class="w-4 h-4 mr-1 inline"></i>Edit
                    </button>
                    <button onclick="window.location.hash = '/clients'" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">Back</button>
                    `
                )}
                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div class="lg:col-span-2 space-y-6">
                        ${renderDetailCard('Contact Information', renderDetailGrid([
                            { label: 'Email', value: this.client.email || '-' },
                            { label: 'Phone', value: formatPhone(this.client.phone) || '-' },
                            { label: 'Address', value: formatAddress(this.client) || '-' },
                            { label: 'Preferred Contact', value: this.client.preferredContactMethod || '-' },
                            { label: 'Notes', value: this.client.notes || '-' },
                        ]))}
                        ${renderDetailCard('Vehicles', this.renderVehicles(vehicles), renderPrimaryButton(`/vehicles/new`, 'Add Vehicle'))}
                    </div>
                    <div class="space-y-6">
                        ${renderDetailCard('Quick Stats', renderDetailGrid([
                            { label: 'Vehicles', value: vehicles.length },
                            { label: 'Recent Appointments', value: appointments.length },
                            { label: 'Total Services', value: this.client.serviceHistory?.totalServices ?? '-' },
                            { label: 'Total Spent', value: this.client.serviceHistory?.totalSpent ? `$${this.client.serviceHistory.totalSpent}` : '-' },
                        ]))}
                        ${renderDetailCard('Recent Appointments', this.renderAppointments(appointments))}
                    </div>
                </div>
            `;
            replaceFeatherIcons();
        } catch (error) {
            console.error(error);
            document.getElementById('client-detail').innerHTML = `<p class="text-red-600">Failed to load client.</p>`;
        }
    }

    renderVehicles(vehicles) {
        if (!vehicles.length) return '<p class="text-gray-500 text-sm">No vehicles registered.</p>';
        return `<ul class="divide-y divide-gray-200">${vehicles.map(v => `
            <li class="py-3 flex items-center justify-between">
                <div>
                    <p class="text-sm font-medium text-gray-900">${v.year} ${v.make} ${v.model}</p>
                    <p class="text-sm text-gray-500">${v.licensePlate || 'No plate'} · ${v.mileage?.toLocaleString() || 0} mi</p>
                </div>
                <button onclick="window.location.hash = '/vehicles/${v.id}'" class="text-blue-600 text-sm hover:text-blue-800">View</button>
            </li>
        `).join('')}</ul>`;
    }

    renderAppointments(appointments) {
        if (!appointments.length) return '<p class="text-gray-500 text-sm">No recent appointments.</p>';
        return `<ul class="divide-y divide-gray-200">${appointments.map(a => `
            <li class="py-3">
                <p class="text-sm font-medium text-gray-900">${a.serviceName || 'Service'}</p>
                <p class="text-sm text-gray-500">${formatDate(a.appointmentDate, 'short')} at ${a.appointmentTime}</p>
            </li>
        `).join('')}</ul>`;
    }

    destroy() {}
}
