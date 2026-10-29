const apiBase=(import.meta.env.VITE_API_URL||'http://localhost:3000/api').replace(/\/$/,'');
const htmlEscape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let session=null;
async function api(endpoint,options={}){
 const token=sessionStorage.getItem('token');const form=options.body instanceof FormData;
 const response=await fetch(apiBase+endpoint,{...options,headers:{Authorization:`Bearer ${token}`,...(form?{}:{'Content-Type':'application/json'}),...options.headers}});
 const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.message||data.detail||`Error HTTP ${response.status}`);return data;
}
function status(text){const el=document.querySelector('#live-status');if(el)el.textContent=text;}
function display(){const final=document.querySelector('#live-final');const partial=document.querySelector('#live-partial');if(final)final.textContent=session?.turns.map(x=>x.text).join('\n')||'';if(partial)partial.textContent=session?.partial||'';}
function toggleControls(on){for(const b of document.querySelectorAll('[data-live-action="start"]'))b.disabled=on;for(const b of document.querySelectorAll('[data-live-action="pause"],[data-live-action="stop"]'))b.disabled=!on;}
async function start(id){
 if(session)throw new Error('Ya hay una grabación abierta. Detenla primero.');
 const doc=document.querySelector('#live-consent-doctor')?.checked,patient=document.querySelector('#live-consent-patient')?.checked;
 if(!doc||!patient)throw new Error('Debes registrar el consentimiento de ambas personas.');
 await api(`/live/appointments/${id}/consent`,{method:'POST',body:JSON.stringify({doctorAccepted:true,patientAccepted:true})});
 // getUserMedia requiere HTTPS o localhost; nunca se activa antes de consentir.
 const media=await navigator.mediaDevices.getUserMedia({audio:true});
 try{
  const {token}=await api(`/live/appointments/${id}/token`,{method:'POST'});
  const ws=new WebSocket(`wss://streaming.assemblyai.com/v3/ws?sample_rate=16000&speech_model=u3-rt-pro&token=${encodeURIComponent(token)}`);
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('Timeout al abrir AssemblyAI Streaming')),15000);ws.onopen=()=>{clearTimeout(timer);resolve();};ws.onerror=()=>{clearTimeout(timer);reject(new Error('No se abrió el streaming; comprueba los créditos y permisos de AssemblyAI.'));};});
  const audioContext=new AudioContext();await audioContext.audioWorklet.addModule('/mediturno-pcm-worklet.js');
  const src=audioContext.createMediaStreamSource(media);const processor=new AudioWorkletNode(audioContext,'mediturno-pcm');src.connect(processor);processor.connect(audioContext.destination);
  const mime=['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(x=>MediaRecorder.isTypeSupported(x));
  if(!mime)throw new Error('El navegador no permite grabar audio en un formato compatible');
  const recorder=new MediaRecorder(media,{mimeType:mime});const blobs=[];recorder.ondataavailable=e=>{if(e.data.size)blobs.push(e.data);};
  session={id,ws,media,audioContext,processor,src,recorder,blobs,mime,turns:[],partial:'',paused:false,stopping:false};
  processor.port.onmessage=e=>{if(!session?.paused&&ws.readyState===WebSocket.OPEN&&ws.bufferedAmount<1_000_000)ws.send(e.data);};
  ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch{return;}if(m.type==='Turn'){const value=(m.transcript||'').trim();if(m.end_of_turn){if(value&&!session.turns.some(t=>t.order===m.turn_order))session.turns.push({order:m.turn_order,text:value});session.partial='';}else session.partial=value;display();}else if(m.type==='Termination'&&session?.ws===ws){status('Transcripción final recibida.');}};
  ws.onerror=()=>status('Se interrumpió AssemblyAI. Detén y guarda el audio para recuperarlo.');
  ws.onclose=()=>{if(session&&!session.stopping)status('Se cerró la conexión en vivo; detén la grabación para conservar el audio.');};
  recorder.start(1000);toggleControls(true);status('🔴 Grabando y transcribiendo en vivo...');
 } catch(err){media.getTracks().forEach(t=>t.stop());if(session){await cleanup(session);session=null;}throw err;}
}
async function cleanup(s){try{s.processor?.disconnect();s.src?.disconnect();await s.audioContext?.close();}catch{}s.media?.getTracks().forEach(t=>t.stop());if(s.ws?.readyState===WebSocket.OPEN)s.ws.close();}
function pause(){if(!session)return;const s=session;s.paused=!s.paused;s.processor.port.postMessage({type:s.paused?'pause':'resume'});if(s.paused)s.recorder.pause();else s.recorder.resume();const btn=document.querySelector('[data-live-action="pause"]');if(btn)btn.textContent=s.paused?'▶ Reanudar':'⏸ Pausar';status(s.paused?'Grabación en pausa':'Grabando de nuevo');}
async function stop(){
 if(!session)return;const s=session;s.stopping=true;status('Terminando sesión y guardando datos...');
 // Desconectar captura primero para evitar enviar audio después del cierre.
 s.processor.port.postMessage({type:'pause'});
 if(s.recorder.state==='paused')s.recorder.resume();
 const done=new Promise(resolve=>{s.recorder.onstop=resolve;});s.recorder.stop();await done;
 if(s.ws.readyState===WebSocket.OPEN){s.ws.send(JSON.stringify({type:'Terminate'}));await Promise.race([new Promise(resolve=>s.ws.addEventListener('close',resolve,{once:true})),new Promise(resolve=>setTimeout(resolve,5000))]);}
 const final=s.turns.map(t=>t.text).join('\n').trim();
 const blob=new Blob(s.blobs,{type:s.mime});await cleanup(s);session=null;toggleControls(false);
 if(!final){status('No hay transcripción definitiva. Conserva la grabación local para no perderla.');downloadLocal(blob);return;}
 const body=new FormData();body.append('audio',blob,'consulta.'+(s.mime.includes('mp4')?'m4a':'webm'));body.append('transcript',final);
 try{await api(`/live/appointments/${s.id}/finish`,{method:'POST',body});status('✅ Audio y transcripción guardados. Ya puedes generar el borrador con Gemini.');document.querySelector('#ai-section')?.remove();document.dispatchEvent(new CustomEvent('mediturno:live-saved',{detail:{id:s.id}}));}
 catch(err){downloadLocal(blob);status(`Error guardando: ${err.message}. Se descargó una copia local del audio; vuelve a iniciar el proceso cuando se resuelva.`);}
}
function downloadLocal(blob){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='mediturno-audio-recuperacion.webm';a.click();setTimeout(()=>URL.revokeObjectURL(url),15000);}
export async function manageLiveClick(e){const btn=e.target.closest('[data-live-action]');if(!btn)return false;e.preventDefault();try{if(btn.dataset.liveAction==='start')await start(btn.dataset.id);else if(btn.dataset.liveAction==='pause')pause();else if(btn.dataset.liveAction==='stop')await stop();}catch(err){status('❌ '+err.message);}return true;}
export function liveRunning(){return !!session;}
