import {request} from './client.js';
export const createBatch76=body=>request('/admin/schedule/fix76/batch',{method:'POST',body});
export const updateShift76=(id,body)=>request('/admin/schedule/fix76/'+encodeURIComponent(id),{method:'PATCH',body});
