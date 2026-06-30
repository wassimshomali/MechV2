/**
 * Appointment Calendar Component
 */

import appointmentService from '../../services/appointmentService.js';
import { formatDate } from '../../utils/formatters.js';
import { renderPageHeader, renderPrimaryButton, statusBadge } from '../../utils/pageHelpers.js';

export class AppointmentCalendar {
    constructor() {
        this.currentDate = new Date();
    }

    async render() {
        return `
            <div class="space-y-6">
                ${renderPageHeader('Appointment Calendar', 'Monthly view of scheduled work', renderPrimaryButton('/appointments/new', 'New Appointment'))}
                <div class="bg-white rounded-lg shadow p-6">
                    <div class="flex items-center justify-between mb-6">
                        <button id="cal-prev" class="p-2 rounded-md hover:bg-gray-100"><i data-feather="chevron-left"></i></button>
                        <h2 id="cal-title" class="text-lg font-semibold text-gray-900"></h2>
                        <button id="cal-next" class="p-2 rounded-md hover:bg-gray-100"><i data-feather="chevron-right"></i></button>
                    </div>
                    <div id="cal-grid" class="grid grid-cols-7 gap-1 text-center text-sm"></div>
                    <div id="cal-day-detail" class="mt-6 border-t pt-6"></div>
                </div>
            </div>
        `;
    }

    async init() {
        document.getElementById('cal-prev').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.renderCalendar();
        });
        document.getElementById('cal-next').addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.renderCalendar();
        });
        await this.renderCalendar();
    }

    async renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-01`;
        document.getElementById('cal-title').textContent = this.currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

        const { appointments } = await appointmentService.getCalendarData(dateStr, 'month');
        const apptDates = new Set(appointments.map(a => a.appointmentDate));

        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date().toISOString().split('T')[0];

        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        let html = dayNames.map(d => `<div class="font-medium text-gray-500 py-2">${d}</div>`).join('');

        for (let i = 0; i < firstDay; i++) html += '<div></div>';

        for (let day = 1; day <= daysInMonth; day++) {
            const d = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const classes = ['calendar-day', 'h-12', 'rounded-md', 'cursor-pointer', 'flex', 'flex-col', 'items-center', 'justify-center'];
            if (d === today) classes.push('today');
            if (apptDates.has(d)) classes.push('has-appointment');
            html += `<button class="${classes.join(' ')}" data-date="${d}">${day}</button>`;
        }

        document.getElementById('cal-grid').innerHTML = html;
        document.getElementById('cal-grid').querySelectorAll('[data-date]').forEach(btn => {
            btn.addEventListener('click', () => this.showDay(btn.dataset.date, appointments));
        });
        replaceFeatherIcons();
    }

    showDay(date, appointments) {
        const dayAppts = appointments.filter(a => a.appointmentDate === date);
        const el = document.getElementById('cal-day-detail');
        if (!dayAppts.length) {
            el.innerHTML = `<p class="text-gray-500">No appointments on ${formatDate(date, 'short')}.</p>`;
            return;
        }
        el.innerHTML = `
            <h3 class="text-md font-semibold text-gray-900 mb-3">${formatDate(date, 'long')}</h3>
            <ul class="space-y-2">${dayAppts.map(a => `
                <li class="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div>
                        <p class="text-sm font-medium">${a.appointmentTime} — ${a.clientName}</p>
                        <p class="text-xs text-gray-500">${a.serviceName || ''} · ${a.vehicleInfo || ''}</p>
                    </div>
                    ${statusBadge(a.status)}
                </li>
            `).join('')}</ul>
        `;
    }

    destroy() {}
}
