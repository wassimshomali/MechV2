import { renderPageHeader, renderDataTable, renderSearchBar } from '../components/common/PageLayout.js';
import { renderEmptyState } from '../components/common/EmptyState.js';

const sampleData = {
  vehicles: [
    { vehicle: '2018 Toyota Camry', client: 'Michael Johnson', vin: '...4G1B', lastService: 'Oil Change — Jul 12' },
    { vehicle: '2015 Honda CR-V', client: 'Sarah Williams', vin: '...7H2C', lastService: 'Brake Service — Jul 10' },
    { vehicle: '2017 Ford F-150', client: 'Robert Davis', vin: '...9F3D', lastService: 'Tire Rotation — Jul 8' },
  ],
  appointments: [
    { time: '9:00 AM', client: 'Michael Johnson', vehicle: '2018 Toyota Camry', service: 'Oil Change', status: '<span class="badge bg-primary-100 text-primary-800">Scheduled</span>' },
    { time: '10:30 AM', client: 'Sarah Williams', vehicle: '2015 Honda CR-V', service: 'Brake Inspection', status: '<span class="badge bg-warning-100 text-warning-800">In Progress</span>' },
    { time: '2:00 PM', client: 'Robert Davis', vehicle: '2017 Ford F-150', service: 'Tire Rotation', status: '<span class="badge bg-primary-100 text-primary-800">Scheduled</span>' },
  ],
  inventory: [
    { name: 'Oil Filter — Toyota', sku: 'TO-1234', qty: '2', status: '<span class="badge bg-error-100 text-error-800">Low</span>' },
    { name: 'Brake Pads — Front', sku: 'BP-F456', qty: '1', status: '<span class="badge bg-error-100 text-error-800">Low</span>' },
    { name: '5W-30 Synthetic Oil', sku: 'OIL-5W30', qty: '12', status: '<span class="badge bg-success-100 text-success-800">In Stock</span>' },
  ],
  invoices: [
    { number: 'INV-1042', client: 'Michael Johnson', amount: '$185.00', status: '<span class="badge bg-success-100 text-success-800">Paid</span>', date: 'Jul 12' },
    { number: 'INV-1041', client: 'Sarah Williams', amount: '$420.00', status: '<span class="badge bg-warning-100 text-warning-800">Pending</span>', date: 'Jul 10' },
  ],
  payments: [
    { date: 'Jul 12', client: 'Michael Johnson', amount: '$185.00', method: 'Credit Card', invoice: 'INV-1042' },
    { date: 'Jul 5', client: 'Robert Davis', amount: '$95.00', method: 'Cash', invoice: 'INV-1039' },
  ],
  serviceHistory: [
    { date: 'Jul 12', vehicle: '2018 Toyota Camry', service: 'Oil Change', cost: '$85.00', mechanic: 'John Mechanic' },
    { date: 'Jun 28', vehicle: '2015 Honda CR-V', service: 'Brake Service', cost: '$320.00', mechanic: 'John Mechanic' },
  ],
};

export function renderListPage({ title, description, type, columns, actionLabel, actionHref, filterLowStock = false }) {
  const main = document.getElementById('main-content');
  if (!main) return;

  let rows = sampleData[type] || [];

  if (filterLowStock) {
    rows = rows.filter((r) => r.status?.includes('Low') || parseInt(r.qty, 10) <= 5);
  }

  if (!rows.length) {
    main.innerHTML = `
      ${renderPageHeader({ title, description, actionLabel, actionHref })}
      ${renderEmptyState({ icon: 'inbox', title: 'No records found', description: 'There is nothing to show here yet.' })}
    `;
    return;
  }

  main.innerHTML = `
    ${renderPageHeader({ title, description, actionLabel, actionHref })}
    ${renderSearchBar({ placeholder: `Search ${title.toLowerCase()}...` })}
    ${renderDataTable({ columns, rows })}
  `;
}

export function renderVehiclesPage() {
  renderListPage({
    title: 'Vehicle List',
    description: 'All vehicles registered in your garage.',
    type: 'vehicles',
    actionLabel: 'Add Vehicle',
    actionHref: '#/vehicles/new',
    columns: [
      { key: 'vehicle', label: 'Vehicle' },
      { key: 'client', label: 'Client' },
      { key: 'vin', label: 'VIN' },
      { key: 'lastService', label: 'Last Service' },
    ],
  });
}

export function renderServiceHistoryPage() {
  renderListPage({
    title: 'Service History',
    description: 'Complete service records across all vehicles.',
    type: 'serviceHistory',
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'vehicle', label: 'Vehicle' },
      { key: 'service', label: 'Service' },
      { key: 'cost', label: 'Cost' },
      { key: 'mechanic', label: 'Mechanic' },
    ],
  });
}

export function renderAppointmentsPage() {
  renderListPage({
    title: 'Schedule',
    description: 'Upcoming and recent appointments.',
    type: 'appointments',
    actionLabel: 'New Appointment',
    actionHref: '#/appointments',
    columns: [
      { key: 'time', label: 'Time' },
      { key: 'client', label: 'Client' },
      { key: 'vehicle', label: 'Vehicle' },
      { key: 'service', label: 'Service' },
      { key: 'status', label: 'Status' },
    ],
  });
}

export function renderAppointmentsTodayPage() {
  renderListPage({
    title: "Today's Jobs",
    description: 'Appointments scheduled for today.',
    type: 'appointments',
    actionLabel: 'New Appointment',
    actionHref: '#/appointments',
    columns: [
      { key: 'time', label: 'Time' },
      { key: 'client', label: 'Client' },
      { key: 'vehicle', label: 'Vehicle' },
      { key: 'service', label: 'Service' },
      { key: 'status', label: 'Status' },
    ],
  });
}

export function renderInventoryPage() {
  renderListPage({
    title: 'Parts & Supplies',
    description: 'Manage your parts inventory and stock levels.',
    type: 'inventory',
    actionLabel: 'Add Item',
    actionHref: '#/inventory',
    columns: [
      { key: 'name', label: 'Part Name' },
      { key: 'sku', label: 'SKU' },
      { key: 'qty', label: 'Quantity' },
      { key: 'status', label: 'Status' },
    ],
  });
}

export function renderInventoryLowStockPage() {
  renderListPage({
    title: 'Low Stock',
    description: 'Items that need to be reordered soon.',
    type: 'inventory',
    filterLowStock: true,
    actionLabel: 'View All Inventory',
    actionHref: '#/inventory',
    columns: [
      { key: 'name', label: 'Part Name' },
      { key: 'sku', label: 'SKU' },
      { key: 'qty', label: 'Quantity' },
      { key: 'status', label: 'Status' },
    ],
  });
}

export function renderInvoicesPage() {
  renderListPage({
    title: 'Invoices',
    description: 'Track billing and payment status.',
    type: 'invoices',
    actionLabel: 'Create Invoice',
    actionHref: '#/financial/invoices',
    columns: [
      { key: 'number', label: 'Invoice #' },
      { key: 'client', label: 'Client' },
      { key: 'amount', label: 'Amount' },
      { key: 'status', label: 'Status' },
      { key: 'date', label: 'Date' },
    ],
  });
}

export function renderPaymentsPage() {
  renderListPage({
    title: 'Payments',
    description: 'Payment history and transaction records.',
    type: 'payments',
    columns: [
      { key: 'date', label: 'Date' },
      { key: 'client', label: 'Client' },
      { key: 'amount', label: 'Amount' },
      { key: 'method', label: 'Method' },
      { key: 'invoice', label: 'Invoice' },
    ],
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
