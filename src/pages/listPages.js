import { renderPageHeader, renderDataTable, renderSearchBar } from '../components/common/PageLayout.js';
import { renderEmptyState } from '../components/common/EmptyState.js';
import { renderLoadingState } from '../components/common/LoadingState.js';
import { fetchVehicles, fetchServiceHistory } from '../services/vehicleService.js';
import { fetchAppointments, fetchTodayAppointments } from '../services/appointmentService.js';
import { fetchInventory, fetchLowStockInventory } from '../services/inventoryService.js';
import { fetchInvoices, fetchPayments } from '../services/financialService.js';
import {
  formatCurrency,
  formatDate,
  formatTime,
  maskVin,
  statusBadge,
  inventoryStatusBadge,
  formatPaymentMethod,
} from '../utils/formatters.js';

async function safeFetch(fetcher, fallback = []) {
  try {
    return await fetcher();
  } catch {
    return fallback;
  }
}

function renderListContent({ title, description, actionLabel, actionHref, columns, rows, emptyIcon = 'inbox', emptyTitle = 'No records found', emptyDescription = 'There is nothing to show here yet.' }) {
  const main = document.getElementById('main-content');
  if (!main) return;

  if (!rows.length) {
    main.innerHTML = `
      ${renderPageHeader({ title, description, actionLabel, actionHref })}
      ${renderEmptyState({ icon: emptyIcon, title: emptyTitle, description: emptyDescription, actionLabel, actionHref })}
    `;
    return;
  }

  main.innerHTML = `
    ${renderPageHeader({ title, description: `${rows.length} record${rows.length === 1 ? '' : 's'}`, actionLabel, actionHref })}
    ${renderSearchBar({ placeholder: `Search ${title.toLowerCase()}...` })}
    ${renderDataTable({ columns, rows })}
  `;
}

function showLoading(title, description, actionLabel, actionHref) {
  const main = document.getElementById('main-content');
  if (!main) return;
  main.innerHTML = `
    ${renderPageHeader({ title, description, actionLabel, actionHref })}
    ${renderLoadingState({ rows: 6 })}
  `;
}

export async function renderVehiclesPage() {
  const config = {
    title: 'Vehicle List',
    description: 'All vehicles registered in your garage.',
    actionLabel: 'Add Vehicle',
    actionHref: '#/vehicles/new',
    emptyIcon: 'truck',
    emptyTitle: 'No vehicles yet',
    emptyDescription: 'Register a vehicle to start tracking service history and appointments.',
  };

  showLoading(config.title, config.description, config.actionLabel, config.actionHref);

  const vehicles = await safeFetch(fetchVehicles);
  const rows = vehicles.map((v) => ({
    vehicle: `<span class="font-medium">${v.year} ${v.make} ${v.model}</span>`,
    client: v.client_name || '—',
    vin: maskVin(v.vin),
    lastService: v.last_service || '—',
  }));

  renderListContent({
    ...config,
    columns: [
      { key: 'vehicle', label: 'Vehicle' },
      { key: 'client', label: 'Client' },
      { key: 'vin', label: 'VIN' },
      { key: 'lastService', label: 'Last Service' },
    ],
    rows,
  });
}

export async function renderServiceHistoryPage() {
  const config = {
    title: 'Service History',
    description: 'Complete service records across all vehicles.',
    emptyIcon: 'book-open',
    emptyTitle: 'No service history',
    emptyDescription: 'Completed work orders will appear here automatically.',
  };

  showLoading(config.title, config.description);

  const history = await safeFetch(fetchServiceHistory);
  const rows = history.map((item) => ({
    date: formatDate(item.service_date),
    vehicle: item.vehicle || '—',
    service: item.description || item.service_type || '—',
    cost: formatCurrency(item.total_cost),
    mechanic: item.mechanic || '—',
  }));

  renderListContent({
    ...config,
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'vehicle', label: 'Vehicle' },
      { key: 'service', label: 'Service' },
      { key: 'cost', label: 'Cost' },
      { key: 'mechanic', label: 'Mechanic' },
    ],
    rows,
  });
}

export async function renderAppointmentsPage() {
  const config = {
    title: 'Schedule',
    description: 'Upcoming and recent appointments.',
    actionLabel: 'New Appointment',
    actionHref: '#/appointments',
    emptyIcon: 'calendar',
    emptyTitle: 'No upcoming appointments',
    emptyDescription: 'Schedule your first appointment to fill the calendar.',
  };

  showLoading(config.title, config.description, config.actionLabel, config.actionHref);

  const appointments = await safeFetch(fetchAppointments);
  const rows = appointments.map((a) => ({
    time: `${formatDate(a.appointment_date)} ${formatTime(a.appointment_time)}`,
    client: a.client_name || '—',
    vehicle: a.vehicle || '—',
    service: a.service_name || '—',
    status: statusBadge(a.status),
  }));

  renderListContent({
    ...config,
    columns: [
      { key: 'time', label: 'Date / Time' },
      { key: 'client', label: 'Client' },
      { key: 'vehicle', label: 'Vehicle' },
      { key: 'service', label: 'Service' },
      { key: 'status', label: 'Status' },
    ],
    rows,
  });
}

export async function renderAppointmentsTodayPage() {
  const config = {
    title: "Today's Jobs",
    description: 'Appointments scheduled for today.',
    actionLabel: 'New Appointment',
    actionHref: '#/appointments',
    emptyIcon: 'clock',
    emptyTitle: 'No jobs today',
    emptyDescription: 'Enjoy the quiet day — or schedule a new appointment.',
  };

  showLoading(config.title, config.description, config.actionLabel, config.actionHref);

  const appointments = await safeFetch(fetchTodayAppointments);
  const rows = appointments.map((a) => ({
    time: formatTime(a.appointment_time),
    client: a.client_name || '—',
    vehicle: a.vehicle || '—',
    service: a.service_name || '—',
    status: statusBadge(a.status),
  }));

  renderListContent({
    ...config,
    columns: [
      { key: 'time', label: 'Time' },
      { key: 'client', label: 'Client' },
      { key: 'vehicle', label: 'Vehicle' },
      { key: 'service', label: 'Service' },
      { key: 'status', label: 'Status' },
    ],
    rows,
  });
}

export async function renderInventoryPage() {
  const config = {
    title: 'Parts & Supplies',
    description: 'Manage your parts inventory and stock levels.',
    actionLabel: 'Add Item',
    actionHref: '#/inventory',
    emptyIcon: 'package',
    emptyTitle: 'No inventory items',
    emptyDescription: 'Add parts and supplies to track stock levels.',
  };

  showLoading(config.title, config.description, config.actionLabel, config.actionHref);

  const items = await safeFetch(fetchInventory);
  const rows = items.map((item) => ({
    name: `<span class="font-medium">${item.name}</span>`,
    sku: item.part_number || '—',
    qty: String(item.quantity_on_hand ?? 0),
    status: inventoryStatusBadge(item.quantity_on_hand, item.minimum_quantity),
  }));

  renderListContent({
    ...config,
    columns: [
      { key: 'name', label: 'Part Name' },
      { key: 'sku', label: 'SKU' },
      { key: 'qty', label: 'Quantity' },
      { key: 'status', label: 'Status' },
    ],
    rows,
  });
}

export async function renderInventoryLowStockPage() {
  const config = {
    title: 'Low Stock',
    description: 'Items that need to be reordered soon.',
    actionLabel: 'View All Inventory',
    actionHref: '#/inventory',
    emptyIcon: 'alert-circle',
    emptyTitle: 'All stocked up',
    emptyDescription: 'No items are currently below their minimum quantity.',
  };

  showLoading(config.title, config.description, config.actionLabel, config.actionHref);

  const items = await safeFetch(fetchLowStockInventory);
  const rows = items.map((item) => ({
    name: `<span class="font-medium">${item.name}</span>`,
    sku: item.part_number || '—',
    qty: String(item.quantity_on_hand ?? 0),
    status: inventoryStatusBadge(item.quantity_on_hand, item.minimum_quantity),
  }));

  renderListContent({
    ...config,
    columns: [
      { key: 'name', label: 'Part Name' },
      { key: 'sku', label: 'SKU' },
      { key: 'qty', label: 'Quantity' },
      { key: 'status', label: 'Status' },
    ],
    rows,
  });
}

export async function renderInvoicesPage() {
  const config = {
    title: 'Invoices',
    description: 'Track billing and payment status.',
    actionLabel: 'Create Invoice',
    actionHref: '#/financial/invoices',
    emptyIcon: 'file-text',
    emptyTitle: 'No invoices yet',
    emptyDescription: 'Create an invoice after completing a work order.',
  };

  showLoading(config.title, config.description, config.actionLabel, config.actionHref);

  const invoices = await safeFetch(fetchInvoices);
  const rows = invoices.map((inv) => ({
    number: inv.invoice_number || '—',
    client: inv.client_name || '—',
    amount: formatCurrency(inv.total_amount),
    status: statusBadge(inv.status),
    date: formatDate(inv.invoice_date),
  }));

  renderListContent({
    ...config,
    columns: [
      { key: 'number', label: 'Invoice #' },
      { key: 'client', label: 'Client' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status' },
      { key: 'date', label: 'Date' },
    ],
    rows,
  });
}

export async function renderPaymentsPage() {
  const config = {
    title: 'Payments',
    description: 'Payment history and transaction records.',
    emptyIcon: 'credit-card',
    emptyTitle: 'No payments recorded',
    emptyDescription: 'Payments will appear here when invoices are marked as paid.',
  };

  showLoading(config.title, config.description);

  const payments = await safeFetch(fetchPayments);
  const rows = payments.map((p) => ({
    date: formatDate(p.payment_date),
    client: p.client_name || '—',
    amount: formatCurrency(p.amount),
    method: formatPaymentMethod(p.payment_method),
    invoice: p.invoice_number || '—',
  }));

  renderListContent({
    ...config,
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'client', label: 'Client' },
      { key: 'amount', label: 'Amount' },
      { key: 'method', label: 'Method' },
      { key: 'invoice', label: 'Invoice' },
    ],
    rows,
  });
}

export function renderQrScannerPage() {
  const main = document.getElementById('main-content');
  if (!main) return;

  main.innerHTML = `
    ${renderPageHeader({
      title: 'QR Scanner',
      description: 'Scan vehicle or client QR codes for quick lookup.',
    })}
    <div class="panel max-w-lg mx-auto animate-fade-in">
      <div class="p-8 flex flex-col items-center">
        <div class="w-full aspect-square max-w-sm bg-gray-900 rounded-2xl mb-6 flex items-center justify-center border-2 border-dashed border-gray-700 relative overflow-hidden">
          <div class="absolute inset-8 border-2 border-primary-500/50 rounded-lg"></div>
          <i data-feather="camera" class="w-16 h-16 text-gray-500"></i>
        </div>
        <p class="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">
          Position the QR code within the frame to scan. Works with vehicle and client codes.
        </p>
        <button type="button" class="btn btn-primary w-full max-w-sm">
          <i data-feather="maximize"></i>
          Open Camera Scanner
        </button>
      </div>
    </div>
  `;
}
