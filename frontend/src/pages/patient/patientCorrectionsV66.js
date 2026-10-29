import { attachPatientExamBooking75 } from './examBooking75.js'; // mediturno-fase7-5
// Fase 6.6: Solo vistas de paciente. Datos reales proporcionados por las APIs existentes.
const h=(v='')=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safe=x=>Array.isArray(x)?x:[];
const label=(t,description)=>`<header class="p6-head"><div><div class="p6-crumb">MediTurno AI / ${h(t)}</div><h1>${h(t)}</h1><p>${h(description)}</p></div><span class="p6-phase">Panel del paciente</span></header>`;
const search=placeholder=>`<div class="p6-search"><span aria-hidden="true">⌕</span><input data-p6-search aria-label="Buscar" placeholder="${h(placeholder)}"/><button type="button" class="btn-outline" data-p6-search-go>Buscar</button></div>`;
export function patientLocations66(sites=[]){
 const locations=safe(sites);
 return `<div class="p6-screen p66-patient">${label('Sedes y ubicación','Encuentra tu sede, revisa sus horarios y organiza tu visita.')}${search('Buscar sede o dirección')}
 <div class="p66-locations">
  <section class="p6-panel p66-locations-map"><h2>Estamos cerca de ti</h2><p>${locations.length} sede(s) registrada(s)</p>
   <div class="p66-illustrative-map" role="img" aria-label="Mapa esquemático decorativo. No representa posiciones reales ni sustituye las direcciones registradas.">
    <div class="p66-map-river"></div><div class="p66-map-park p1"></div><div class="p66-map-park p2"></div>
    <span class="p66-map-street a">AV. PRINCIPAL</span><span class="p66-map-street b">AV. NORTE</span>
    <div class="p66-map-markers">${locations.slice(0,5).map((s,i)=>`<span class="p66-map-marker" style="--posx:${20+(i%3)*30}%;--posy:${27+Math.floor(i/3)*42}%" title="La posición es ilustrativa">⌖<b>${h(s.name||'Sede')}</b></span>`).join('')}</div>
   </div><small>Mapa ilustrativo. Para ubicación real, selecciona «Abrir dirección en Maps» en cada sede.</small>
  </section><section class="p66-locations-list">${locations.length?locations.map(s=>`<article class="p6-panel p6-searchable"><h2>${h(s.name||'Sede')}</h2><p>⌖ ${h(s.address||'Dirección sin registrar')}</p>${s.city?`<small>${h(s.city)}</small>`:''}${s.openingHours?`<p>◷ ${h(s.openingHours)}</p>`:''}<div class="p66-address-action">${s.address?`<a class="btn-outline" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([s.address,s.city].filter(Boolean).join(', '))}" target="_blank" rel="noopener noreferrer">Abrir dirección en Maps</a>`:'<small>La administración aún no registró la dirección.</small>'}</div></article>`).join(''):`<section class="p6-panel">Aún no hay sedes registradas por administración.</section>`}</section>
 </div></div>`;
}
const states={requested:'Autorizado',approved:'Autorizado',scheduled:'Programado',received:'Resultado recibido',reviewed:'Revisado',completed:'Completado',cancelled:'Cancelado'};
const when=value=>{if(!value)return '';const d=new Date(value);return Number.isNaN(d.getTime())?'':d.toLocaleString('es-PE',{timeZone:'America/Lima',dateStyle:'medium',timeStyle:'short'});};
export function patientExams66(exams=[]){
 const xs=safe(exams),toSchedule=xs.filter(x=>['requested','approved'].includes(x.status)).length,scheduled=xs.filter(x=>x.status==='scheduled').length;
 return `<div class="p6-screen p66-patient">${label('Exámenes y análisis','Revisa tus órdenes, organiza tus exámenes y prepárate para cada atención.')}${search('Buscar examen, médico o fecha')}
 <section class="p6-panel"><div class="p6-section-title"><h2>Mis exámenes</h2><span>${toSchedule} pendiente(s) de programar · ${scheduled} programado(s)</span></div>
 ${xs.length?xs.map(x=>`<article class="p66-exam-row p6-searchable"><div class="p6-icon">⚗</div><div class="p66-exam-description"><h3>${h(x.title||'Examen solicitado')}</h3><small>${h(x.category||'Orden médica')}${x.code?' · '+h(x.code):''}</small><p>${h(x.doctorName?'Solicitado por '+x.doctorName:'Orden solicitada por tu médico')}</p>${x.requestedAt?`<small>Orden emitida: ${h(when(x.requestedAt))}</small>`:''}</div><div class="p66-exam-state"><span class="p6-badge ${['received','reviewed','completed'].includes(x.status)?'p6-done':'p6-wait'}">${h(states[x.status]||x.status||'Pendiente')}</span><small>${x.scheduledAt?'Programado: '+h(when(x.scheduledAt)):['requested','approved'].includes(x.status)?'Pendiente de programar':''}</small></div><div class="p66-exam-actions">${['requested','approved','scheduled'].includes(x.status)?`<button type="button" class="btn p66-exam-book" data-exam-id="${h(x.id)}" data-exam-title="${h(x.title)}">Programar examen</button>`:''}<button type="button" class="btn-outline p66-exam-instructions" data-instructions="${h(x.patientInstructions||'No hay indicaciones adicionales registradas por el médico.')}" data-title="${h(x.title)}">Ver indicaciones</button></div></article>`).join(''):'<div class="p6-empty"><strong>Sin exámenes registrados</strong><p>Cuando el médico solicite un examen, aparecerá aquí.</p></div>'}
 </section><section class="p6-panel p66-prep"><h2>Antes de tu examen</h2><div class="p6-tips"><div><b>▤ Revisa tu orden</b><p>Ten a mano tu documento de identidad y la orden autorizada.</p></div><div><b>◉ Confirma la preparación</b><p>Consulta si necesitas ayunar o seguir otras indicaciones.</p></div><div><b>◷ Llega con anticipación</b><p>Acude a la sede únicamente cuando tengas la programación confirmada.</p></div></div></section>
 </div>`;
}
export function attachPatientCorrections66(){
 document.querySelectorAll('.p66-exam-instructions').forEach(button=>button.addEventListener('click',()=>{
  alert(`${button.dataset.title||'Examen'}\n\n${button.dataset.instructions||'Sin indicaciones registradas.'}`);
 }));
 attachPatientExamBooking75();
}
