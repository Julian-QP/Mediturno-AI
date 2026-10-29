import {heading,searchBar,empty} from '../../components/layout/DashboardLayout.js';
import {escapeHtml,dateTime} from '../../utils/format.js';
const visitTypeLabel={initial:'Primera consulta',followup:'Consulta de seguimiento',single:'Consulta única'};
const careTypeLabel={general:'Consulta general',specialized:'Atención especializada',test:'Análisis o prueba',control:'Control médico'};
function cancellationTag(c){
 if(!c||c.status==='none')return '';
 const map={pending:['Pendiente de revisión','warning'],approved:['Aprobada','success'],rejected:['Rechazada','danger']};
 const [text,cls]=map[c.status]||[c.status,''];
 return `<span class="tag ${cls}">Cancelación ${text}</span>`;
}
export function doctorAgendaPage(items=[]){
 return heading('Mi agenda','Citas reservadas con tu cuenta médica.')+
 searchBar('Buscar paciente, estado o fecha')+
 `<section class="card searchable-list"><div class="section-head"><div><h3>Citas (${items.length})
 </h3><p class="muted">Abre el detalle para revisar toda la información de la atención.
 </p></div>
 </div>${items.length?items.map(a=>`<div class="appointment-row searchable-item appointment-card-row">
    <div><div class="row-gap">
    <span class="tag ${a.status==='cancelled'?'danger':'success'}">${a.status==='cancelled'?'Cancelada':a.status==='reserved'?'Reservada':'Atendida'}</span>${cancellationTag(a.cancellation)}</div><h3>${escapeHtml(a.patientName||'Paciente')}</h3><p class="muted">${escapeHtml(dateTime(a.startsAt))}</p><p class="muted">${escapeHtml(visitTypeLabel[a.visitType]||'Consulta')} · ${escapeHtml(careTypeLabel[a.careType]||'Atención')} · ${escapeHtml(a.locationName||'Sede por confirmar')}</p></div><div class="action-stack"> <button class="btn-outline view-appointment" data-id="${escapeHtml(a.id)}" data-source="doctor">Ver detalles</button><button class="btn open-clinical-appointment" data-id="${escapeHtml(a.id)}">Abrir atención</button>${a.cancellation?.status==='pending'?`<button class="btn-success decide-cancel" data-id="${escapeHtml(a.id)}" data-decision="approved">Aprobar</button><button class="btn-danger decide-cancel" data-id="${escapeHtml(a.id)}" data-decision="rejected">Rechazar</button>`:''}</div></div>`).join(''):empty('No hay citas','Cuando los pacientes reserven contigo aparecerán aquí.')}</section>`;
}
