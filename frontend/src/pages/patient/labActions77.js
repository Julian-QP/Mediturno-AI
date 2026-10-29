import { request } from '../../api/client.js';
const norm = v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
const date=v=>new Date(v).toLocaleString('es-PE',{dateStyle:'medium',timeStyle:'short'});

/** Adds secure cancel/reschedule to any existing patient exam card. */
export function addLabActions77(parent, order, slots, refresh=()=>window.location.reload()) {
 if (!parent || !order?.booking || order.booking.status!=='scheduled') return;
 if (parent.querySelector('.lab77-actions')) return;
 const available=(slots||[]).filter(s=>s.isActive&&s.available>0&&norm(s.examType)===norm(order.title)&&s.id!==order.booking.slotId);
 const box=document.createElement('div');box.className='lab77-actions';
 const current=document.createElement('small');current.textContent=`Reserva actual: ${date(order.booking.startsAt)} · ${order.booking.siteName||'Sede'}`;box.append(current);
 const select=document.createElement('select');select.setAttribute('aria-label',`Nuevo horario de ${order.title}`);
 select.add(new Option(available.length?'Seleccionar nuevo horario':'No hay otros horarios disponibles',''));
 for(const slot of available)select.add(new Option(`${date(slot.startsAt)} · ${slot.siteName} · ${slot.available} cupo(s)`,slot.id));
 box.append(select);
 const notice=document.createElement('small');notice.setAttribute('role','status');
 const change=document.createElement('button');change.type='button';change.textContent='Reprogramar';change.disabled=!available.length;
 const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Cancelar reserva';cancel.className='lab77-cancel';
 const setLoading=v=>{change.disabled=v||!available.length;cancel.disabled=v;};
 const invoke=async(url,body)=>{setLoading(true);notice.textContent='Procesando…';try{await request(url,{method:'POST',...(body?{body}:{})});notice.textContent='Cambios guardados';refresh();}catch(e){notice.textContent=e.message||'No se pudo realizar la operación';setLoading(false);}};
 change.addEventListener('click',()=>{if(!select.value){notice.textContent='Selecciona un horario';return;}if(window.confirm('¿Reprogramar este examen?'))invoke(`/lab77/my/bookings/${order.booking.id}/reschedule`,{slotId:select.value});});
 cancel.addEventListener('click',()=>{if(window.confirm('¿Cancelar esta reserva? La orden médica continuará vigente.'))invoke(`/lab77/my/bookings/${order.booking.id}/cancel`);});
 box.append(change,cancel,notice);parent.append(box);
}
