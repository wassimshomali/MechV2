/**
 * Appointment List Component
 */

import { DataTable } from '../common/table.js';
import { Modal } from '../common/modal.js';
import appointmentService from '../../services/appointmentService.js';
import { formatDate } from '../../utils/formatters.js';
import { renderPageHeader, renderPrimaryButton, statusBadge, priorityBadge } from '../../utils/pageHelpers.js';
import { t } from '../../i18n/index.js';

export class AppointmentList {
    constructor(params = {}) {
        this.params = params;
        this.filter = params.filter;
        this.table = null;
        this.currentPage = 1;
        this.currentSearch = '';
    }

    async render() {
        const title = this.filter === 'today' ? t('titles.todaysAppointments') : t('appointments.title');
        return `
            <div class="space-y-6">
                ${renderPageHeader(title, t('appointments.subtitle'), `
                    ${renderPrimaryButton('/appointments/calendar', t('appointments.calendar'), 'calendar')}
                    ${renderPrimaryButton('/appointments/new', t('appointments.newAppointment'))}
                `)}
                <div id="appointments-table"></div>
            </div>
        `;
    }

    async init() {
        this.table = new DataTable({
            containerId: 'appointments-table',
            columns: [
                {
                    key: 'appointmentDate',
                    label: t('appointments.dateTime'),
                    formatter: (v, row) => `
                        <div class="text-sm font-medium text-gray-900">${formatDate(v, 'short')}</div>
                        <div class="text-sm text-gray-500">${row.appointmentTime}</div>
                    `
                },
                { key: 'clientName', label: t('appointments.client') },
                { key: 'vehicleInfo', label: t('appointments.vehicle'), formatter: v => v || '-' },
                { key: 'serviceName', label: t('appointments.service'), formatter: v => v || '-' },
                { key: 'status', label: t('fields.status'), formatter: v => statusBadge(v) },
                { key: 'priority', label: t('fields.priority'), formatter: v => priorityBadge(v) },
                {
                    key: 'actions',
                    label: t('common.actions'),
                    actions: [
                        { name: 'edit', icon: 'edit', label: t('common.edit'), color: 'green', handler: (row) => window.location.hash = `/appointments/${row.id}/edit` },
                        { name: 'cancel', icon: 'x', label: t('common.cancel'), color: 'red', handler: (row) => this.confirmCancel(row) },
                    ]
                }
            ],
            searchable: true,
            onPageChange: (page) => { this.currentPage = page; this.loadData(); },
            onSearch: (q) => { this.currentSearch = q; this.currentPage = 1; this.loadData(); },
            emptyMessage: t('appointments.empty'),
        });
        await this.loadData();
    }

    async loadData() {
        try {
            this.table.setLoading(true);
            let rows, pagination;
            if (this.filter === 'today') {
                rows = await appointmentService.getTodayAppointments();
                pagination = { page: 1, limit: rows.length, total: rows.length, totalPages: 1 };
            } else {
                const response = await appointmentService.getAppointments({ page: this.currentPage, limit: 20, search: this.currentSearch });
                rows = response.appointments;
                pagination = response.pagination;
            }
            this.table.update(rows, pagination);
        } catch (error) {
            window.showNotification(t('appointments.errorLoading'), 'error');
            this.table.setLoading(false);
        }
    }

    confirmCancel(appointment) {
        Modal.confirm(t('appointments.deleteTitle'), t('appointments.deleteMessage'), async () => {
            await appointmentService.cancelAppointment(appointment.id);
            window.showNotification(t('appointments.deleted'), 'success');
            this.loadData();
        });
    }

    destroy() { if (this.table) this.table.destroy(); }
}
