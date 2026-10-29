import {summaryPreview81 as _fase81VistaPrevia} from './components/ui/summaryPreview81.js'; // MEDITURNO_FASE81_VISTA_SIN_MARKDOWN
import './styles/summary81.css';
import {createBatch76,updateShift76} from './api/shiftFix76Api.js'; // mediturno-fase7-6
import './styles/shift-fix76.css';
import {installExamDropdown74} from './pages/shared/catalogo74.js'; // mediturno-fase7-4
import {lab73Page,lab73Attach} from './pages/shared/laboratorios73.js'; // mediturno-fase7-3
import {adminSitesPage72,adminSitesAttach72} from './pages/admin/sites72.js'; // mediturno-fase7-2
import {attachAdminSiteMap71} from './pages/admin/siteMapPicker71.js'; // mediturno-fase7-1
import './styles/admin-phase7.css'; // mediturno-fase7
import {adminAdvancedPage7,adminAdvancedAttach7} from './pages/admin/advanced7.js';
import './styles/phase6-7.css'; // mediturno-fase67
import {patientLocations67,profilePage67,loadProfile67,attachPhase67} from './pages/shared/profileMaps67.js';
import './styles/phase6-6.css'; // mediturno-paciente-v66
import {patientLocations66,patientExams66,attachPatientCorrections66} from './pages/patient/patientCorrectionsV66.js';
import {doctorExams66} from './pages/doctor/doctorExams66.js';
import './styles/phase6-5.css'; // mediturno-fase65
import './styles/phase6-4.css'; // mediturno-fase64
import {doctorExamsV6} from './pages/doctor/doctorExamsV6.js';
import './styles/doctor-v6.css'; // mediturno-medico-v62
import {doctorAgendaV6,doctorDetailV6,doctorReviewsV6,doctorReviewV6} from './pages/doctor/doctorV6.js';
import './styles/patient-v6.css'; // mediturno-paciente-v63
import {patientHomeV6,patientAppointmentsV6,patientFollowupV6,patientTestsV6,patientSitesV6,patientHistoryV6,enhanceDoctorsV6,attachP6Interactions} from './pages/patient/patientV6.js';
import './styles/care-fullscreen.css'; // mediturno-fase61
import {liveAiPanel} from './components/ui/LiveAiPanel.js';
import {manageLiveClick,liveRunning} from './services/liveConsultation.js';
import {doctorReviewsPage,reviewDialog} from './pages/doctor/reviews.js';
import {getReviews,loadRecordingAudio} from './api/reviewApi.js';
import './styles/live-consultation.css';
import './styles/reviews.css'; // mediturno-fase54
import './styles/ai.css';



import {patientPdfAction} from './components/ui/AiPanel.js';
import {getAiSummary,makeAiDraft,saveAiDraft,approveAi,getPatientSummary,sendAudio,downloadApprovedPdf} from './api/aiApi.js';
import './styles/patient-unified.css';
import './styles/clinical.css';
import './styles/phase3.css';import './styles/announcements.css';import './styles/variables.css';import './styles/global.css';import './styles/auth.css';import './styles/responsive.css';import './styles/medicos-compacto.css';
import {layout,empty} from './components/layout/DashboardLayout.js';
import {NAV} from './components/layout/navigation.js';
import {loginPage} from './pages/auth/login.js';import {registerPage} from './pages/auth/register.js';
import {patientDashboard} from './pages/patient/dashboard.js';import {doctorsPage} from './pages/patient/doctors.js';import {appointmentsPage} from './pages/patient/appointments.js';
import {doctorDashboard} from './pages/doctor/dashboard.js';import {adminDashboard} from './pages/admin/dashboard.js';import {placeholder} from './pages/shared/placeholders.js';
import {adminDoctorsPage} from './pages/admin/doctors.js';
import {adminPatientsPage} from './pages/admin/patients.js';
import {doctorAgendaPage} from './pages/doctor/agenda.js';
import {adminSitesPage,adminBlocksPage,adminScheduleModal} from './pages/admin/schedules.js';
import {adminDoctorModal,adminDoctorCreateModal} from './pages/admin/doctors.js';
import {announcementsPage,announcementModal} from './pages/admin/announcements.js';
import {noticeBanner} from './components/ui/NoticeBanner.js';
import {doctorClinicalPage,doctorHistoryPage,clinicalModal} from './pages/doctor/clinical.js';
import {patientClinicalPage,patientCareHistory,patientCareModal} from './pages/patient/clinical.js';
import {getClinicalDetails,startClinicalCare,saveClinicalNotes,finishClinicalCare,createTreatmentPlan,linkTreatmentPlan,createExamOrder,getDoctorClinicalList,getPatientClinicalList,getPatientCareRecords,editExamOrder,removeExamOrder,removeTreatmentPlan,bookFollowupAppointment} from './api/clinicalApi.js';
import {listAnnouncements,publishAnnouncement} from './api/announcementApi.js';
import {getSites,getShifts,getSlots,getAdminShifts,getBlocks,addSite,addShift,disableShift,removeManyShifts,addBlock} from './api/scheduleApi.js';
import {listAdminDoctors,listAdminPatients,createDoctorAccount} from './api/adminApi.js';
import {listDoctorAppointments,getDoctorStats,reviewCancellation} from './api/doctorPortalApi.js';
import {me,login,register} from './api/authApi.js';import {listDoctors} from './api/doctorApi.js';import {listMyAppointments,createAppointment,requestCancellation} from './api/appointmentApi.js';
if(Array.isArray(NAV.patient)&&!NAV.patient.some(x=>x[0]==='patient-sites'))NAV.patient.push(['patient-sites','Sedes y ubicación']);

// mediturno-fase65: conservar una sola entrada de Sedes y ubicación en el menú del paciente.
if(Array.isArray(NAV.patient)){
  const idx=NAV.patient.findIndex(item=>Array.isArray(item)&&item[0]==='patient-sites');
  const unique=NAV.patient.filter((item,i)=>{
    if(!Array.isArray(item))return true;
    const label=String(item[1]??'').toLowerCase();
    const isSites=/sedes?\s*y\s*ubicaci[oó]n/.test(label)||item[0]==='patient-sites';
    return !isSites||(idx>=0?i===idx:true);
  });
  NAV.patient.splice(0,NAV.patient.length,...unique);
}
// mediturno-paciente-v66 — reutilizar solo la ruta existente #locations.
if(Array.isArray(NAV.patient)){
 const list=NAV.patient;
 const hasLocations=list.some(x=>Array.isArray(x)&&x[0]==='locations');
 for(let i=list.length-1;i>=0;i--){
  const item=list[i];
  if(Array.isArray(item)&&item[0]==='patient-sites')list.splice(i,1);
 }
 if(!hasLocations)list.push(['locations','Sedes y ubicación']);
 // Si se habían agregado entradas por nombre, conservar una sola ruta.
 let seen=false;
 for(let i=list.length-1;i>=0;i--){
  const item=list[i],named=Array.isArray(item)&&(/sedes?\s*y\s*ubicaci[oó]n/i.test(String(item[1]||''))||item[0]==='locations');
  if(named){if(seen)list.splice(i,1);else {item[0]='locations';item[1]='Sedes y ubicación';seen=true;}}
 }
}
// Fase 6.7: NAV usa [ruta, icono, etiqueta]. Evita duplicados y conserva la única ruta #locations.
if(Array.isArray(NAV.patient)){
 const locs=NAV.patient.filter(x=>Array.isArray(x)&&(x[0]==='locations'||x[0]==='patient-sites'));
 if(locs.length){
  let found=false;
  for(let i=NAV.patient.length-1;i>=0;i--){
   const it=NAV.patient[i];if(Array.isArray(it)&&(it[0]==='locations'||it[0]==='patient-sites')){
    if(found){NAV.patient.splice(i,1);}else{NAV.patient[i]=['locations','⌖','Sedes y ubicación'];found=true;}
   }
  }
 } else NAV.patient.push(['locations','⌖','Sedes y ubicación']);
}
const root=document.querySelector('#app');
const hasToken=()=>!!sessionStorage.getItem('token');let currentUser=null;let notification='';let runId=0;
const cache={patientAppointments:[],doctorAppointments:[],adminSites:[],adminDoctors:[],adminShifts:[],adminBlocks:[],announcements:[],patientCareRecords:[]};
const currentPage=()=>location.hash.slice(1)||'dashboard';
const showMessage=(text,error=false)=>{notification={text,error};render();};
const escapeHtml=(value='')=>String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateTime=value=>new Date(value).toLocaleString('es-PE',{timeZone:'America/Lima',dateStyle:'long',timeStyle:'short'});
const visitTypeLabel={initial:'Primera consulta',followup:'Consulta de seguimiento',single:'Consulta única'};
const careTypeLabel={general:'Consulta general',specialized:'Atención especializada',test:'Análisis o prueba',control:'Control médico'};
const statusLabel={reserved:'Reservada',cancelled:'Cancelada',completed:'Atendida'};
const cancellationLabel={none:'Sin solicitud de cancelación',pending:'Solicitud pendiente',approved:'Cancelación aprobada',rejected:'Cancelación rechazada'};
function logout(){sessionStorage.removeItem('token');currentUser=null;location.hash='login';render();}
function findAppointment(source,id){const list=source==='doctor'?cache.doctorAppointments:cache.patientAppointments;return list.find(x=>String(x.id)===String(id));}
function detailItem(label,value){return `<div class="detail-item"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value||'No registrado')}</strong></div>`;}
function openAppointmentModal(item,source='patient'){
 if(!item)return;
 document.querySelector('.modal-overlay')?.remove();
 const cancellation=item.cancellation||{status:'none'};
 const modal=`<div class="modal-overlay" data-role="modal-close"><div class="modal-panel" role="dialog" aria-modal="true" aria-labelledby="appt-modal-title"><div class="modal-header"><div><div class="crumb">MediTurno AI / Información de la cita</div><h3 id="appt-modal-title">${source==='doctor'?'Detalle de atención':'Detalle de tu cita'}</h3><div class="status-strip"><span class="tag ${item.status==='cancelled'?'danger':'success'}">${escapeHtml(statusLabel[item.status]||item.status)}</span><span class="tag ${cancellation.status==='pending'?'warning':cancellation.status==='approved'?'success':cancellation.status==='rejected'?'danger':'neutral'}">${escapeHtml(cancellationLabel[cancellation.status]||cancellation.status)}</span></div></div><button class="modal-close" type="button" data-role="modal-close" aria-label="Cerrar">✕</button></div><div class="modal-body"><div class="modal-grid">${detailItem(source==='doctor'?'Paciente':'Médico',source==='doctor'?item.patientName:item.doctorName)}${detailItem('Especialidad',item.specialty||'General')}${detailItem('Fecha y hora',dateTime(item.startsAt))}${detailItem('Tipo de cita',visitTypeLabel[item.visitType]||item.visitType)}${detailItem('Tipo de atención',careTypeLabel[item.careType]||item.careType)}${detailItem('Sede',item.locationName||'Sede por confirmar')}${item.siteAddress?detailItem('Dirección',item.siteAddress):''}</div><div class="modal-section"><h4>Motivo o descripción de la cita</h4><div class="card"><p>${escapeHtml(item.reason||'No se registró un motivo específico para esta cita.')}</p></div></div>${item.cancellation?.reason?`<div class="modal-section"><h4>Solicitud de cancelación</h4><div class="card"><p><strong>Motivo indicado:</strong> ${escapeHtml(item.cancellation.reason)}</p>${item.cancellation.reviewNote?`<p><strong>Nota de revisión:</strong> ${escapeHtml(item.cancellation.reviewNote)}</p>`:''}</div></div>`:''}<div class="modal-actions">${source==='patient'&&item.status==='reserved'&&new Date(item.startsAt)>new Date()&&item.cancellation?.status!=='pending'?`<button class="btn-outline request-cancel" data-id="${escapeHtml(item.id)}">Solicitar cancelación</button>`:''}${source==='doctor'&&item.cancellation?.status==='pending'?`<button class="btn-success decide-cancel" data-id="${escapeHtml(item.id)}" data-decision="approved">Aprobar cancelación</button><button class="btn-danger decide-cancel" data-id="${escapeHtml(item.id)}" data-decision="rejected">Rechazar</button>`:''}<button class="btn" type="button" data-role="modal-close">Cerrar</button></div></div></div></div>`;
 document.body.insertAdjacentHTML('beforeend',modal);
}
async function render(){
 const seq=++runId;const route=currentPage();
 if(route==='logout'){logout();return;}
 if(!hasToken()||route==='login'||route==='register'){
  root.innerHTML=(route==='register'?registerPage():loginPage());return;
 }
 if(!currentUser){try{const d=await me();currentUser=d.user;}catch(err){sessionStorage.removeItem('token');root.innerHTML=loginPage();const el=document.querySelector('#auth-alert');if(el)el.textContent='Tu sesión expiró o no se pudo verificar. Inicia sesión de nuevo.';return;}}
 const role=currentUser.role||'patient';const permitted=NAV[role]||NAV.patient;
 const page=permitted.some(x=>x[0]===route)?route:'dashboard';let content='';
 let activeNotices=[];
 try {
  if(page==='dashboard'||page==='announcements'){activeNotices=await listAnnouncements();cache.announcements=activeNotices;}
  if(page==='dashboard'&&role==='patient'){const [data,care,clinical]=await Promise.all([listMyAppointments(),getPatientCareRecords(),getPatientClinicalList()]);cache.patientAppointments=data;cache.patientCareRecords=care.records;content=patientHomeV6({user:currentUser,appointments:data,plans:clinical.plans,exams:clinical.exams,notices:activeNotices});}
  else if(page==='dashboard'&&role==='doctor'){const [appointments,stats]=await Promise.all([listDoctorAppointments(),getDoctorStats()]);cache.doctorAppointments=appointments;content=doctorDashboard({appointments,stats});}
  else if(page==='dashboard'&&role==='admin'){const [sites,doctors,shifts,blocks]=await Promise.all([getSites(),listAdminDoctors(),getAdminShifts(),getBlocks()]);Object.assign(cache,{adminSites:sites,adminDoctors:doctors,adminShifts:shifts,adminBlocks:blocks});content=await adminAdvancedPage7('dashboard');}
  else if(page==='announcements'){if(role==='admin'){const sites=await getSites();cache.adminSites=sites;}content=announcementsPage(activeNotices,{admin:role==='admin'});}
  else if(role==='admin'&&page==='locations'){content=await adminSitesPage72();}
  else if(role==='admin'&&page==='blocks'){const [sites,blocks]=await Promise.all([getSites(),getBlocks()]);Object.assign(cache,{adminSites:sites,adminBlocks:blocks});content=adminBlocksPage({sites,blocks});}
  else if(role==='admin'&&page==='doctors'){const [doctors,shifts,sites]=await Promise.all([listAdminDoctors(),getAdminShifts(),getSites()]);Object.assign(cache,{adminDoctors:doctors,adminShifts:shifts,adminSites:sites});content=adminDoctorsPage(doctors,shifts,sites);}
  else if(role==='admin'&&page==='patients')content=adminPatientsPage(await listAdminPatients());
  else if(role==='doctor'&&(page==='followup'||page==='tests')){content=page==='tests'?doctorExams66(await getDoctorClinicalList()):doctorClinicalPage(await getDoctorClinicalList(),page);}
  else if(role==='doctor'&&page==='history'){const data=await listDoctorAppointments();cache.doctorAppointments=data;content=doctorHistoryPage(data);}
  else if(role==='patient'&&page==='history'){const [data,care]=await Promise.all([listMyAppointments(),getPatientCareRecords()]);cache.patientAppointments=data;cache.patientCareRecords=care.records;content=patientHistoryV6(data);}
  else if(role==='patient'&&(page==='followup'||page==='tests')){const [clinical,data]=await Promise.all([getPatientClinicalList(),listMyAppointments()]);cache.patientAppointments=data;content=page==='followup'?patientFollowupV6({plans:clinical.plans,appointments:data}):patientExams66(clinical.exams);}
  else if(role==='doctor'&&(page==='agenda'||page==='pending')){const data=await listDoctorAppointments();cache.doctorAppointments=data;content=doctorAgendaV6(data);}
  else if(role==='patient'&&page==='locations'){content=patientLocations67(await getSites());}
  else if(role==='patient'&&page==='doctors')content=enhanceDoctorsV6(doctorsPage(await listDoctors()));
  else if(role==='patient'&&page==='appointments'){const [data,care]=await Promise.all([listMyAppointments(),getPatientCareRecords()]);cache.patientAppointments=data;cache.patientCareRecords=care.records;content=patientAppointmentsV6(data);}
  else if(role==='doctor'&&page==='reviews'){const {items}=await getReviews();content=doctorReviewsV6(items);}
  else if(page==='profile'&&(role==='patient'||role==='doctor')){content=profilePage67(await loadProfile67());}
  else if(role==='admin'&&page==='tests'){content=await lab73Page('admin');}
  else if(role==='admin'&&['appointments','services','tests','reports','permissions','profile'].includes(page)){content=await adminAdvancedPage7(page);}
  else content=placeholder(page,role);
 }catch(err){content=empty('No se pudieron cargar los datos',err.message);}
 if(seq!==runId)return;
 if(page==='dashboard'){content=content.replace(/<section class="notice-banner"[\s\S]*?<\/section>/,noticeBanner(activeNotices));}
 if((role==='patient'||role==='doctor')&&page==='tests'&&!content.includes('data-lab-role'))content+=await lab73Page(role);
 root.innerHTML=layout({role,page,name:currentUser.name,content});
 if(page==='tests')lab73Attach(role);
 if(role==='doctor')installExamDropdown74();
 if(role==='admin'&&page==='locations')adminSitesAttach72();
 if(role==='admin')adminAdvancedAttach7(page);
 attachPhase67();
 if(role==='patient'){attachP6Interactions();attachPatientCorrections66();}else if(role==='doctor')attachPatientCorrections66();
 if(role==='patient'&&page==='doctors')initializeDoctorForms();
 document.querySelector('.modal-overlay')?.remove();
 if(notification){const a=document.querySelector('#alert');a.innerHTML='';const p=document.createElement('div');p.className='alert'+(notification.error?' error':'');p.textContent=notification.text;a.appendChild(p);notification='';}
}
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0)});
async function openClinicalAppointment(id){
 const item=cache.doctorAppointments.find(x=>String(x.id)===String(id));
 if(!item){showMessage('Cita no encontrada en la agenda.',true);return;}
 try{const details=await getClinicalDetails(id);document.querySelector('.modal-overlay')?.remove();showCarePage(item,details);await hydrateFollowupForm();}
 catch(err){showMessage('Error: '+err.message,true);}
}
async function runClinicalAction(action,id,body){
 try{await action(id,body);const details=await getClinicalDetails(id);const updated=cache.doctorAppointments.find(x=>String(x.id)===String(id));if(updated&&details.appointment.status)updated.status=details.appointment.status;
 document.querySelector('.modal-overlay')?.remove();showCarePage(updated,details);await hydrateFollowupForm();if(details.encounter?.status!=='completed'&&details.encounter){await attachRecorder(id);} 
 }catch(err){alert('No se pudo completar la acción: '+err.message);}
}
document.addEventListener('submit',async e=>{
 const form=e.target;
 if(form.id==='clinical-followup-form'){
  e.preventDefault();const body=Object.fromEntries(new FormData(form));
  const siteName=form.querySelector('.clinical-followup-site')?.selectedOptions?.[0]?.textContent||'Sede';
  const summary=`Paciente: ${findAppointment('doctor',form.dataset.id)?.patientName||'Paciente'}\nSeguimiento: ${form.querySelector('[name=planId]')?.selectedOptions?.[0]?.textContent}\nSede: ${siteName}\nFecha: ${body.date}\nHora: ${body.time}\nMotivo: ${body.reason}\n\n¿Confirmas esta nueva cita?`;
  if(!confirm(summary))return;
  try{await bookFollowupAppointment(form.dataset.id,body);await runClinicalAction(getClinicalDetails,form.dataset.id);alert('Cita de seguimiento confirmada. Aparecerá en la agenda y en el panel del paciente.');}catch(err){alert('No se pudo reservar: '+err.message);}return;
 }
 if(form.matches('#clinical-notes-form,#clinical-treatment-form,#clinical-link-form,#clinical-exam-form')){
  e.preventDefault();const id=form.dataset.id;const body=Object.fromEntries(new FormData(form));
  const submit=form.querySelector('[type=submit]');if(submit)submit.disabled=true;
  if(form.id==='clinical-notes-form')await runClinicalAction(saveClinicalNotes,id,body);
  else if(form.id==='clinical-treatment-form')await runClinicalAction(createTreatmentPlan,id,body.title);
  else if(form.id==='clinical-link-form')await runClinicalAction((id)=>linkTreatmentPlan(id,body.planId),id);
  else await runClinicalAction(createExamOrder,id,body);
  if(submit&&submit.isConnected)submit.disabled=false;return;
 }
 if(!form.matches('#login-form,#register-form,.appointment-form,#admin-create-doctor,#site-create-form,#shift-create-form,#block-create-form,#announcement-create-form'))return;e.preventDefault();
 const body=Object.fromEntries(new FormData(form));
 if(form.id==='shift-create-form'){body.weekdays=[...form.querySelectorAll('input[name=weekdays]:checked')].map(x=>Number(x.value));if(!body.weekdays.length){showMessage('Selecciona al menos un día de atención.',true);return;}}
 const submit=form.querySelector('[type=submit]');if(submit)submit.disabled=true;
 try {
  if(form.id==='login-form'||form.id==='register-form'){
   const data=await(form.id==='login-form'?login(body):register(body));
   sessionStorage.setItem('token',data.token);currentUser=data.user;location.hash='dashboard';await async function hydrateFollowupForm(){
 const form=document.querySelector('#clinical-followup-form');if(!form)return;
 const appointment=findAppointment('doctor',form.dataset.id);if(!appointment)return;
 const details=await getClinicalDetails(form.dataset.id);form.dataset.doctorId=details.appointment.doctorId;
 const sel=form.querySelector('.clinical-followup-site');const date=form.querySelector('.clinical-followup-date');
 date.min=new Date().toLocaleDateString('en-CA',{timeZone:'America/Lima'});
 try{const shifts=await getShifts(form.dataset.doctorId);const sites=[...new Map(shifts.map(s=>[s.siteId,s])).values()];
 if(!sel.isConnected)return;sel.innerHTML='<option value="">Selecciona sede</option>'+sites.map(s=>`<option value="${escapeHtml(s.siteId)}">${escapeHtml(s.siteName)}</option>`).join('');
 }catch(err){sel.innerHTML='<option value="">No se pudieron cargar sedes</option>';}
}
async function hydrateFollowupSlots(form){
 const appointment=findAppointment('doctor',form.dataset.id),siteId=form.querySelector('.clinical-followup-site').value,date=form.querySelector('.clinical-followup-date').value,time=form.querySelector('.clinical-followup-time');
 if(!appointment||!siteId||!date){time.innerHTML='<option value="">Selecciona sede y fecha</option>';return;}
 try{const result=await getSlots(form.dataset.doctorId,siteId,date);time.innerHTML='<option value="">Selecciona hora</option>'+result.slots.map(x=>`<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join('');}
 catch(err){time.innerHTML='<option value="">'+escapeHtml(err.message)+'</option>';}
}
document.addEventListener('change',e=>{if(e.target.matches('.clinical-followup-site,.clinical-followup-date')){const f=e.target.closest('#clinical-followup-form');if(f)hydrateFollowupSlots(f);}});
render();
  }else if(form.id==='admin-create-doctor'){await createDoctorAccount(body);showMessage('Cuenta de médico creada correctamente.');}
  else if(form.id==='site-create-form'){await addSite(body);showMessage('Sede creada correctamente.');}
  else if(form.id==='shift-create-form'){const result=await createBatch76(body);showMessage(result.message||'Horarios asignados correctamente.');}
  else if(form.id==='block-create-form'){const result=await addBlock(body);showMessage('Bloqueo creado. Citas existentes que requieren revisión: '+result.appointmentsToReview);}
  else if(form.id==='announcement-create-form'){body.validFrom+='-05:00';body.validUntil+='-05:00';if(body.category==='suspension')body.audience='all';if(body.category!=='suspension'){delete body.siteId;delete body.date;delete body.startHour;delete body.endHour;}const result=await publishAnnouncement(body);document.querySelector('.modal-overlay')?.remove();showMessage(result.appointmentsToReview?`Comunicado publicado. Hay ${result.appointmentsToReview} citas existentes para revisar.`:'Comunicado publicado y disponible en los paneles según sus destinatarios.');}
  else{await createAppointment({doctorId:form.dataset.id,...body});location.hash='appointments';showMessage('Cita registrada correctamente. Revisa sus detalles en Mis citas.');}
 }catch(err){if(form.id==='login-form'||form.id==='register-form'){const a=document.querySelector('#auth-alert');if(a)a.textContent=err.message;}else showMessage('Error: '+err.message,true);}
 finally{if(submit&&submit.isConnected)submit.disabled=false;}
});
document.addEventListener('click',async e=>{
 const filterBtn=e.target.closest('[data-visit-filter]');
 if(filterBtn){
  const selected=filterBtn.dataset.visitFilter;
  const allButtons=[...document.querySelectorAll('[data-visit-filter]')];
  for(const button of allButtons){const active=button.dataset.visitFilter===selected;button.classList.toggle('active',active);button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;}
  document.querySelectorAll('[data-visit-panel]').forEach(panel=>{panel.hidden=panel.dataset.visitPanel!==selected;});
  return;
 }
 const logoutBtn=e.target.closest('[data-action="logout"]');if(logoutBtn){logout();return;}
 const menuBtn=e.target.closest('[data-action="toggle-menu"]');if(menuBtn){document.querySelector('#sidebar')?.classList.toggle('open');return;}
 const openModal=e.target.closest('.admin-open-modal');
 if(openModal){const markup=openModal.dataset.modal==='announcement'?announcementModal(cache.adminSites):openModal.dataset.modal==='doctor'?adminDoctorCreateModal():adminScheduleModal(openModal.dataset.modal,{sites:cache.adminSites});document.querySelector('.modal-overlay')?.remove();if(markup)document.body.insertAdjacentHTML('beforeend',markup);if(openModal.dataset.modal==='site')void attachAdminSiteMap71();return;}
 const editShift76=e.target.closest('.shift-edit76');
 if(editShift76){
  const shift=cache.adminShifts.find(x=>x.id===editShift76.dataset.id&&x.isActive);
  if(!shift)return alert('No se encontró el horario. Recarga la página.');
  const host=editShift76.closest('.shift-entry');
  host.querySelector('.shift-edit76-form')?.remove();
  const siteChoices=cache.adminSites.map(s=>'<option value="'+escapeHtml(s.id)+'" '+(s.id===shift.siteId?'selected':'')+'>'+escapeHtml(s.name)+'</option>').join('');
  const dayChoices=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'].map((d,i)=>'<option value="'+i+'" '+(Number(shift.weekday)===i?'selected':'')+'>'+d+'</option>').join('');
  host.insertAdjacentHTML('beforeend','<form class="shift-edit76-form"><strong>Modificar horario</strong><div class="form-grid-two"><label class="field">Sede<select name="siteId" required>'+siteChoices+'</select></label><label class="field">Día<select name="weekday" required>'+dayChoices+'</select></label><label class="field">Desde<input type="time" name="startHour" required value="'+escapeHtml(shift.startHour)+'"></label><label class="field">Hasta<input type="time" name="endHour" required value="'+escapeHtml(shift.endHour)+'"></label></div><div class="modal-actions"><button type="button" class="btn-outline shift-cancel76">Cancelar</button><button class="btn" type="submit">Guardar cambios</button></div></form>');
  return;
 }
 const cancelEdit76=e.target.closest('.shift-cancel76');
 if(cancelEdit76){cancelEdit76.closest('form')?.remove();return;}
 const scheduleBtn=e.target.closest('.admin-doctor-schedule');
 if(scheduleBtn){const markup=adminDoctorModal(cache.adminDoctors,scheduleBtn.dataset.doctor,cache.adminShifts,cache.adminSites);document.querySelector('.modal-overlay')?.remove();if(markup)document.body.insertAdjacentHTML('beforeend',markup);return;}
 const preset=e.target.closest('.weekday-preset');
 if(preset){const selected=new Set(preset.dataset.days.split(',').filter(Boolean));document.querySelectorAll('.weekday-grid input[type=checkbox]').forEach(x=>x.checked=selected.has(x.value));return;}
 // Cerrar únicamente al pulsar un botón explícito o directamente el fondo del modal.
 // No usar closest('[data-role="modal-close"]') sin esta distinción: el fondo
 // contiene el formulario y provocaría su cierre al pulsar cualquier campo.
 const explicitClose=e.target.closest('button[data-role="modal-close"]');
 const backdropClick=e.target.matches('.modal-overlay[data-role="modal-close"]');
 if(explicitClose||backdropClick){document.querySelector('.modal-overlay')?.remove();return;}
 const patientCareBtn=e.target.closest('.patient-care-open');
 if(patientCareBtn){const r=cache.patientCareRecords.find(x=>x.id===patientCareBtn.dataset.id);if(r){document.querySelector('.modal-overlay')?.remove();document.body.insertAdjacentHTML('beforeend',patientCareModal(r));}return;}
 const editExam=e.target.closest('.clinical-edit-exam');
 if(editExam){const id=editExam.dataset.id,examId=editExam.dataset.exam;const d=await getClinicalDetails(id);const x=d.exams.find(v=>v.id===examId);if(!x)return;const title=prompt('Nombre del examen:',x.title);if(title===null)return;const patientInstructions=prompt('Indicaciones:',x.patientInstructions||'');if(patientInstructions===null)return;try{await editExamOrder(id,examId,{title,patientInstructions});await runClinicalAction(getClinicalDetails,id);}catch(err){alert(err.message)}return;}
 const removeExam=e.target.closest('.clinical-remove-exam');
 if(removeExam){if(!confirm('¿Eliminar esta solicitud de examen?'))return;try{await removeExamOrder(removeExam.dataset.id,removeExam.dataset.exam);await runClinicalAction(getClinicalDetails,removeExam.dataset.id);}catch(err){alert(err.message)}return;}
 const removePlan=e.target.closest('.clinical-remove-plan');
 if(removePlan){if(!confirm('¿Eliminar este seguimiento recién creado?'))return;try{await removeTreatmentPlan(removePlan.dataset.id,removePlan.dataset.plan);await runClinicalAction(getClinicalDetails,removePlan.dataset.id);}catch(err){alert(err.message)}return;}
 const clinicalOpen=e.target.closest('.open-clinical-appointment');
 if(clinicalOpen){await openClinicalAppointment(clinicalOpen.dataset.id);return;}
 const clinicalStart=e.target.closest('.clinical-start');
 if(clinicalStart){await runClinicalAction(startClinicalCare,clinicalStart.dataset.id);return;}
 const clinicalFinish=e.target.closest('.clinical-finish');
 if(clinicalFinish){if(!confirm('¿Finalizar esta atención? Las notas quedarán en modo solo lectura.'))return;await runClinicalAction(finishClinicalCare,clinicalFinish.dataset.id);return;}
 const viewBtn=e.target.closest('.view-appointment');
 if(viewBtn){const item=findAppointment(viewBtn.dataset.source,viewBtn.dataset.id);openAppointmentModal(item,viewBtn.dataset.source);return;}
 const cancelBtn=e.target.closest('.request-cancel');
 if(cancelBtn){const reason=prompt('Indica por qué necesitas cancelar tu cita (mínimo 5 caracteres):');if(reason===null)return;
  try{await requestCancellation(cancelBtn.dataset.id,reason);document.querySelector('.modal-overlay')?.remove();showMessage('Solicitud enviada al médico. La cita continúa reservada hasta su respuesta.');}catch(err){showMessage('Error: '+err.message,true);}return;}
 const multiRemove=e.target.closest('.remove-selected-shifts');
 if(multiRemove){
  const ids=[...document.querySelectorAll('.shift-select:checked')].map(el=>el.value);
  if(!ids.length)return;
  if(!confirm(`¿Eliminar ${ids.length} turno(s) seleccionado(s)? Las citas existentes se conservarán y los turnos con reservas futuras no podrán eliminarse.`))return;
  multiRemove.disabled=true;
  try{const result=await removeManyShifts(ids);showMessage(result.message||`${ids.length} turno(s) desactivado(s).`);}
  catch(err){multiRemove.disabled=false;alert('No fue posible eliminar los turnos: '+err.message);}
  return;
 }
 const disableBtn=e.target.closest('.disable-shift');
 if(disableBtn){if(!confirm('¿Desactivar este turno? Las citas ya existentes no se borrarán.'))return;try{await disableShift(disableBtn.dataset.id);showMessage('Turno desactivado.');}catch(err){showMessage('Error: '+err.message,true)}return;}
 const reviewBtn=e.target.closest('.decide-cancel');
 if(reviewBtn){const decision=reviewBtn.dataset.decision;const label=decision==='approved'?'aprobar':'rechazar';if(!confirm(`¿Confirmas ${label} esta solicitud de cancelación?`))return;
  try{await reviewCancellation(reviewBtn.dataset.id,decision);document.querySelector('.modal-overlay')?.remove();showMessage(decision==='approved'?'Cancelación aprobada.':'Solicitud rechazada, la cita sigue activa.');}catch(err){showMessage('Error: '+err.message,true);}return;}
});
document.addEventListener('change',e=>{
 if(e.target.matches('#select-all-shifts,.shift-select')){
  const all=[...document.querySelectorAll('.shift-select')];
  if(e.target.id==='select-all-shifts')all.forEach(el=>el.checked=e.target.checked);
  const selected=all.filter(el=>el.checked).length;
  const btn=document.querySelector('.remove-selected-shifts');if(btn)btn.disabled=!selected;
  const count=document.querySelector('#shift-selected-count');if(count)count.textContent=String(selected);
  const top=document.querySelector('#select-all-shifts');if(top){top.checked=all.length>0&&selected===all.length;top.indeterminate=selected>0&&selected<all.length;}
  return;
 }

 if(e.target.id==='notice-category'){const block=document.querySelector('#notice-block-fields');const audience=document.querySelector('#notice-audience');if(block){block.hidden=e.target.value!=='suspension';block.querySelectorAll('input,select').forEach(el=>el.required=!block.hidden);}if(audience){audience.value=e.target.value==='suspension'?'all':audience.value;audience.disabled=e.target.value==='suspension';}return;}
 if(e.target.id==='announcement-filter'){document.querySelectorAll('.announcement-entry').forEach(el=>el.hidden=e.target.value!=='all'&&el.dataset.category!==e.target.value);return;}
 const form=e.target.closest('.appointment-form');
 if(form&&(e.target.matches('.shift-site,.shift-date')))updateSlots(form);
});
document.addEventListener('input',e=>{
 if(e.target.id!=='page-search')return;const q=e.target.value.toLocaleLowerCase('es').trim();
 document.querySelectorAll('.searchable-item').forEach(item=>item.hidden=!item.textContent.toLocaleLowerCase('es').includes(q));
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')document.querySelector('.modal-overlay')?.remove();});

async function initializeDoctorForms(){
 const forms=[...document.querySelectorAll('.appointment-form')];
 await Promise.all(forms.map(async form=>{
  const select=form.querySelector('.shift-site'),info=form.querySelector('.shift-description');
  try{
   const shifts=await getShifts(form.dataset.id);
   if(!form.isConnected)return;
   form._shifts=shifts;
   const sites=[...new Map(shifts.map(s=>[s.siteId,{id:s.siteId,name:s.siteName,address:s.siteAddress}])).values()];
   select.innerHTML='<option value="">Selecciona sede</option>'+sites.map(s=>`<option value="${escapeHtml(s.id)}">${escapeHtml(s.name)}</option>`).join('');
   info.textContent=shifts.length?'Días de atención: '+shifts.map(s=>['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'][s.weekday]+' '+s.startHour+'–'+s.endHour+' ('+s.siteName+')').join(' · '):'Este médico todavía no tiene turnos configurados.';
  }catch(err){info.textContent='No fue posible cargar los horarios: '+err.message}
 }));
}
async function updateSlots(form){
 const siteId=form.querySelector('.shift-site').value;
 const date=form.querySelector('.shift-date').value;
 const select=form.querySelector('.available-time');
 const button=form.querySelector('[type=submit]');
 button.disabled=true;select.disabled=true;
 if(!siteId||!date){select.innerHTML='<option value="">Selecciona sede y fecha</option>';return;}
 const key=siteId+':'+date;form.dataset.availabilityKey=key;
 select.innerHTML='<option value="">Consultando...</option>';
 try{
  const result=await getSlots(form.dataset.id,siteId,date);
  if(!form.isConnected||form.dataset.availabilityKey!==key)return;
  select.innerHTML=result.slots.length?'<option value="">Selecciona una hora</option>'+result.slots.map(x=>`<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join(''):'<option value="">No hay horas disponibles</option>';
  select.disabled=!result.slots.length;button.disabled=!result.slots.length;
 }catch(err){if(form.isConnected){select.innerHTML='<option value="">'+escapeHtml(err.message)+'</option>';}}
}
async function hydrateFollowupForm(){
 const form=document.querySelector('#clinical-followup-form');if(!form)return;
 const appointment=findAppointment('doctor',form.dataset.id);if(!appointment)return;
 const details=await getClinicalDetails(form.dataset.id);form.dataset.doctorId=details.appointment.doctorId;
 const sel=form.querySelector('.clinical-followup-site');const date=form.querySelector('.clinical-followup-date');
 date.min=new Date().toLocaleDateString('en-CA',{timeZone:'America/Lima'});
 try{const shifts=await getShifts(form.dataset.doctorId);const sites=[...new Map(shifts.map(s=>[s.siteId,s])).values()];
 if(!sel.isConnected)return;sel.innerHTML='<option value="">Selecciona sede</option>'+sites.map(s=>`<option value="${escapeHtml(s.siteId)}">${escapeHtml(s.siteName)}</option>`).join('');
 }catch(err){sel.innerHTML='<option value="">No se pudieron cargar sedes</option>';}
}
async function hydrateFollowupSlots(form){
 const appointment=findAppointment('doctor',form.dataset.id),siteId=form.querySelector('.clinical-followup-site').value,date=form.querySelector('.clinical-followup-date').value,time=form.querySelector('.clinical-followup-time');
 if(!appointment||!siteId||!date){time.innerHTML='<option value="">Selecciona sede y fecha</option>';return;}
 try{const result=await getSlots(form.dataset.doctorId,siteId,date);time.innerHTML='<option value="">Selecciona hora</option>'+result.slots.map(x=>`<option value="${escapeHtml(x)}">${escapeHtml(x)}</option>`).join('');}
 catch(err){time.innerHTML='<option value="">'+escapeHtml(err.message)+'</option>';}
}
document.addEventListener('change',e=>{if(e.target.matches('.clinical-followup-site,.clinical-followup-date')){const f=e.target.closest('#clinical-followup-form');if(f)hydrateFollowupSlots(f);}});
render();

// Fase 5.4: grabación sólo en una atención iniciada; revisión sólo en #reviews.
async function attachRecorder(id){
 try{const [clinical,ai]=await Promise.all([getClinicalDetails(id),getAiSummary(id)]);
  if(!clinical.encounter||clinical.encounter.status==='completed')return;
  const panel=document.querySelector('.clinical-modal .modal-body');
  if(panel&&!panel.querySelector('#ai-section'))panel.insertAdjacentHTML('beforeend',liveAiPanel(id,ai.summary));
 }catch(error){console.warn('Grabación no disponible:',error.message);}
}
async function attachAiPatient(id){
 try{const {summary}=await getPatientSummary(id);const panel=document.querySelector('.modal-overlay .modal-body');if(panel&&!panel.querySelector('.ai-patient-ready,.ai-patient-pending'))panel.insertAdjacentHTML('beforeend',patientPdfAction(id,summary));}
 catch(error){console.warn('Documento pendiente:',error.message);}
}
let audioObjectUrl=null;
async function openReview(id){
 const {summary}=await getAiSummary(id);
 if(!summary?.transcript)throw new Error('Esta cita todavía no tiene transcripción guardada');
 if(audioObjectUrl){URL.revokeObjectURL(audioObjectUrl);audioObjectUrl=null;}
 document.querySelector('.modal-overlay')?.remove();mountDoctorReviewV6(id,summary);
 const status=document.querySelector('#review-audio-status');
 try{audioObjectUrl=await loadRecordingAudio(id);const audio=document.querySelector('#review-audio');if(audio){audio.src=audioObjectUrl;audio.load();}if(status)status.textContent='Audio privado listo para reproducir.';}
 catch(err){if(status)status.textContent='Audio no disponible: '+err.message;}
}
async function actOnAi(action,id){
 const status=document.querySelector('#ai-status');if(status)status.textContent='Procesando...';
 try {
  if(action==='pdf'){await downloadApprovedPdf(id);return;}
  if(action==='draft'){await makeAiDraft(id);}
  else if(action==='save'){await saveAiDraft(id,document.querySelector('#ai-draft')?.value||'');}
  else if(action==='approve'){
    const draft=document.querySelector('#ai-draft')?.value||'';
    await saveAiDraft(id,draft);
    if(!confirm('¿Confirmas que has revisado el contenido completo y deseas publicar el PDF aprobado?'))return;
    await approveAi(id);
  }
  await openReview(id);
 }catch(err){if(status)status.textContent='No se completó: '+err.message+' Puedes editar manualmente el borrador y guardar las correcciones.';}
}
document.addEventListener('click',async e=>{
 const clinical=e.target.closest('.open-clinical-appointment');if(clinical){setTimeout(()=>attachRecorder(clinical.dataset.id),400);return;}
 const patient=e.target.closest('.patient-care-open');if(patient){setTimeout(()=>attachAiPatient(patient.dataset.id),400);return;}
 const review=e.target.closest('.review-open');if(review){try{await openReview(review.dataset.id);}catch(err){alert(err.message);}return;}
 const live=e.target.closest('[data-live-action]');if(live){await manageLiveClick(e);return;}
 const manual=e.target.closest('[data-review-action="manual"]');if(manual){const textarea=document.querySelector('#ai-draft');if(textarea){textarea.focus();if(!textarea.value.trim())textarea.value='Motivo de consulta:\nObservaciones verificadas:\nIndicaciones y plan:\n';}return;}
 const ai=e.target.closest('[data-ai-action]');if(ai){e.preventDefault();ai.disabled=true;try{await actOnAi(ai.dataset.aiAction,ai.dataset.id);}finally{ai.disabled=false;}return;}
});
document.addEventListener('mediturno:live-saved',e=>{const panel=document.querySelector('#ai-section');panel?.remove();attachRecorder(e.detail.id);});
window.addEventListener('beforeunload',e=>{if(liveRunning()){e.preventDefault();e.returnValue='Grabación en curso';}});
// Impedir cerrar la ficha o finalizar la atención mientras siga grabando.
document.addEventListener('click',e=>{
 if(liveRunning()&&(e.target.closest('.clinical-finish')||e.target.closest('.clinical-modal [data-role="modal-close"]')||(e.target.classList?.contains('modal-overlay')&&e.target.querySelector('.clinical-modal')))){
 e.preventDefault();e.stopImmediatePropagation();alert('Detén y guarda la grabación antes de finalizar o cerrar la consulta.');
 }
},true);


// Fase 6.1: mover la ficha clínica existente al área principal de trabajo.
// Reutiliza los mismos formularios, identificadores y eventos de fases anteriores.
let careSelectedTab='record';
function careHost(){return document.querySelector('main') || document.querySelector('#app');}
function activateCareTab(name){
 const view=document.querySelector('#mediturno-care-screen');if(!view)return;
 careSelectedTab=name;
 view.querySelectorAll('[data-care-pane]').forEach(n=>n.hidden=n.dataset.carePane!==name);
 view.querySelectorAll('[data-care-tab]').forEach(n=>n.setAttribute('aria-selected',String(n.dataset.careTab===name)));
}
function closeCarePage(){
 const previous=document.querySelector('#mediturno-care-screen');previous?.dispatchEvent(new Event('mediturno:care-closed'));previous?.remove();
 document.querySelector('main.mediturno-care-mode')?.classList.remove('mediturno-care-mode');
 careSelectedTab='record';
}
function showCarePage(item,details){
 if(!item)return;
 const running=!!details.encounter && details.encounter.status!=='completed' && details.appointment?.status!=='completed';
 if(!running){
  closeCarePage();
  // No cambiar la forma en que se consultan fichas ya finalizadas.
  document.body.insertAdjacentHTML('beforeend',clinicalModal(item,details));
  return;
 }
 const host=careHost();if(!host)return;
 const selected=careSelectedTab;closeCarePage();careSelectedTab=selected;
 const screen=document.createElement('section');screen.id='mediturno-care-screen';screen.setAttribute('aria-label','Atención médica en curso');
 screen.innerHTML='<div class="care-toolbar"><div><span class="tag warning">Atención en curso</span><h2>Atención médica · '+escapeHtml(item.patientName||'Paciente')+'</h2><p class="muted">Consulta abierta: '+dateTime(item.startsAt)+'</p></div><button class="btn-outline" type="button" data-care-exit>← Volver a agenda</button></div>';
 const template=document.createElement('template');template.innerHTML=clinicalModal(item,details).trim();
 const panel=template.content.querySelector('.clinical-modal');
 if(!panel)throw new Error('No se encontró la ficha clínica existente');
 panel.removeAttribute('role');panel.removeAttribute('aria-modal');
 panel.querySelectorAll('[data-role="modal-close"]').forEach(b=>{
  b.removeAttribute('data-role');b.setAttribute('data-care-exit','');
  if(b.classList.contains('modal-close'))b.textContent='← Volver';
  else b.textContent='Volver a la agenda';
 });
 const body=panel.querySelector('.modal-body');
 const info=document.createElement('div');info.className='care-intro';
 for(const selector of ['.clinical-status','.clinical-info']){const node=body.querySelector(selector);if(node)info.append(node);}
 const tabs=document.createElement('div');tabs.className='care-tabs';tabs.setAttribute('role','tablist');
 const labels=[['record','🎙 Grabación'],['notes','📝 Notas clínicas'],['followup','🔄 Seguimientos'],['exams','🧪 Exámenes']];
 for(const [id,label]of labels){const button=document.createElement('button');button.type='button';button.className='care-tab';button.dataset.careTab=id;button.setAttribute('role','tab');button.textContent=label;tabs.append(button);}
 const panes=new Map();
 for(const [id]of labels){const node=document.createElement('section');node.className='care-pane';node.dataset.carePane=id;panes.set(id,node);}
 const notes=body.querySelector('#clinical-notes-form');if(notes)panes.get('notes').append(notes);
 const cols=body.querySelector('.clinical-cols');if(cols){const children=[...cols.children];if(children[0])panes.get('followup').append(children[0]);if(children[1])panes.get('exams').append(children[1]);cols.remove();}
 const ai=body.querySelector('#ai-section');if(ai)panes.get('record').append(ai);
 else panes.get('record').innerHTML='<p class="care-placeholder">El micrófono y la transcripción se cargarán aquí. Primero confirma el consentimiento de ambas personas.</p>';
 const actions=body.querySelector('.modal-actions');
 body.prepend(info,tabs,...panes.values());
 if(actions)body.append(actions);
 screen.append(panel);host.append(screen);host.classList.add('mediturno-care-mode');
 activateCareTab(careSelectedTab);
 // El panel de grabación de la Fase 5.4 se inyecta de forma asíncrona.
 // Moverlo a su pestaña sin reiniciar audio ni servicios.
 const observer=new MutationObserver(()=>{
  const recorder=body.querySelector('#ai-section');const tab=panes.get('record');
  if(recorder&&recorder.parentElement!==tab){tab.querySelector('.care-placeholder')?.remove();tab.append(recorder);}
 });
 observer.observe(body,{childList:true,subtree:true});
 screen.addEventListener('mediturno:care-closed',()=>observer.disconnect(),{once:true});
}
// Capturar antes que los manejadores genéricos de modales y navegación.
document.addEventListener('click',e=>{
 const tab=e.target.closest('[data-care-tab]');if(tab){e.preventDefault();e.stopImmediatePropagation();activateCareTab(tab.dataset.careTab);return;}
 const back=e.target.closest('[data-care-exit]');if(back){e.preventDefault();e.stopImmediatePropagation();if(liveRunning()){alert('Detén y guarda la grabación antes de salir de la atención.');return;}closeCarePage();location.hash='agenda';render();return;}
 const link=e.target.closest('a[href^="#"]');if(link&&document.querySelector('#mediturno-care-screen')&&liveRunning()){e.preventDefault();e.stopImmediatePropagation();alert('Detén y guarda la grabación antes de cambiar de sección.');}
},true);
// Conservar la pantalla mientras el médico opera dentro de una pestaña.
window.addEventListener('hashchange',()=>{if(document.querySelector('#mediturno-care-screen')&&liveRunning())alert('Hay una grabación activa. Regresa a la atención y guárdala antes de cambiar de página.');});


// Fase 6.2 — navegación médica basada en las pantallas de referencia.
function mountDoctorReviewV6(id,summary){
 const host=document.querySelector('main');if(!host)throw Error('No se encontró la región principal de la aplicación');
 document.querySelector('.modal-overlay')?.remove();
 host.innerHTML=doctorReviewV6(id,summary);
 host.querySelectorAll('[data-d6-pane]').forEach(el=>el.hidden=el.dataset.d6Pane!=='audio');
 window.scrollTo(0,0);
}
function d6SelectStep(step){
 const screen=document.querySelector('#d6-review-screen');if(!screen)return;
 screen.querySelectorAll('[data-d6-pane]').forEach(el=>el.hidden=el.dataset.d6Pane!==step);
 screen.querySelectorAll('.d6-step').forEach(el=>el.setAttribute('aria-selected',String(el.dataset.d6Step===step)));
}
function d6SyncApproval(){
 const a=document.querySelector('#d6-confirm-review'),b=document.querySelector('#d6-confirm-publish'),button=document.querySelector('#d6-approve');
 if(button)button.disabled=!(a?.checked&&b?.checked);
}
document.addEventListener('change',e=>{if(e.target.matches('#d6-confirm-review,#d6-confirm-publish'))d6SyncApproval();});
document.addEventListener('click',e=>{
 const open=e.target.closest('.d6-open-detail');
 if(open){e.preventDefault();e.stopImmediatePropagation();const item=cache.doctorAppointments.find(a=>String(a.id)===String(open.dataset.id));const host=document.querySelector('main');if(item&&host){host.innerHTML=doctorDetailV6(item);window.scrollTo(0,0);}return;}
 const back=e.target.closest('.d6-back-agenda,.d6-back-reviews');
 if(back){e.preventDefault();e.stopImmediatePropagation();const page=back.classList.contains('d6-back-reviews')?'reviews':'agenda';location.hash=page;if(currentPage()===page)render();return;}
 const step=e.target.closest('[data-d6-step]');
 if(step&&document.querySelector('#d6-review-screen')){e.preventDefault();e.stopImmediatePropagation();d6SelectStep(step.dataset.d6Step);return;}
},true);

// Fase 7.6: captura la edición antes del listener general y evita enviar un formulario no reconocido.
document.addEventListener('submit',async event=>{
 const form=event.target.closest('.shift-edit76-form');if(!form)return;
 event.preventDefault();event.stopImmediatePropagation();
 const id=form.closest('.shift-entry')?.querySelector('.shift-edit76')?.dataset.id;
 const body=Object.fromEntries(new FormData(form));
 const btn=form.querySelector('[type=submit]');if(btn)btn.disabled=true;
 try{const result=await updateShift76(id,body);document.querySelector('.modal-overlay')?.remove();showMessage(result.message||'Horario actualizado');}
 catch(error){alert('No se pudo modificar el horario: '+error.message);if(btn.isConnected)btn.disabled=false;}
},true);

// Actualiza vista previa cuando el médico edita (sin cambiar el sistema de guardado).
document.addEventListener('input', e=>{if(e.target?.id!=='ai-draft')return;const container=document.getElementById('summary81-content');if(container)container.innerHTML=_fase81VistaPrevia(e.target.value);});
