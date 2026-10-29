import {request} from './client.js';
export const listAnnouncements=()=>request('/announcements');
export const publishAnnouncement=body=>request('/announcements',{method:'POST',body});
