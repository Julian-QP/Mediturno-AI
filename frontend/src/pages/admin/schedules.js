import {heading,empty} from '../../components/layout/DashboardLayout.js';
import {escapeHtml as esc} from '../../utils/format.js';
const days=['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const options=sites=>sites.map(s=>`<option value="${esc(s.id)}">${esc(s.name)}</option>`).join('');

export function adminSitesPage({sites=[]}){
 return heading('Sedes y consultorios','Consulta las sedes registradas y crea establecimientos desde una sola opción.')+
 `<div class="admin-section-bar"><div><h2>Sedes registradas (${sites.length})</h2><p class="muted">Direcciones disponibles para las consultas y horarios de los médicos.</p></div><button type="button" class="btn admin-open-modal" data-modal="site">＋ Crear sede</button></div>`+
 (sites.length?`<div class="card-grid">${sites.map(s=>`<article class="card site-card"><div class="admin-card-heading"><span class="doctor-icon">⌖</span><span class="tag success">Activa</span></div><h3>${esc(s.name)}</h3><p class="muted">${esc(s.address)}</p><p class="muted">${esc(s.district||'Distrito no especificado')}</p><a class="btn-outline" href="#doctors">Asignar horario a un médico →</a></article>`).join('')}</div>`:empty('Todavía no hay sedes','Selecciona «Crear sede» para registrar la primera.'));
}
export function adminBlocksPage({sites=[],blocks=[]}){
 return heading('Bloqueos de atención','Gestiona suspensiones de reserva por sede, fecha y rango horario.')+
 `<div class="admin-section-bar"><div><h2>Bloqueos registrados (${blocks.length})</h2><p class="muted">Los bloqueos afectan nuevas reservas, no cancelan las citas existentes.</p></div><button type="button" class="btn admin-open-modal" data-modal="block" ${sites.length?'':'disabled'}>＋ Crear bloqueo</button></div>`+
 `<section class="card">${blocks.length?blocks.map(b=>`<div class="appointment-row"><div><span class="tag danger">Atención bloqueada</span><h3>${esc(b.siteName)}</h3><p class="muted">${esc(b.date)} · ${esc(b.startHour)}–${esc(b.endHour)}</p><p>${esc(b.reason)}</p></div></div>`).join(''):empty('Sin bloqueos','No hay suspensiones registradas.')}</section>`+
 `<div class="notice-banner"><strong>Importante:</strong> si ya existen citas en un período bloqueado, el administrador debe revisarlas y gestionar su reprogramación. No se cancelan automáticamente.</div>`;
}
export function adminScheduleModal(kind,{sites=[]}={}){
 let title='',body='';
 if(kind==='site'){
  title='Crear nueva sede';
  body=`<form id="site-create-form"><label class="field">Nombre de la sede<input name="name" maxlength="100" required placeholder="Ej. Sede Central"></label><label class="field">Dirección completa<input name="address" maxlength="250" required placeholder="Av. ..."></label><label class="field">Distrito<input name="district" maxlength="100" placeholder="Distrito"></label><div class="modal-actions"><button class="btn-outline" type="button" data-role="modal-close">Cancelar</button><button class="btn" type="submit">Guardar sede</button></div></form>`;
 }else if(kind==='block'){
  title='Registrar bloqueo de atención';
  body=`<form id="block-create-form"><label class="field">Sede<select name="siteId" required>${options(sites)}</select></label><label class="field">Fecha<input name="date" type="date" required></label><div class="form-grid-two"><label class="field">Desde<input name="startHour" type="time" value="08:00" required></label><label class="field">Hasta<input name="endHour" type="time" value="17:00" required></label></div><label class="field">Motivo<textarea name="reason" minlength="5" maxlength="250" required placeholder="Mantenimiento programado"></textarea></label><div class="modal-actions"><button class="btn-outline" type="button" data-role="modal-close">Cancelar</button><button class="btn" type="submit">Guardar bloqueo</button></div></form>`;
 }
 if(!body)return '';
 return `<div class="modal-overlay" data-role="modal-close"><div class="modal-panel" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="modal-header"><h3>${esc(title)}</h3><button class="modal-close" type="button" data-role="modal-close">✕</button></div><div class="modal-body">${body}</div></div></div>`;
}
