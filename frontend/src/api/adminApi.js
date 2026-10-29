import {request} from './client.js';
export const listAdminDoctors=()=>request('/admin/doctors');
export const listAdminPatients=()=>request('/admin/patients');
export const createDoctorAccount=body=>request('/admin/doctors',{method:'POST',body});
