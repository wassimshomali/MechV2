import api from './api.js';
import { ENDPOINTS } from '../config/api.js';

export async function fetchAppointments() {
  const data = await api.get(ENDPOINTS.APPOINTMENTS.BASE);
  return data.appointments || [];
}

export async function fetchTodayAppointments() {
  const data = await api.get(ENDPOINTS.APPOINTMENTS.TODAY);
  return data.appointments || [];
}
