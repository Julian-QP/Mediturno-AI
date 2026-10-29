import {heading} from '../../components/layout/DashboardLayout.js';
import {noticeBanner} from '../../components/ui/NoticeBanner.js';
import {statCard} from '../../components/ui/StatCard.js';
import {escapeHtml,dateTime} from '../../utils/format.js';
const apptTypeLabel={initial:'Primera consulta',followup:'Consulta de seguimiento',single:'Consulta única'};
const careTypeLabel={general:'Consulta general',specialized:'Atención especializada',test:'Análisis o prueba',control:'Control médico'};
const statusLabel={reserved:'Reservada',cancelled:'Cancelada',completed:'Atendida'};
function appointmentMiniCard(a){
  if(!a){
    return `<article class="mini-appointment-card placeholder"><div><span class="tag">Sin cita</span><h4>Aún no tienes otra atención registrada</h4><p class="muted">Cuando programes una nueva cita aparecerá aquí.</p></div><a class="btn-outline" href="#doctors">Generar cita</a></article>`;
  }
  return `<article class="mini-appointment-card"><div><span class="tag ${a.status==='cancelled'?'danger':'success'}">${statusLabel[a.status]||escapeHtml(a.status)}</span><h4>${escapeHtml(a.doctorName||'Médico')}</h4><p>${escapeHtml(dateTime(a.startsAt))}</p><p class="muted">${escapeHtml(apptTypeLabel[a.visitType]||'Consulta médica')} · ${escapeHtml(careTypeLabel[a.careType]||'Atención')}</p></div><div class="mini-appointment-actions">${a.status==='completed'?`<button class="btn-outline patient-care-open" data-id="${escapeHtml(a.id)}">Ver ficha de atención</button>`:`<button class="btn-outline view-appointment" data-id="${escapeHtml(a.id)}" data-source="patient">Ver detalles</button>`}</div></article>`;
}
export function patientDashboard({user,appointments=[]}){
 const now=new Date();
 const sorted=[...appointments].sort((a,b)=>new Date(a.startsAt)-new Date(b.startsAt));
 const upcoming=sorted.filter(a=>a.status==='reserved'&&new Date(a.startsAt)>now);
 const next=upcoming[0];
 const atentionCards=[...upcoming,...sorted.filter(a=>a.status==='completed'),...sorted.filter(a=>a.status==='cancelled')].slice(0,2);
 return heading(`¡Hola, ${user?.name?.split(' ')[0]||'paciente'}!`,'Tus próximas atenciones y documentos en un solo lugar.')+
 noticeBanner()+
 `<section class="hero hero-actions"><div><span class="eyebrow">▦ TU PRÓXIMA CITA MÉDICA</span>${next?`<h2>${escapeHtml(dateTime(next.startsAt))}</h2><p>${escapeHtml(careTypeLabel[next.careType]||'Consulta médica')} · ${escapeHtml(next.doctorName||'Médico')}</p><p>${escapeHtml(apptTypeLabel[next.visitType]||'Consulta')} · ${escapeHtml(next.locationName||'Sede por confirmar')}</p>`:`<h2>No tienes citas próximas</h2><p>Explora los médicos disponibles y solicita una atención.</p>`}</div><div class="hero-cta-stack"><a class="btn-white btn-big" href="#doctors">＋ Generar cita</a>${next?`<button class="btn-outline-light view-appointment" data-id="${escapeHtml(next.id)}" data-source="patient">Ver información completa</button>`:`<a class="btn-outline-light" href="#appointments">Ver mis citas</a>`}</div></section>`+
 `<div class="stat-grid">${statCard(upcoming.length,'Citas próximas','appointments','▦')}${statCard(appointments.filter(a=>a.status==='cancelled').length,'Citas canceladas','appointments','⊗')}${statCard(appointments.filter(a=>a.visitType==='followup').length,'Seguimientos','followup','♡')}${statCard(appointments.filter(a=>a.status==='completed').length,'Atenciones realizadas','appointments','▤')}</div>`+
 `<div class="grid-two"><section class="card"><div class="section-head"><div><h3>Mis atenciones</h3><p class="muted">Resumen rápido de tus citas registradas.</p></div><a class="btn-outline" href="#appointments">Ir a mis citas</a></div><div class="stack-gap">${appointmentMiniCard(atentionCards[0])}${appointmentMiniCard(atentionCards[1])}</div></section><section class="card"><div class="section-head"><div><h3>Accesos rápidos</h3><p class="muted">Usa estas opciones para avanzar más rápido dentro del sistema.</p></div></div><div class="quick-grid"><a class="quick-link" href="#doctors"><strong>Buscar médicos</strong><span>Selecciona especialidad y solicita una nueva cita.</span></a><a class="quick-link" href="#appointments"><strong>Mis citas y atenciones</strong><span>Consulta estados, detalles y solicitudes de cancelación.</span></a><a class="quick-link" href="#appointments"><strong>Atenciones realizadas</strong><span>Revisa atenciones completadas y documentos aprobados.</span></a><a class="quick-link" href="#locations"><strong>Sedes y ubicación</strong><span>Encuentra la dirección de tu atención o examen.</span></a></div></section></div>`;
}
