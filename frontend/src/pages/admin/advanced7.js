import {request} from '../../api/client.js';
const esc=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date=x=>x?new Date(x).toLocaleString('es-PE',{dateStyle:'medium',timeStyle:'short'}):'—';
const t=(title,subtitle)=>`<header class="a7-title"><div><div class="a7-crumb">MediTurno AI / Administración / ${esc(title)}</div><h1>${esc(title)}</h1><p>${esc(subtitle)}</p></div><span class="a7-tag">Administrador</span></header>`;
const search=(placeholder='Filtrar registros')=>`<label class="a7-search">⌕ <input id="a7-search" placeholder="${esc(placeholder)}" autocomplete="off" aria-label="${esc(placeholder)}"/></label>`;
const box=(title,body)=>`<section class="a7-card"><h2>${esc(title)}</h2>${body}</section>`;
const pills=(items)=>items.map(([label,num])=>`<div class="a7-metric"><small>${esc(label)}</small><strong>${esc(num)}</strong></div>`).join('');
const row=(cells)=>`<tr>${cells.map(c=>`<td>${c}</td>`).join('')}</tr>`;
const table=(heads,body)=>`<div class="a7-scroll"><table class="a7-table"><thead><tr>${heads.map(h=>`<th>${esc(h)}</th>`).join('')}</tr></thead><tbody>${body||`<tr><td colspan="${heads.length}">No hay registros disponibles.</td></tr>`}</tbody></table></div>`;
const link=(route,label)=>`<a class="a7-link" href="#${route}">${esc(label)}</a>`;
const pagination=(data)=>`<div class="a7-pagination"><span>Registros: ${Number(data.total)||0} · Página ${Number(data.page)||1}/${Math.max(1,Number(data.pages)||1)}</span><button type="button" data-a7-page="${Math.max(1,(Number(data.page)||1)-1)}" ${data.page<=1?'disabled':''}>Anterior</button><button type="button" data-a7-page="${Math.min(Number(data.pages)||1,(Number(data.page)||1)+1)}" ${data.page>=data.pages?'disabled':''}>Siguiente</button></div>`;
const hrefs=[["locations","Sedes y consultorios"],["doctors","Médicos y horarios"],["patients","Pacientes"],["appointments","Gestión de citas"],["services","Servicios"],["tests","Exámenes"],["announcements","Comunicados y bloqueos"],["reports","Reportes"],["permissions","Usuarios y permisos"],["profile","Configuración"]];
const pageState7={page:1,status:'',route:''};
export async function adminAdvancedPage7(page,searchParams={}){
 const pg=searchParams.page||1;
 if(page==='dashboard'){
  const d=await request('/admin/advanced7/overview');
  return `<div class="a7">${t('Panel administrativo','Supervisa la operación de MediTurno AI desde un solo lugar.')}
  <div class="a7-metrics">${pills([['Usuarios',d.users],['Sedes',d.sites],['Citas',d.appointments],['Citas pendientes',d.pending],['Exámenes',d.exams]])}</div>
  ${box('Gestión del sistema',`<div class="a7-shortcuts">${hrefs.map(([r,l])=>link(r,l)).join('')}</div>`)}
  ${box('Cuentas por rol',`<div class="a7-metrics">${pills((d.byRole||[]).map(x=>[x._id,x.count]))}</div>`)}
  <div class="a7-note">Las acciones clínicas y la aprobación de resúmenes corresponden exclusivamente al médico. Las cifras son datos del backend, no ejemplos simulados.</div></div>`;
 }
 if(page==='appointments'){
  const d=await request('/admin/advanced7/appointments?page='+pg+(searchParams.status?'&status='+encodeURIComponent(searchParams.status):''));
  return `<div class="a7">${t('Gestión de citas','Consulta citas, cancelaciones y su estado administrativo.')}
   <div class="a7-toolbar">${search('Buscar médico, paciente o sede')}<select id="a7-status"><option value="">Todos los estados</option>${[['reserved','Reservadas'],['completed','Realizadas'],['cancelled','Canceladas']].map(([v,l])=>`<option value="${v}" ${searchParams.status===v?'selected':''}>${l}</option>`).join('')}</select></div>
   ${box('Citas registradas',table(['Paciente','Médico','Sede','Fecha','Estado','Cancelación'],d.items.map(x=>row([esc(x.patient),esc(x.doctor),esc(x.site),date(x.startsAt),`<span class="a7-chip">${esc(x.status)}</span>`,esc(x.cancellation)])).join(''))+pagination(d))}
   <p class="a7-note">Para iniciar o finalizar una atención utiliza el panel médico; esta vista administrativa no altera consultas.</p></div>`;
 }
 if(page==='tests'){
  const d=await request('/admin/advanced7/exams?page='+pg+(searchParams.status?'&status='+encodeURIComponent(searchParams.status):''));
  return `<div class="a7">${t('Exámenes','Consulta órdenes médicas y su estado sin alterar las indicaciones clínicas.')}
   <div class="a7-toolbar">${search('Buscar examen o paciente')}<select id="a7-status"><option value="">Todos los estados</option>${[['requested','Solicitados'],['scheduled','Programados'],['received','Recibidos'],['reviewed','Revisados']].map(([v,l])=>`<option value="${v}" ${searchParams.status===v?'selected':''}>${l}</option>`).join('')}</select></div>
   ${box('Órdenes registradas',table(['Examen','Paciente','Médico','Solicitado','Estado'],d.items.map(x=>row([`<strong>${esc(x.title)}</strong><details><summary>Indicaciones</summary>${esc(x.patientInstructions||'Sin indicaciones')}</details>`,esc(x.patient),esc(x.doctor),date(x.requestedAt),`<span class="a7-chip">${esc(x.status)}</span>`])).join(''))+pagination(d))}
   <p class="a7-note">Programar un examen requiere disponibilidad real de laboratorio. No se crean citas desde esta lista hasta conectar esa API.</p></div>`;
 }
 if(page==='services'){
  const d=await request('/admin/advanced7/services');
  return `<div class="a7">${t('Servicios','Gestiona los servicios ofrecidos por sede.')}${search('Buscar sede')}
  ${box('Servicios por sede',`<div class="a7-service-grid">${d.items.map(s=>`<form class="a7-service" data-site-id="${esc(s.id)}"><h3>${esc(s.name)}</h3><p>${esc(s.address||'Sin dirección')}</p><label>Servicios disponibles (uno por línea)<textarea name="services" rows="5" maxlength="3000">${esc((s.services||[]).join('\n'))}</textarea></label><button type="submit">Guardar servicios</button></form>`).join('')||'Aún no hay sedes registradas.'}</div>`)}<div id="a7-feedback" role="status"></div></div>`;
 }
 if(page==='profile'){
  const d=await request('/admin/advanced7/overview');
  return `<div class="a7">${t('Configuración','Estado general y accesos a la configuración del sistema.')}
  ${box('Estado de MediTurno AI',`<div class="a7-metrics">${pills([['Usuarios',d.users],['Sedes activas o registradas',d.sites],['Citas',d.appointments],['Órdenes',d.exams]])}</div>`)}
  ${box('Administración de parámetros',`<div class="a7-shortcuts">${[['locations','Sedes y consultorios'],['doctors','Médicos y horarios'],['services','Servicios'],['announcements','Comunicados y bloqueos'],['permissions','Usuarios y permisos']].map(([r,l])=>link(r,l)).join('')}</div>`)}
  <div class="a7-note">No se exponen contraseñas, JWT ni claves externas en esta pantalla. La configuración de integraciones permanece en las variables .env del servidor.</div></div>`;
 }
 if(page==='reports'){
  const d=await request('/admin/advanced7/reports');
  return `<div class="a7">${t('Reportes','Indicadores de actividad de los últimos 30 días.')}
  <div class="a7-metrics">${pills([['Nuevas cuentas',d.newUsers],['Citas creadas',d.status.reduce((a,x)=>a+x.count,0)],['Exámenes registrados',d.exams.reduce((a,x)=>a+x.count,0)]])}</div>
  ${box('Estado de citas',table(['Estado','Cantidad'],d.status.map(x=>row([esc(x._id),String(x.count)])).join('')))}
  ${box('Tipos de consulta',table(['Tipo','Cantidad'],d.visits.map(x=>row([esc(x._id),String(x.count)])).join('')))}
  ${box('Órdenes por estado',table(['Estado','Cantidad'],d.exams.map(x=>row([esc(x._id),String(x.count)])).join('')))}
  <button id="a7-export" type="button">Exportar estas tablas a CSV</button><p class="a7-note">Los reportes muestran totales operativos, sin divulgar detalles médicos sensibles.</p></div>`;
 }
 if(page==='permissions'){
  const d=await request('/admin/advanced7/users?page='+pg+(searchParams.status?'&role='+encodeURIComponent(searchParams.status):''));
  return `<div class="a7">${t('Usuarios y permisos','Consulta cuentas y activa o desactiva usuarios no administrativos.')}
   <div class="a7-toolbar">${search('Buscar nombre o correo')}<select id="a7-status"><option value="">Todos los roles</option>${[['patient','Pacientes'],['doctor','Médicos'],['admin','Administradores']].map(([v,l])=>`<option value="${v}" ${searchParams.status===v?'selected':''}>${l}</option>`).join('')}</select></div>
   ${box('Cuentas registradas',table(['Nombre','Correo','Rol','Estado','Acción'],d.items.map(x=>row([esc(x.name),esc(x.email),esc(x.role),`<span class="a7-chip">${x.isActive?'Activa':'Desactivada'}</span>`,x.role==='admin'?'Protegida':`<button data-a7-user="${esc(x.id)}" data-a7-active="${x.isActive?'false':'true'}">${x.isActive?'Desactivar':'Reactivar'}</button>`])).join(''))+pagination(d))}
   <p class="a7-note">Las cuentas administradoras no se pueden desactivar desde esta tabla. La edición de roles requiere un procedimiento separado y auditado.</p><div id="a7-feedback" role="status"></div></div>`;
 }
 return `<div class="a7">${t('Administración','Sección gestionada por el módulo existente.')}</div>`;
}
export function adminAdvancedAttach7(page){
 const host=document.querySelector('.a7');if(!host)return;
 if(pageState7.route!==page){pageState7.route=page;pageState7.page=1;pageState7.status='';}
 const state=pageState7;
 const feedback=(s,isError=false)=>{const e=document.querySelector('#a7-feedback');if(e){e.textContent=s;e.style.color=isError?'#b42318':'#13745d';}else alert(s);};
 const change=async()=>{const route=location.hash.slice(1);const el=await adminAdvancedPage7(route,state);const temp=document.createElement('div');temp.innerHTML=el;host.replaceWith(temp.firstElementChild);adminAdvancedAttach7(route);};
 document.querySelector('#a7-search')?.addEventListener('input',e=>{const q=e.target.value.toLocaleLowerCase('es');host.querySelectorAll('tbody tr,.a7-service').forEach(x=>{x.hidden=!x.textContent.toLocaleLowerCase('es').includes(q);});});
 document.querySelector('#a7-status')?.addEventListener('change',async e=>{state.status=e.target.value;state.page=1;await change();});
 host.querySelectorAll('[data-a7-page]').forEach(b=>b.addEventListener('click',async()=>{state.page=Number(b.dataset.a7Page);await change();}));
 host.querySelectorAll('[data-a7-user]').forEach(b=>b.addEventListener('click',async()=>{
  const next=b.dataset.a7Active==='true';if(!confirm(next?'¿Reactivar esta cuenta?':'¿Desactivar esta cuenta? El usuario perderá acceso a la aplicación.'))return;
  b.disabled=true;try{await request('/admin/advanced7/users/'+encodeURIComponent(b.dataset.a7User)+'/status',{method:'PATCH',body:{isActive:next}});await change();}catch(e){feedback(e.message,true);b.disabled=false;}
 }));
 host.querySelectorAll('.a7-service').forEach(f=>f.addEventListener('submit',async e=>{e.preventDefault();const btn=f.querySelector('button');btn.disabled=true;try{const services=f.elements.services.value.split('\n').map(x=>x.trim()).filter(Boolean);await request('/admin/advanced7/services/'+encodeURIComponent(f.dataset.siteId),{method:'PUT',body:{services}});feedback('Servicios guardados correctamente.');}catch(err){feedback(err.message,true);}finally{btn.disabled=false;}}));
 document.querySelector('#a7-export')?.addEventListener('click',()=>{
  const csv=[...host.querySelectorAll('.a7-table')].map(tbl=>[...tbl.rows].map(r=>[...r.cells].map(c=>'"'+c.textContent.trim().replaceAll('"','""')+'"').join(',')).join('\r\n')).join('\r\n\r\n');
  const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='mediturno-reporte.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
}
