import {formatSummary as _fase81FormatSummary, renderStructuredPdf as _fase81RenderPdf} from './summaryFormat81.js'; // MEDITURNO_FASE81_WRAPPER_UNIVERSAL
import PDFDocument from 'pdfkit';
import {google} from 'googleapis';
import {Readable} from 'node:stream';
const requireEnv=name=>{const value=process.env[name];if(!value)throw Object.assign(new Error(`Configura ${name} en backend/.env`),{status:503});return value;};
export async function transcribeAudio(buffer){
 const key=requireEnv('ASSEMBLYAI_API_KEY');
 const upload=await fetch('https://api.assemblyai.com/v2/upload',{method:'POST',headers:{authorization:key,'content-type':'application/octet-stream'},body:buffer});
 if(!upload.ok)throw new Error(`AssemblyAI upload: ${upload.status}`);
 const {upload_url}=await upload.json();
 const started=await fetch('https://api.assemblyai.com/v2/transcript',{method:'POST',headers:{authorization:key,'content-type':'application/json'},body:JSON.stringify({audio_url:upload_url,language_code:'es'})});
 if(!started.ok)throw new Error(`AssemblyAI transcript: ${started.status}`);
 const {id}=await started.json();
 for(let i=0;i<45;i++){
  await new Promise(r=>setTimeout(r,2000));
  const response=await fetch(`https://api.assemblyai.com/v2/transcript/${encodeURIComponent(id)}`,{headers:{authorization:key}});
  if(!response.ok)throw new Error(`AssemblyAI status: ${response.status}`);
  const transcript=await response.json();
  if(transcript.status==='completed')return String(transcript.text||'').slice(0,45000);
  if(transcript.status==='error')throw new Error('La transcripción no pudo completarse');
 }
 throw Object.assign(new Error('La transcripción tardó demasiado. Intenta con un audio corto.'),{status:504});
}
async function _fase81OriginalDraftSummary(transcript){
 const model=(process.env.GEMINI_MODEL||'gemini-3.8-flash').trim().replace(/^models\//,'');
 const key=requireEnv('GEMINI_API_KEY');
 const prompt='Produce en español un BORRADOR para revisión de un médico. Usa únicamente lo mencionado en la transcripción; no inventes hallazgos, diagnósticos, medicamentos ni instrucciones. Secciones: Motivo, Datos relatados, Observaciones disponibles, Plan mencionado, Información no confirmada. Señala incertidumbres. NO presentes el texto como aprobado.\n\nTRANSCRIPCIÓN DE CONSULTA FICTICIA:\n'+transcript;
 const url=`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
 const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const transient=new Set([429,500,502,503,504]);
 const maxAttempts=4;
 for(let attempt=1;attempt<=maxAttempts;attempt++){
  let response;
  try{
   response=await fetch(url,{
    method:'POST',
    headers:{'x-goog-api-key':key,'content-type':'application/json'},
    body:JSON.stringify({contents:[{role:'user',parts:[{text:prompt}]}],generationConfig:{temperature:0.1}}),
    signal:AbortSignal.timeout(45000)
   });
  }catch(error){
   if(attempt===maxAttempts)throw Object.assign(new Error('No se pudo contactar a Gemini. La transcripción sigue guardada; intenta generar el borrador más tarde.'),{status:503,cause:error});
   await sleep(Math.min(16000,1500*2**(attempt-1)));
   continue;
  }
  if(response.ok){
   const data=await response.json();
   const text=data.candidates?.[0]?.content?.parts?.map(x=>x.text||'').join('\n')?.trim();
   if(!text)throw Object.assign(new Error('Gemini respondió, pero no devolvió un borrador de texto.'),{status:502});
   return text.slice(0,18000);
  }
  const details=(await response.text()).slice(0,500);
  if(!transient.has(response.status)){
   throw Object.assign(new Error(`Gemini HTTP ${response.status}: ${details}`),{status:response.status===404?502:response.status});
  }
  if(attempt===maxAttempts){
   throw Object.assign(new Error(`Gemini está temporalmente ocupado (${response.status}). La transcripción permanece guardada; vuelve a pulsar «Generar borrador» más tarde.`),{status:503});
  }
  const retryAfter=Number(response.headers.get('retry-after'));
  const backoff=Math.min(16000,1500*2**(attempt-1));
  const delayMs=Number.isFinite(retryAfter)&&retryAfter>0?Math.min(retryAfter*1000,60000):backoff;
  console.warn(`Gemini HTTP ${response.status}: reintento ${attempt}/${maxAttempts-1} en ${Math.ceil(delayMs/1000)} s`);
  await sleep(delayMs);
 }
}
async function _fase81OriginalGeneratePdf({text,patient,doctor,approvedAt}){
 const doc=new PDFDocument({size:'A4',margin:54});const chunks=[];
 doc.on('data',chunk=>chunks.push(chunk));const done=new Promise((resolve,reject)=>{doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.on('error',reject)});
 doc.fontSize(20).fillColor('#0e7490').text('MediTurno AI — Resumen aprobado');
 doc.moveDown().fontSize(10).fillColor('#334155').text('Prototipo académico: datos ficticios.');
 doc.moveDown().fontSize(11).text(`Paciente: ${patient}`).text(`Médico aprobador: ${doctor}`).text(`Aprobado: ${approvedAt.toISOString()}`);
 doc.moveDown().strokeColor('#d4e4ea').moveTo(54,doc.y).lineTo(541,doc.y).stroke();
 doc.moveDown().fontSize(11).fillColor('#102b3c').text(text,{lineGap:4});doc.end();return done;
}
function oauth(){return new google.auth.OAuth2(requireEnv('GOOGLE_CLIENT_ID'),requireEnv('GOOGLE_CLIENT_SECRET'));}
function drive(){const auth=oauth();auth.setCredentials({refresh_token:requireEnv('GOOGLE_DRIVE_REFRESH_TOKEN')});return google.drive({version:'v3',auth});}
export async function uploadPrivatePdf(bytes,name){const api=drive();const result=await api.files.create({requestBody:{name,mimeType:'application/pdf'},media:{mimeType:'application/pdf',body:Readable.from(bytes)},fields:'id,name'});return result.data;}
export async function readPrivatePdf(fileId){const api=drive();const result=await api.files.get({fileId,alt:'media'},{responseType:'arraybuffer'});return Buffer.from(result.data);}

// Fase 8.1: conserva la lógica original (modelos, timeout y errores) y normaliza solo el resultado.
export async function draftSummary(...args) {
  const result = await _fase81OriginalDraftSummary(...args);
  return _fase81FormatSummary(result);
}
// PDF con encabezados tipográficos reales; la subida a Drive original no cambia.
export async function generatePdf(details) {
  return _fase81RenderPdf(details);
}
