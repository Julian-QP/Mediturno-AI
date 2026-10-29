import { request } from '../../api/client.js';
// Fase 6.7: perfil de paciente y médico, y sedes con Google Maps Embed.
const esc=(x='')=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const list=x=>Array.isArray(x)?x:[];
const header=(title,description)=>`<header class="p67-header"><div><div class="p67-crumb">MediTurno AI / ${esc(title)}</div><h1>${esc(title)}</h1><p>${esc(description)}</p></div><span class="p67-chip">Mi cuenta</span></header>`;
const mapKey=(import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY||'').trim();
const mapLink=s=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([s.address,s.city].filter(Boolean).join(', '))}`;
export function patientLocations67(sites=[]){
 const xs=list(sites).filter(x=>x&&x.name);
 const first=xs.find(x=>x.address);
 const query=first?[first.address,first.city].filter(Boolean).join(', '):'';
 const map=mapKey&&query?`<iframe class="p67-map-frame" title="Mapa de ${esc(first.name)}" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen src="https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(mapKey)}&q=${encodeURIComponent(query)}"></iframe>`:
 `<div class="p67-map-no-key"><span class="p67-map-icon">⌖</span><strong>${xs.length?'Sedes registradas':'Aún no hay sedes'}</strong><p>${mapKey?'Registra una dirección en administración para ubicar la sede.':'Activa Maps Embed API y configura VITE_GOOGLE_MAPS_EMBED_KEY para mostrar el mapa interactivo.'}</p>${first?`<a class="btn-outline" target="_blank" rel="noopener noreferrer" href="${esc(mapLink(first))}">Abrir en Google Maps</a>`:''}</div>`;
 return `<div class="p67-screen p67-sites">${header('Sedes y ubicación','Encuentra tu sede, revisa sus horarios y organiza tu visita.')}
  <div class="p67-search"><span>⌕</span><input id="p67-location-filter" placeholder="Buscar sede o dirección" aria-label="Buscar sede o dirección"/><button type="button" id="p67-filter-button">Buscar</button></div>
  <div class="p67-site-grid"><section class="p67-card p67-site-map"><div class="p67-card-heading"><h2>Estamos cerca de ti</h2><small>${xs.length} sede(s) registrada(s)</small></div>${map}<p class="p67-footnote">${mapKey?'Mapa interactivo de Google Maps. La ubicación depende de la dirección registrada.':'El acceso a las direcciones funciona incluso sin clave API.'}</p></section>
  <section class="p67-site-list">${xs.length?xs.map((s,i)=>`<article class="p67-card p67-site-item" data-site-search="${esc((s.name+' '+(s.address||'')+' '+(s.city||'')).toLowerCase())}"><div class="p67-site-title"><h2>${esc(s.name)}</h2>${i===0?'<span class="p67-status">Sede registrada</span>':''}</div><p>⌖ ${esc(s.address||'Dirección por registrar')}</p>${s.city?`<p class="p67-minor">${esc(s.city)}</p>`:''}${s.openingHours?`<p class="p67-minor">◷ ${esc(s.openingHours)}</p>`:''}<div class="p67-site-actions">${s.address?`<a class="p67-link-btn" target="_blank" rel="noopener noreferrer" href="${esc(mapLink(s))}">Ver ubicación</a>`:''}${mapKey&&s.address?`<button type="button" class="p67-map-focus" data-location="${esc([s.address,s.city].filter(Boolean).join(', '))}" data-name="${esc(s.name)}">Ver en el mapa</button>`:''}</div></article>`).join(''):'<article class="p67-card">La administración todavía no ha registrado sedes.</article>'}</section></div>
  <div class="p67-advice">ⓘ Antes de acudir, verifica los horarios y comunicados de la sede correspondiente.</div></div>`;
}
export function profilePage67(user={}){
 const role=user.role==='doctor'?'Médico':'Paciente';
 const initials=String(user.name||'U').split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0].toUpperCase()).join('');
 return `<div class="p67-screen p67-profile">${header('Mi perfil','Consulta y actualiza tus datos personales y la seguridad de tu cuenta.')}
 <div class="p67-profile-top p67-card"><div class="p67-avatar">${esc(initials)}</div><div><h2>${esc(user.name||'Usuario')}</h2><p>${esc(user.email||'')}</p><span class="p67-status">${role}</span></div></div>
 <div class="p67-profile-grid"><section class="p67-card"><h2>Información personal</h2><p class="p67-muted">Estos cambios se guardan en tu cuenta.</p><form id="p67-profile-form">
 <label>Nombre completo<input name="name" required minlength="2" maxlength="100" autocomplete="name" value="${esc(user.name||'')}"/></label>
 <label>Correo electrónico<input value="${esc(user.email||'')}" disabled title="El correo no se modifica desde esta pantalla"/></label>
 <label>Teléfono<input name="phone" inputmode="tel" maxlength="25" autocomplete="tel" value="${esc(user.phone||'')}" placeholder="Opcional"/></label>
 <label>Dirección de contacto<input name="address" maxlength="220" autocomplete="street-address" value="${esc(user.address||'')}" placeholder="Opcional"/></label>
 <button type="submit" class="p67-primary">Guardar cambios</button></form></section>
 <section class="p67-card"><h2>Seguridad de la cuenta</h2><p class="p67-muted">Para cambiar tu contraseña confirma primero la actual.</p><form id="p67-password-form">
 <label>Contraseña actual<input type="password" name="currentPassword" autocomplete="current-password" required/></label>
 <label>Nueva contraseña<input type="password" name="newPassword" autocomplete="new-password" minlength="8" required/></label>
 <label>Confirmar nueva contraseña<input type="password" name="confirmPassword" autocomplete="new-password" minlength="8" required/></label>
 <button type="submit" class="p67-primary">Actualizar contraseña</button></form>
 <div class="p67-profile-info"><h3>Datos de la cuenta</h3><p><strong>Rol:</strong> ${esc(role)}</p><p><strong>Correo:</strong> ${esc(user.email||'')}</p><p>Por seguridad, el correo y el rol solo pueden modificarse por procedimientos administrativos autorizados.</p></div>
 </section></div><div role="status" aria-live="polite" id="p67-feedback" class="p67-feedback" hidden></div></div>`;
}
const result=(url,init={})=>request(url.replace(/^\/api/,''),{method:init.method||'GET',...(init.body?{body:JSON.parse(init.body)}:{})});
export async function loadProfile67(){return (await result('/api/profile')).user;}
export function attachPhase67(){
 // Corrige solo los textos duplicados de Sedes y ubicación sin alterar las otras opciones.
 document.querySelectorAll('a[href="#locations"]').forEach(a=>{
  if(!/sedes\s*y\s*ubicaci[oó]n/i.test(a.textContent||''))return;
  let txt=(a.textContent||'').toLowerCase();
  if((txt.match(/sedes\s*y\s*ubicaci[oó]n/g)||[]).length>1){
   // Conservar los iconos existentes, sustituyendo únicamente los nodos de etiqueta.
   const candidates=Array.from(a.querySelectorAll('span,small,strong,b')).filter(el=>/sedes\s*y\s*ubicaci[oó]n/i.test(el.textContent||''));
   if(candidates.length>1) candidates.slice(1).forEach(el=>el.remove());
   else {a.querySelectorAll('[data-p67-extra]').forEach(el=>el.remove());}
  }
 });
 const search=document.querySelector('#p67-location-filter');
 if(search){const filter=()=>{const q=search.value.trim().toLowerCase();document.querySelectorAll('.p67-site-item').forEach(el=>{el.hidden=!el.dataset.siteSearch.includes(q);});};search.addEventListener('input',filter);document.querySelector('#p67-filter-button')?.addEventListener('click',filter);}
 document.querySelectorAll('.p67-map-focus').forEach(b=>b.addEventListener('click',()=>{const frame=document.querySelector('.p67-map-frame');if(frame)frame.src=`https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(mapKey)}&q=${encodeURIComponent(b.dataset.location)}`;}));
 const feedback=(text,error=false)=>{const el=document.querySelector('#p67-feedback');if(el){el.hidden=false;el.textContent=text;el.classList.toggle('error',error);}};
 document.querySelector('#p67-profile-form')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget,button=f.querySelector('button');button.disabled=true;try{const values=Object.fromEntries(new FormData(f));const out=await result('/api/profile',{method:'PATCH',body:JSON.stringify(values)});feedback('Datos guardados correctamente.');const title=document.querySelector('.p67-profile-top h2');if(title)title.textContent=out.user.name;}catch(err){feedback(err.message,true)}finally{button.disabled=false;}});
 document.querySelector('#p67-password-form')?.addEventListener('submit',async e=>{e.preventDefault();const f=e.currentTarget;const v=Object.fromEntries(new FormData(f));if(v.newPassword!==v.confirmPassword){feedback('La confirmación de la contraseña no coincide.',true);return;}const button=f.querySelector('button');button.disabled=true;try{await result('/api/profile/password',{method:'POST',body:JSON.stringify({currentPassword:v.currentPassword,newPassword:v.newPassword})});f.reset();feedback('Contraseña actualizada correctamente.');}catch(err){feedback(err.message,true)}finally{button.disabled=false;}});
}
