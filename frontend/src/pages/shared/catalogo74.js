import {request} from '../../api/client.js';
import '../../styles/catalogo74.css';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let catalogCache=null;
export async function examCatalogOptions74(){
 const response=await request('/lab74/catalog');
 catalogCache=response.items||[];
 return catalogCache;
}
export async function catalogAdmin74(){
 const records=(await request('/lab74/catalog?all=1')).items||[];
 return `<section class="lab74-card" id="lab74-catalog"><h3>Catálogo de exámenes (solo administración)</h3><p>Registra aquí los tipos de examen que pueden solicitar los médicos y programar los pacientes.</p><form id="lab74-add"><label>Nombre del examen<input required minlength="3" maxlength="160" name="name" placeholder="Ej.: Hemograma completo"></label><label>Descripción<input name="description" maxlength="700" placeholder="Qué analiza este examen"></label><label>Preparación o indicaciones<textarea name="preparation" maxlength="1200" rows="2"></textarea></label><label>Duración estimada (min)<input type="number" name="durationMinutes" value="30" min="5" max="480" required></label><button type="submit">Agregar al catálogo</button></form><div class="lab74-items">${records.map(x=>`<div class="lab74-item"><div><b>${esc(x.name)}</b><small>${esc(x.preparation||x.description||'Sin indicaciones')}</small></div><span>${x.isActive?'Activo':'Inactivo'}</span><button type="button" data-lab74-toggle="${esc(x.id)}" data-active="${x.isActive?'1':'0'}">${x.isActive?'Desactivar':'Activar'}</button></div>`).join('')||'<p>No hay exámenes registrados. Crea uno para comenzar.</p>'}</div><p class="lab74-hint" aria-live="polite" id="lab74-message"></p></section>`;
}
export function attachCatalogAdmin74(){
 const host=document.getElementById('lab74-catalog');if(!host)return;
 const msg=(t)=>{const el=host.querySelector('#lab74-message');if(el)el.textContent=t;};
 host.querySelector('#lab74-add')?.addEventListener('submit',async e=>{
  e.preventDefault();const f=e.currentTarget,button=f.querySelector('button');button.disabled=true;
  try{const body=Object.fromEntries(new FormData(f));body.durationMinutes=Number(body.durationMinutes);await request('/lab74/admin/catalog',{method:'POST',body});catalogCache=null;location.reload();}catch(err){msg(err.message);button.disabled=false;}
 });
 host.querySelectorAll('[data-lab74-toggle]').forEach(b=>b.addEventListener('click',async()=>{
  b.disabled=true;try{await request(`/lab74/admin/catalog/${b.dataset.lab74Toggle}`,{method:'PATCH',body:{isActive:b.dataset.active!=='1'}});catalogCache=null;location.reload();}catch(err){msg(err.message);b.disabled=false;}
 }));
}
// Reuses the existing clinical form and its submit listener. Only its free-text field is changed.
let observerStarted=false;
export function installExamDropdown74(){
 if(observerStarted)return;observerStarted=true;
 const render=async()=>{
  const forms=document.querySelectorAll('#clinical-exam-form');
  for(const form of forms){
   if(form.querySelector('[data-lab74-select]'))continue;
   const original=form.querySelector('input[name="title"]');
   if(!original)continue;
   original.dataset.lab74Pending='1';
   try{
    const items=catalogCache||await examCatalogOptions74();
    if(!original.isConnected||original.closest('form')?.querySelector('[data-lab74-select]'))continue;
    const select=document.createElement('select');select.name='title';select.required=true;select.dataset.lab74Select='1';
    select.innerHTML='<option value="">Seleccionar examen del catálogo</option>'+items.map(x=>`<option value="${esc(x.name)}">${esc(x.name)}</option>`).join('');
    original.replaceWith(select);
    if(!items.length){const text=document.createElement('small');text.textContent='El administrador debe registrar primero los exámenes disponibles.';select.after(text);}
   }catch(err){original.dataset.lab74Pending='';console.warn('No se pudo cargar el catálogo',err);}
  }
 };
 let waiting=false;
 const schedule=()=>{if(waiting)return;waiting=true;queueMicrotask(()=>{waiting=false;render();});};
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});schedule();
}
