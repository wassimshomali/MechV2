import { renderAvatar } from '../common/Avatar.js';

const stats = [
  {
    label: "Today's Appointments",
    value: '5',
    icon: 'calendar',
    iconBg: 'bg-primary-50 text-primary-600 dark:bg-primary-900/40 dark:text-primary-300',
    meta: 'Next: 10:30 AM — Oil Change',
    metaIcon: 'clock',
    stagger: 'stagger-1',
  },
  {
    label: 'Monthly Revenue',
    value: '$3,450',
    icon: 'dollar-sign',
    iconBg: 'bg-success-50 text-success-600 dark:bg-success-900/40 dark:text-success-300',
    meta: '12% from last month',
    metaIcon: 'trending-up',
    stagger: 'stagger-2',
  },
  {
    label: 'Active Clients',
    value: '87',
    icon: 'users',
    iconBg: 'bg-info-50 text-info-600 dark:bg-info-900/40 dark:text-info-300',
    meta: '5 new this month',
    metaIcon: 'user-plus',
    stagger: 'stagger-3',
  },
  {
    label: 'Low Inventory Items',
    value: '7',
    icon: 'alert-triangle',
    iconBg: 'bg-error-50 text-error-600 dark:bg-error-900/40 dark:text-error-300',
    meta: 'Oil filters, brake pads',
    metaIcon: 'package',
    stagger: 'stagger-4',
  },
];

const clients = [
  { name: 'Michael Johnson', time: 'Yesterday', detail: '2018 Toyota Camry — Oil Change' },
  { name: 'Sarah Williams', time: '2 days ago', detail: '2015 Honda CR-V — Brake Service' },
  { name: 'Robert Davis', time: '3 days ago', detail: '2017 Ford F-150 — Tire Rotation' },
  { name: 'Jennifer Miller', time: '5 days ago', detail: '2020 Subaru Outback — 30K Service' },
];

const quickActions = [
  { label: 'Add Client', icon: 'user-plus', classes: 'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300' },
  { label: 'Add Vehicle', icon: 'truck', classes: 'bg-success-50 text-success-700 hover:bg-success-100 dark:bg-success-900/30 dark:text-success-300' },
  { label: 'New Appointment', icon: 'calendar', classes: 'bg-info-50 text-info-700 hover:bg-info-100 dark:bg-info-900/30 dark:text-info-300' },
  { label: 'Create Invoice', icon: 'file-text', classes: 'bg-warning-50 text-warning-700 hover:bg-warning-100 dark:bg-warning-900/30 dark:text-warning-300' },
  { label: 'Add Inventory', icon: 'package', classes: 'bg-error-50 text-error-700 hover:bg-error-100 dark:bg-error-900/30 dark:text-error-300' },
  { label: 'Scan QR', icon: 'qr-code', classes: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 dark:bg-secondary-800 dark:text-secondary-200' },
];

const inventory = [
  { name: 'Oil Filter — Toyota', part: 'Part #TO-1234', qty: '2 left', level: 'inventory-low', color: 'text-error-500' },
  { name: 'Brake Pads — Front', part: 'Part #BP-F456', qty: '1 left', level: 'inventory-low', color: 'text-error-500' },
  { name: '5W-30 Synthetic Oil', part: 'Part #OIL-5W30', qty: '4 left', level: 'inventory-medium', color: 'text-warning-500' },
  { name: 'Air Filter', part: 'Part #AF-789', qty: '5 left', level: 'inventory-medium', color: 'text-warning-500' },
];

function renderCalendarDays() {
  const days = [
    28, 29, 30, 31, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
    { day: 15, today: true, appointment: '3 Appts' },
    16, 17, 18, 19, 20, 21,
  ];

  return days
    .map((d) => {
      if (typeof d === 'object') {
        return `<button type="button" class="calendar-day today has-appointment" aria-label="July ${d.day}, 3 appointments">
          <span>${d.day}</span>
          <span class="text-xs text-primary-600 dark:text-primary-400">${d.appointment}</span>
        </button>`;
      }
      return `<button type="button" class="calendar-day" aria-label="Day ${d}">${d}</button>`;
    })
    .join('');
}

export function renderDashboard() {
  const statsHtml = stats
    .map(
      (stat) => `
    <div class="dashboard-card ${stat.stagger}">
      <div class="flex items-center justify-between gap-4">
        <div class="min-w-0">
          <p class="text-sm font-medium text-gray-500 dark:text-gray-400">${stat.label}</p>
          <p class="stat-value mt-1">${stat.value}</p>
        </div>
        <div class="stat-icon ${stat.iconBg} shrink-0">
          <i data-feather="${stat.icon}"></i>
        </div>
      </div>
      <div class="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <div class="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
          <i data-feather="${stat.metaIcon}" class="w-4 h-4 shrink-0"></i>
          <span class="truncate">${stat.meta}</span>
        </div>
      </div>
    </div>
  `
    )
    .join('');

  const clientsHtml = clients
    .map(
      (client) => `
    <div class="list-row">
      ${renderAvatar(client.name)}
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <h3 class="text-sm font-medium truncate">${client.name}</h3>
          <span class="text-xs text-gray-500 shrink-0">${client.time}</span>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 truncate">${client.detail}</p>
      </div>
    </div>
  `
    )
    .join('');

  const actionsHtml = quickActions
    .map(
      (action) => `
    <button type="button" class="quick-action ${action.classes}">
      <i data-feather="${action.icon}" class="w-6 h-6"></i>
      <span>${action.label}</span>
    </button>
  `
    )
    .join('');

  const inventoryHtml = inventory
    .map(
      (item) => `
    <div class="list-row inventory-item ${item.level}">
      <i data-feather="alert-circle" class="w-5 h-5 ${item.color} shrink-0"></i>
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2">
          <h3 class="text-sm font-medium truncate">${item.name}</h3>
          <span class="text-xs font-semibold ${item.color} shrink-0">${item.qty}</span>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400">${item.part}</p>
      </div>
    </div>
  `
    )
    .join('');

  return `
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
      ${statsHtml}
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 space-y-6">
        <section class="panel animate-fade-in">
          <div class="panel-header">
            <h2 class="panel-title">Appointments</h2>
            <button type="button" class="btn btn-primary">
              <i data-feather="plus"></i>
              New Appointment
            </button>
          </div>
          <div class="panel-body">
            <div class="grid grid-cols-7 gap-2 mb-4">
              ${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => `<div class="text-center text-xs font-medium text-gray-500 uppercase tracking-wide">${d}</div>`).join('')}
            </div>
            <div class="grid grid-cols-7 gap-2" role="grid" aria-label="July calendar">
              ${renderCalendarDays()}
            </div>
          </div>
        </section>

        <section class="panel animate-fade-in">
          <div class="panel-header">
            <h2 class="panel-title">Recent Clients</h2>
          </div>
          <div class="divide-y divide-gray-100 dark:divide-gray-800">
            ${clientsHtml}
          </div>
          <div class="p-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <a href="#/clients" class="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors">View all clients</a>
          </div>
        </section>
      </div>

      <div class="space-y-6">
        <section class="panel animate-fade-in">
          <div class="panel-header">
            <h2 class="panel-title">Quick Actions</h2>
          </div>
          <div class="panel-body grid grid-cols-2 gap-3">
            ${actionsHtml}
          </div>
        </section>

        <section class="panel animate-fade-in">
          <div class="panel-header">
            <h2 class="panel-title">Low Inventory</h2>
          </div>
          <div class="divide-y divide-gray-100 dark:divide-gray-800">
            ${inventoryHtml}
          </div>
          <div class="p-4 border-t border-gray-100 dark:border-gray-800 text-center">
            <a href="#/inventory/low-stock" class="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors">View all inventory</a>
          </div>
        </section>

        <section class="qr-scanner overflow-hidden animate-fade-in">
          <div class="panel-header border-secondary-700">
            <h2 class="panel-title text-white">QR Scanner</h2>
          </div>
          <div class="p-6 flex flex-col items-center">
            <div class="w-full aspect-video max-h-48 bg-black/40 rounded-xl mb-4 flex items-center justify-center border border-secondary-700/50">
              <i data-feather="camera" class="w-12 h-12 text-secondary-400"></i>
            </div>
            <button type="button" class="btn btn-primary w-full">
              <i data-feather="maximize"></i>
              Open Scanner
            </button>
          </div>
        </section>
      </div>
    </div>
  `;
}

export function initDashboard() {
  document.querySelectorAll('.calendar-day').forEach((day) => {
    day.addEventListener('click', () => {
      document.querySelectorAll('.calendar-day').forEach((d) => d.classList.remove('selected'));
      day.classList.add('selected');
    });
  });
}
