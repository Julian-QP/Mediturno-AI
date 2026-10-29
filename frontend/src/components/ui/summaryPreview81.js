import {escapeHtml} from '../../utils/format.js';
const sections=[['Motivo de consulta','motivoConsulta'],['Síntomas y antecedentes mencionados','sintomas'],['Evaluación y observaciones','evaluacion'],['Indicaciones y plan mencionado','indicaciones'],['Seguimiento','seguimiento'],['Información pendiente de confirmar','pendientes']];
const norm=x=>String(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
const map=new Map(sections.flatMap(([label,id])=>[[norm(label),id],[norm(id),id]]));
for(const [label,id] of [['Motivo','motivoConsulta'],['Datos relatados','sintomas'],['Observaciones disponibles','evaluacion'],['Plan mencionado','indicaciones'],['Información no confirmada','pendientes']])map.set(norm(label),id);
const cleanup=x=>String(x||'').replace(/\*\*(.*?)\*\*/gs,'$1').trim();
export function summaryPreview81(raw){
 const text=String(raw||'').trim();if(!text)return '<p class="muted">Escribe o genera un borrador para ver su presentación.</p>';
 const obj={};let current=null;let parsed=null;
 try{parsed=JSON.parse(text.replace(/^```(?:json)?\s*/i,'').replace(/\s*```$/,'').trim());}catch{}
 if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed)){for(const [key,value] of Object.entries(parsed)){const id=map.get(norm(key));if(id)obj[id]=cleanup(value);}}
 else {for(const line of text.split(/\r?\n/)){
  const m=line.match(/^\s*(?:#{1,4}\s*)?(?:\*\*)?([^:\n]{3,75}?)(?:\*\*)?\s*:\s*(.*)$/);
  const id=m&&map.get(norm(m[1]));if(id){current=id;obj[id]=cleanup(m[2]);}else if(current){obj[current]=[obj[current],cleanup(line)].filter(Boolean).join('\n');}
  else if(line.trim())obj.evaluacion=[obj.evaluacion,cleanup(line)].filter(Boolean).join('\n');
 }}
 return sections.map(([label,id],i)=>`<section class="summary81-item"><h5>${i+1}. ${escapeHtml(label)}</h5><p>${escapeHtml(obj[id]||'No mencionado').replace(/\n/g,'<br>')}</p></section>`).join('');
}
