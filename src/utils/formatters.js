export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(Number(value) || 0);
}

export function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateStr));
}

export function formatTime(timeStr) {
  if (!timeStr) return '—';
  const [hours, minutes] = timeStr.split(':');
  const date = new Date();
  date.setHours(Number(hours), Number(minutes), 0);
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

export function maskVin(vin) {
  if (!vin) return '—';
  return vin.length > 4 ? `...${vin.slice(-4)}` : vin;
}

const statusStyles = {
  scheduled: 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300',
  confirmed: 'bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300',
  in_progress: 'bg-warning-100 text-warning-800 dark:bg-warning-900/40 dark:text-warning-300',
  completed: 'bg-success-100 text-success-800 dark:bg-success-900/40 dark:text-success-300',
  cancelled: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  no_show: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
  paid: 'bg-success-100 text-success-800 dark:bg-success-900/40 dark:text-success-300',
  sent: 'bg-warning-100 text-warning-800 dark:bg-warning-900/40 dark:text-warning-300',
  overdue: 'bg-error-100 text-error-800 dark:bg-error-900/40 dark:text-error-300',
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
};

export function statusBadge(status) {
  const key = (status || 'unknown').toLowerCase();
  const label = key.replace(/_/g, ' ');
  const classes = statusStyles[key] || 'bg-gray-100 text-gray-800';
  return `<span class="badge ${classes} capitalize">${label}</span>`;
}

export function inventoryStatusBadge(qty, minQty) {
  const quantity = Number(qty);
  const minimum = Number(minQty);
  if (quantity <= 1) {
    return '<span class="badge bg-error-100 text-error-800">Critical</span>';
  }
  if (quantity <= minimum) {
    return '<span class="badge bg-warning-100 text-warning-800">Low</span>';
  }
  return '<span class="badge bg-success-100 text-success-800">In Stock</span>';
}

export function formatPaymentMethod(method) {
  if (!method) return '—';
  return method.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
