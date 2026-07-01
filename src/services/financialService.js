import api from './api.js';
import { ENDPOINTS } from '../config/api.js';

export async function fetchInvoices() {
  const data = await api.get(ENDPOINTS.FINANCIAL.INVOICES);
  return data.invoices || [];
}

export async function fetchPayments() {
  const data = await api.get(ENDPOINTS.FINANCIAL.PAYMENTS);
  return data.payments || [];
}
