import {request} from './client.js';
export const listDoctors = () => request('/doctors');
