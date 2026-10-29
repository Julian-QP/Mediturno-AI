import {heading,searchBar,empty} from '../../components/layout/DashboardLayout.js';
import {escapeHtml as esc,dateTime} from '../../utils/format.js';
const VISIT={initial:'Primera consulta',followup:'Consulta de seguimiento',single:'Consulta única'};
const CARE={general:'Consulta general',specialized:'Atención especializada',test:'Análisis o prueba',control:'Control médico'};
const CHIP={pending:['Cancelación solicitada','warning'],approved:['Cancelación aprobada','success'],rejected:['Cancelación rechazada','danger']};
const when=a=>new Date(a.startsAt).getTime();
function row(a,mode){
 const cancellation=a.cancellation||{};
 const flag=CHIP[cancellation.status];
 return `<article class="appointment-row appointment-card-row searchable-item patient-visit-card"><div class="patient-visit-main"><div class="row-gap"><span class="tag ${mode==='completed'?'success':mode==='cancelled'?'danger':'warning'}">${mode==='completed'?'Atendida':mode==='cancelled'?'Cancelada':a.status==='reserved'?'Pendiente de atención':'Programada'}</span>${a.visitType==='followup'?'<span class="tag">Seguimiento</span>':''}${flag?`<span class="tag ${flag[1]}">${flag[0]}</span>`:''}</div><h3>${esc(a.doctorName||'Médico')} ${a.specialty?'· '+esc(a.specialty):''}</h3><p class="muted">${esc(dateTime(a.startsAt))}</p><p class="muted">${esc(VISIT[a.visitType]||'Consulta')} · ${esc(CARE[a.careType]||'Atención')} · ${esc(a.locationName||'Sede por confirmar')}</p></div><div class="patient-visit-actions">${mode==='completed'?`<button type="button" class="btn patient-care-open" data-id="${esc(a.id)}">▤ Ver ficha de atención</button>`:`<button type="button" class="btn-outline view-appointment" data-id="${esc(a.id)}" data-source="patient">Ver detalles</button>`}${mode==='pending'&&a.status==='reserved'&&when(a)>Date.now()&&cancellation.status!=='pending'?`<button type="button" class="btn-outline request-cancel" data-id="${esc(a.id)}">Solicitar cancelación</button>`:''}</div></article>`;
}
export function appointmentsPage(appointments=[],records=[]){
 // Las reservas determinan el estado; las fichas añaden datos autorizados por el servidor.
 const careById=new Map(records.map(r=>[String(r.id),r]));
 const all=[...appointments].map(a=>({...a,...(careById.get(String(a.id))||{}),cancellation:a.cancellation}));
 const known=new Set(all.map(a=>String(a.id)));
 for(const r of records){if(!known.has(String(r.id)))all.push(r);}
 const pending=all.filter(a=>a.status!=='completed'&&a.status!=='cancelled').sort((a,b)=>when(a)-when(b));
 const completed=all.filter(a=>a.status==='completed').sort((a,b)=>when(b)-when(a));
 const cancelled=all.filter(a=>a.status==='cancelled').sort((a,b)=>when(b)-when(a));
 return heading('Mis citas y atenciones','Todas tus citas en una misma sección, organizadas según su estado.')+
 `<div class="patient-visit-head"><div class="patient-visit-totals" role="tablist" aria-label="Filtrar citas y atenciones"><button type="button" class="patient-visit-filter active" role="tab" aria-selected="true" aria-controls="patient-pending-panel" id="patient-pending-tab" data-visit-filter="pending">◷ Pendientes <span class="filter-count">${pending.length}</span></button><button type="button" class="patient-visit-filter" role="tab" aria-selected="false" aria-controls="patient-completed-panel" id="patient-completed-tab" data-visit-filter="completed">✓ Realizadas <span class="filter-count">${completed.length}</span></button></div><a class="btn" href="#doctors">＋ Generar cita</a></div>`+
 searchBar('Buscar médico, fecha, especialidad, sede o tipo de cita')+
 `<section class="card patient-visit-section" id="patient-pending-panel" role="tabpanel" aria-labelledby="patient-pending-tab" data-visit-panel="pending"><div class="section-head"><div><h2>◷ Citas pendientes</h2><p class="muted">Reservadas o en proceso de atención, incluidas tus próximas citas de seguimiento.</p></div><span class="tag warning">${pending.length} citas</span></div><div class="searchable-list">${pending.length?pending.map(a=>row(a,'pending')).join(''):empty('No tienes citas pendientes','Puedes generar una cita desde Buscar médicos.')}</div></section>`+
 `<section class="card patient-visit-section" id="patient-completed-panel" role="tabpanel" aria-labelledby="patient-completed-tab" data-visit-panel="completed" hidden><div class="section-head"><div><h2>✓ Atenciones realizadas</h2><p class="muted">Consultas finalizadas. Abre la ficha para consultar los datos autorizados, seguimientos y exámenes.</p></div><span class="tag success">${completed.length} atenciones</span></div><div class="searchable-list">${completed.length?completed.map(a=>row(a,'completed')).join(''):empty('Aún no hay atenciones realizadas','Cuando tu médico finalice una consulta aparecerá en esta lista.')}</div></section>`+
 (cancelled.length?`<details class="patient-visit-archive"><summary>Citas canceladas (${cancelled.length})</summary><div class="card searchable-list">${cancelled.map(a=>row(a,'cancelled')).join('')}</div></details>`:'');
}
