import {request} from './client.js';
export const getSites=()=>request('/schedule/sites');
export const getShifts=doctorId=>request('/schedule/shifts?doctorId='+encodeURIComponent(doctorId));
export const getSlots=(doctorId,siteId,date)=>request(`/schedule/availability?doctorId=${encodeURIComponent(doctorId)}&siteId=${encodeURIComponent(siteId)}&date=${encodeURIComponent(date)}`);
export const getAdminShifts=()=>request('/admin/schedule/shifts');
export const getBlocks=()=>request('/admin/schedule/blocks');
export const addSite=body=>request('/admin/schedule/sites',{method:'POST',body});
export const addShift=body=>request('/admin/schedule/shifts',{method:'POST',body});
export const disableShift=id=>request(`/admin/schedule/shifts/${encodeURIComponent(id)}`,{method:'DELETE'});
export const addBlock=body=>request('/admin/schedule/blocks',{method:'POST',body});

export const removeManyShifts=ids=>request('/admin/schedule/shifts/bulk-remove',{method:'POST',body:{ids}});
