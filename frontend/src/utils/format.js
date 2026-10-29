export const escapeHtml = (value='') => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const dateTime = value => new Date(value).toLocaleString('es-PE',{timeZone:'America/Lima',dateStyle:'long',timeStyle:'short'});
export const safeDate = value => String(value||'').slice(0,10);
