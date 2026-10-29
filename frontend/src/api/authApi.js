import {request} from './client.js';
export const login = body => request('/auth/login',{method:'POST',body});
export const register = body => request('/auth/register',{method:'POST',body});
export const me = () => request('/auth/me');
