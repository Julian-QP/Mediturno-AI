import {request} from './client.js';
export const listDoctorAppointments=()=>request('/doctor-portal/appointments');
export const getDoctorStats=()=>request('/doctor-portal/stats');
export const reviewCancellation=(id,decision)=>request(`/doctor-portal/appointments/${encodeURIComponent(id)}/cancellation`,{method:'PATCH',body:{decision}});
