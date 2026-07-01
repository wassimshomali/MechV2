import api from './api.js';
import { ENDPOINTS } from '../config/api.js';

export async function fetchInventory() {
  const data = await api.get(ENDPOINTS.INVENTORY.BASE);
  return data.items || [];
}

export async function fetchLowStockInventory() {
  const data = await api.get(ENDPOINTS.INVENTORY.LOW_STOCK);
  return data.items || [];
}
