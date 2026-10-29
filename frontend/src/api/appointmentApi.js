import {request} from './client.js';
export const listMyAppointments=()=>request('/appointments/mine');
export const createAppointment=body=>request('/appointments',{method:'POST',body});
export const requestCancellation=(id,reason)=>request(`/appointments/${encodeURIComponent(id)}/request-cancellation`,{method:'PATCH',body:{reason}});
