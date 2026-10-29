import PDFDocument from 'pdfkit';

export const SUMMARY_SECTIONS = [
  ['motivoConsulta','Motivo de consulta'],
  ['sintomas','Síntomas y antecedentes mencionados'],
  ['evaluacion','Evaluación y observaciones'],
  ['indicaciones','Indicaciones y plan mencionado'],
  ['seguimiento','Seguimiento'],
  ['pendientes','Información pendiente de confirmar'],
];

export const buildSummaryPrompt = transcript => `Eres un asistente de documentación médica para un PROTOTIPO académico con casos ficticios. Tu tarea es preparar un BORRADOR, nunca un diagnóstico ni una recomendación propia. Utiliza EXCLUSIVAMENTE información explícita en la transcripción. No inventes valores, medicamentos, diagnósticos, hallazgos, fechas, indicaciones ni decisiones clínicas. Cuando falte información, escribe "No mencionado". Si hay ambigüedad, indícalo en pendientes. Responde SOLO con un objeto JSON válido, sin markdown, sin bloques de código, sin texto adicional, con exactamente estas claves de texto (no arreglos): motivoConsulta, sintomas, evaluacion, indicaciones, seguimiento, pendientes. El médico debe revisar y corregir todo antes de aprobar.\n\nTRANSCRIPCIÓN FICTICIA:\n${transcript}`;

const clean = v => String(v ?? '').replace(/\r/g,'').replace(/\*\*(.*?)\*\*/gs,'$1').replace(/__(.*?)__/gs,'$1').replace(/^[ \t]*[-*] /gm,'• ').trim().slice(0,6000);
const normalizedKey = s => String(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
const headings = new Map(SUMMARY_SECTIONS.flatMap(([id,label]) => [[normalizedKey(id),id],[normalizedKey(label),id]]));
for(const [name,key] of [['Motivo','motivoConsulta'],['Datos relatados','sintomas'],['Observaciones disponibles','evaluacion'],['Plan mencionado','indicaciones'],['Información no confirmada','pendientes'],['Proxima cita','seguimiento']]) headings.set(normalizedKey(name),key);

export function parseSummary(raw){
 const text=String(raw||'').trim();
 if(!text)return {};
 let value=text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim();
 try{const parsed=JSON.parse(value);if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed)){
  const sectionObj={};for(const [k,v] of Object.entries(parsed)){const id=headings.get(normalizedKey(k));if(id&&typeof v==='string')sectionObj[id]=clean(v);}
  if(Object.keys(sectionObj).length)return sectionObj;
 }}catch{}
 const out={};let field=null;const leftovers=[];
 for(const line of text.split(/\n/)){
  const match=line.match(/^\s*(?:#{1,4}\s*)?(?:\*\*)?([^:\n]{3,75}?)(?:\*\*)?\s*:\s*(.*)$/);
  const label=match&&headings.get(normalizedKey(match[1]));
  if(label){field=label;out[field]=[out[field],clean(match[2])].filter(Boolean).join('\n');}
  else if(field){out[field]=[out[field],clean(line)].filter(Boolean).join('\n');}
  else if(line.trim())leftovers.push(clean(line));
 }
 if(Object.keys(out).length){if(leftovers.length)out.pendientes=[out.pendientes,...leftovers].filter(Boolean).join('\n');return out;}
 return {evaluacion:clean(text)};
}
export function formatSummary(raw){
 const obj=parseSummary(raw);
 return SUMMARY_SECTIONS.map(([id,title]) => `${title}:\n${clean(obj[id])||'No mencionado'}`).join('\n\n').slice(0,18000);
}

export async function renderStructuredPdf({text,patient,doctor,approvedAt}){
 const doc=new PDFDocument({size:'A4',margin:52,info:{Title:'MediTurno AI - Resumen aprobado',Author:'MediTurno AI'}});
 const chunks=[];const finished=new Promise((resolve,reject)=>{doc.on('data',chunk=>chunks.push(chunk));doc.on('end',()=>resolve(Buffer.concat(chunks)));doc.on('error',reject)});
 const pageW=doc.page.width-doc.page.margins.left-doc.page.margins.right;
 function room(n=80){if(doc.y+n>doc.page.height-doc.page.margins.bottom){doc.addPage();}}
 function meta(label,value){room(30);doc.font('Helvetica-Bold').fontSize(9).fillColor('#506070').text(`${label}: `,{continued:true}).font('Helvetica').fillColor('#25394b').text(String(value||'No registrado'));}
 doc.font('Helvetica-Bold').fontSize(20).fillColor('#0b7285').text('MEDITURNO AI');
 doc.moveDown(0.2).fontSize(13).fillColor('#182f43').text('RESUMEN DE ATENCIÓN MÉDICA');
 doc.moveDown(0.3).font('Helvetica').fontSize(9).fillColor('#64748b').text('Documento académico de demostración. El contenido fue revisado y aprobado por el médico.');
 doc.moveDown(0.8);meta('Paciente',patient);meta('Profesional que aprobó',doctor);meta('Fecha de aprobación',approvedAt instanceof Date?approvedAt.toLocaleString('es-PE',{timeZone:'America/Lima'}):approvedAt);
 doc.moveDown(0.7).strokeColor('#cbd5e1').moveTo(doc.x,doc.y).lineTo(doc.x+pageW,doc.y).stroke();doc.moveDown(0.6);
 const obj=parseSummary(text);
 for(let i=0;i<SUMMARY_SECTIONS.length;i++){
  const [id,title]=SUMMARY_SECTIONS[i];room(68);doc.font('Helvetica-Bold').fontSize(11).fillColor('#0b7285').text(`${i+1}. ${title}`,{keepWithNext:true});
  doc.moveDown(0.2).font('Helvetica').fontSize(10).fillColor('#172c3d').text(clean(obj[id])||'No mencionado',{lineGap:3});doc.moveDown(0.7);
 }
 room(60);doc.moveDown(0.2).strokeColor('#cbd5e1').moveTo(doc.x,doc.y).lineTo(doc.x+pageW,doc.y).stroke();doc.moveDown(0.4);
 doc.font('Helvetica').fontSize(8).fillColor('#64748b').text('Documento generado a partir del resumen corregido y aprobado. La transcripción y el audio permanecen separados del documento público.');
 doc.end();return finished;
}
