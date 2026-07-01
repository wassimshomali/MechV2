import api from './api.js';
import { ENDPOINTS } from '../config/api.js';

export async function fetchClients(params = {}) {
  return api.get(ENDPOINTS.CLIENTS.BASE, params);
}

export async function fetchClient(id) {
  return api.get(ENDPOINTS.CLIENTS.BY_ID(id));
}
