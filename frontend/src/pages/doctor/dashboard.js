import {heading,searchBar} from '../../components/layout/DashboardLayout.js';
import {noticeBanner} from '../../components/ui/NoticeBanner.js';
import {statCard} from '../../components/ui/StatCard.js';
import {escapeHtml,dateTime} from '../../utils/format.js';
const visitTypeLabel={initial:'Primera consulta',followup:'Seguimiento',single:'Consulta única'};
function nextBlock(item){
 if(!item)return `<h2>No tienes citas pendientes</h2><p>Las próximas atenciones aparecerán aquí cuando tus pacientes reserven contigo.</p><a href="#agenda" class="btn-white">Ver agenda →</a>`;
 return `<h2>${escapeHtml(item.patientName||'Paciente')}</h2><p>${escapeHtml(dateTime(item.startsAt))}</p><p>${escapeHtml(visitTypeLabel[item.visitType]||'Consulta')} · ${escapeHtml(item.locationName||'Sede por confirmar')}</p><button class="btn-white view-appointment" data-id="${escapeHtml(item.id)}" data-source="doctor">Ver información completa</button><button class="btn-outline-light open-clinical-appointment" data-id="${escapeHtml(item.id)}">Iniciar atención</button>`;
}
export function doctorDashboard({appointments=[],stats={pending:0,cancellationRequests:0,completed:0}}){
  const pendingAppointments=appointments.filter(a=>a.status==='reserved').sort((a,b)=>new Date(a.startsAt)-new Date(b.startsAt));
  const next=pendingAppointments[0];
  const cancellationPending=appointments.filter(a=>a.cancellation?.status==='pending').slice(0,2);
  return heading('Panel del médico','Agenda, seguimientos y documentación por revisar.')+
  noticeBanner()+searchBar('Buscar paciente, cita, seguimiento o resumen')+
  `<section class="hero"><span class="eyebrow">PRÓXIMA CITA POR ATENDER</span>${nextBlock(next)}</section><div class="stat-grid">${statCard(stats.pending ?? pendingAppointments.length,'Citas pendientes','pending','▦')}${statCard(stats.cancellationRequests ?? cancellationPending.length,'Cancelaciones por revisar','pending','◷')}${statCard(stats.completed ?? 0,'Atenciones completadas','history','▤')}${statCard('—','Resúmenes por revisar','reviews','✎')}</div><div class="grid-two"><section class="card"><div class="section-head"><div><h3>Solicitudes de cancelación</h3><p class="muted">Revisa las peticiones pendientes antes de liberar el horario.</p></div><a class="btn-outline" href="#pending">Ver todas</a></div>${cancellationPending.length?cancellationPending.map(a=>`<div class="doctor-request-card"><div><strong>${escapeHtml(a.patientName||'Paciente')}</strong><p class="muted">${escapeHtml(dateTime(a.startsAt))}</p><span class="tag warning">Pendiente de revisión</span></div><div class="action-stack horizontal"><button class="btn-success decide-cancel" data-id="${escapeHtml(a.id)}" data-decision="approved">Aprobar</button><button class="btn-danger decide-cancel" data-id="${escapeHtml(a.id)}" data-decision="rejected">Rechazar</button></div></div>`).join(''):`<div class="empty compact"><strong>No hay solicitudes pendientes</strong><p>Tus decisiones aparecerán aquí con colores para una revisión más rápida.</p></div>`}</section><section class="card"><h3>Asistente MediTurno AI</h3><p class="muted">El asistente estará disponible dentro de cada cita autorizada y nunca como grabación independiente.</p><p class="muted">Cuando abras una atención desde la agenda podrás generar el borrador del resumen y revisar la información clínica de esa cita.</p></section></div>`;
}
