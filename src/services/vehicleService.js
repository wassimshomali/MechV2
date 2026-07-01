import api from './api.js';
import { ENDPOINTS } from '../config/api.js';

export async function fetchVehicles() {
  const data = await api.get(ENDPOINTS.VEHICLES.BASE);
  return data.vehicles || [];
}

export async function fetchServiceHistory() {
  const data = await api.get(ENDPOINTS.VEHICLES.SERVICE_HISTORY);
  return data.history || [];
}
