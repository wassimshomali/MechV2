export const navigation = [
  {
    label: 'Dashboard',
    items: [{ href: '#/', icon: 'home', label: 'Overview' }],
  },
  {
    label: 'Clients',
    items: [
      { href: '#/clients', icon: 'users', label: 'Client List' },
      { href: '#/clients/new', icon: 'user-plus', label: 'Add Client' },
      { href: '#/clients/scan', icon: 'qr-code', label: 'QR Scanner' },
    ],
  },
  {
    label: 'Vehicles',
    items: [
      { href: '#/vehicles', icon: 'truck', label: 'Vehicle List' },
      { href: '#/vehicles/new', icon: 'plus-circle', label: 'Add Vehicle' },
      { href: '#/vehicles/history', icon: 'book-open', label: 'Service History' },
    ],
  },
  {
    label: 'Appointments',
    items: [
      { href: '#/appointments', icon: 'calendar', label: 'Schedule' },
      { href: '#/appointments/today', icon: 'clock', label: "Today's Jobs" },
    ],
  },
  {
    label: 'Inventory',
    items: [
      { href: '#/inventory', icon: 'package', label: 'Parts & Supplies' },
      { href: '#/inventory/low-stock', icon: 'alert-circle', label: 'Low Stock' },
    ],
  },
  {
    label: 'Financial',
    items: [
      { href: '#/financial/invoices', icon: 'dollar-sign', label: 'Invoices' },
      { href: '#/financial/payments', icon: 'credit-card', label: 'Payments' },
    ],
  },
];
