export const routes = [
  { path: '/', module: 'dashboard', title: 'Dashboard', section: 'Dashboard', breadcrumb: 'Overview' },
  { path: '/clients', module: 'clients', title: 'Clients', section: 'Clients', breadcrumb: 'Client List' },
  { path: '/clients/new', module: 'clientForm', title: 'Add Client', section: 'Clients', breadcrumb: 'Add Client' },
  { path: '/clients/scan', module: 'qrScanner', title: 'QR Scanner', section: 'Clients', breadcrumb: 'QR Scanner' },
  { path: '/vehicles', module: 'vehicles', title: 'Vehicles', section: 'Vehicles', breadcrumb: 'Vehicle List' },
  { path: '/vehicles/new', module: 'vehicleForm', title: 'Add Vehicle', section: 'Vehicles', breadcrumb: 'Add Vehicle' },
  { path: '/vehicles/history', module: 'serviceHistory', title: 'Service History', section: 'Vehicles', breadcrumb: 'Service History' },
  { path: '/appointments', module: 'appointments', title: 'Appointments', section: 'Appointments', breadcrumb: 'Schedule' },
  { path: '/appointments/today', module: 'appointmentsToday', title: "Today's Jobs", section: 'Appointments', breadcrumb: "Today's Jobs" },
  { path: '/inventory', module: 'inventory', title: 'Inventory', section: 'Inventory', breadcrumb: 'Parts & Supplies' },
  { path: '/inventory/low-stock', module: 'inventoryLowStock', title: 'Low Stock', section: 'Inventory', breadcrumb: 'Low Stock' },
  { path: '/financial/invoices', module: 'invoices', title: 'Invoices', section: 'Financial', breadcrumb: 'Invoices' },
  { path: '/financial/payments', module: 'payments', title: 'Payments', section: 'Financial', breadcrumb: 'Payments' },
];

export function matchRoute(path) {
  const normalized = path.split('?')[0] || '/';
  return routes.find((route) => route.path === normalized) || routes[0];
}

export function isNavActive(itemHref, currentPath) {
  const itemPath = itemHref.replace('#', '') || '/';
  if (itemPath === '/') return currentPath === '/';
  return currentPath === itemPath || currentPath.startsWith(`${itemPath}/`);
}
