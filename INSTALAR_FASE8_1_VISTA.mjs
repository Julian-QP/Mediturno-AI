import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const root = process.cwd();
const marker = 'MEDITURNO_FASE81_VISTA_SIN_MARKDOWN';
const rels = ['frontend/src/pages/doctor/doctorV6.js','frontend/src/pages/doctor/reviews.js','frontend/src/main.js'];
const files = new Map();
for (const rel of rels){const p=path.join(root,rel);if(!fs.existsSync(p))throw Error('Falta '+rel+'. Confirma que instalaste Fase 6.2 y 5.4.');files.set(rel,fs.readFileSync(p,'utf8'));}
for(const rel of ['frontend/src/components/ui/cleanDraft81.js','frontend/src/components/ui/summaryPreview81.js','frontend/src/styles/summary81.css'])if(!fs.existsSync(path.join(root,rel)))throw Error('Primero copia frontend del ZIP; falta '+rel);
let review=files.get(rels[1]);let doctor=files.get(rels[0]);let main=files.get(rels[2]);
if(doctor.includes(marker) && review.includes(marker) && main.includes(marker)){console.log('✅ Ya está instalada esta corrección.');process.exit(0)}
function inject(src,content){return src.includes(marker)?src:content+src}
if(!doctor.includes(marker)){
 if(!doctor.includes('export function doctorReviewV6(') || !doctor.includes('h(summary?.draft||\'\')'))throw Error('La vista médica tiene una estructura diferente. No se modificó nada; adjunta frontend/src/pages/doctor/doctorV6.js.');
 doctor=inject(doctor,`import {cleanDraft81} from '../../components/ui/cleanDraft81.js'; // ${marker}\nimport {summaryPreview81} from '../../components/ui/summaryPreview81.js';\n`);
 doctor=doctor.replace("h(summary?.draft||'')", "h(cleanDraft81(summary?.draft||''))");
 doctor=doctor.replace("h(summary?.approvedText||'')", "h(cleanDraft81(summary?.approvedText||''))");
 const target='<div class="d6-review-buttons"><button class="btn-outline" data-ai-action="save"';
 if(!doctor.includes(target))throw Error('No se encontró el bloque del editor médico. Nada modificado.');
 doctor=doctor.replace(target,`<div class="summary81-preview"><div class="summary81-preview-title">Vista previa con formato</div><div id="summary81-content">\${summaryPreview81(summary?.draft||'')}</div></div>`+target);
}
if(!review.includes(marker)){
 if(!review.includes('export function reviewDialog(')|| !review.includes("esc2(summary?.draft||'')"))throw Error('La revisión antigua tiene estructura distinta. Nada modificado.');
 review=inject(review,`import {cleanDraft81} from '../../components/ui/cleanDraft81.js'; // ${marker}\nimport {summaryPreview81} from '../../components/ui/summaryPreview81.js';\n`);
 review=review.replace("esc2(summary?.draft||'')", "esc2(cleanDraft81(summary?.draft||''))");
 review=review.replace('esc2(summary.approvedText)', 'esc2(cleanDraft81(summary.approvedText))');
 const target='<div class="review-actions"><button class="btn-outline ai-action" data-ai-action="save"';
 if(!review.includes(target))throw Error('No se encontró el editor de revisión. Nada modificado.');
 review=review.replace(target,`<div class="summary81-preview"><div class="summary81-preview-title">Vista previa con formato</div><div id="summary81-content">\${summaryPreview81(summary?.draft||'')}</div></div>`+target);
}
if(!main.includes(marker)){
 const imp=`import {summaryPreview81 as _fase81VistaPrevia} from './components/ui/summaryPreview81.js'; // ${marker}\nimport './styles/summary81.css';\n`;
 main=imp+main+`\n// Actualiza vista previa cuando el médico edita (sin cambiar el sistema de guardado).\ndocument.addEventListener('input', e=>{if(e.target?.id!=='ai-draft')return;const container=document.getElementById('summary81-content');if(container)container.innerHTML=_fase81VistaPrevia(e.target.value);});\n`;
}
const outputs=[[rels[0],doctor],[rels[1],review],[rels[2],main]];
for(const [rel,content] of outputs){const file=path.join(root,rel);const tmp=file+'.fase81-check.mjs';try{fs.writeFileSync(tmp,content);const r=spawnSync(process.execPath,['--check',tmp],{encoding:'utf8'});if(r.status!==0)throw Error('Sintaxis inválida en '+rel+': '+r.stderr)}finally{fs.rmSync(tmp,{force:true})}}
for(const [rel,content] of outputs){const file=path.join(root,rel),previous=files.get(rel);if(previous===content)continue;const backup=file+'.bak-fase81-vista';if(fs.existsSync(backup))throw Error('Ya existe '+backup+'. Conservar respaldo y revisar antes de instalar de nuevo.')}
const applied=[];
try{for(const [rel,content] of outputs){const file=path.join(root,rel),previous=files.get(rel);if(previous===content)continue;fs.copyFileSync(file,file+'.bak-fase81-vista');fs.writeFileSync(file,content);applied.push(file)}console.log('✅ Vista médica corregida. Reinicia frontend y crea un nuevo borrador para probar.')}catch(e){for(const file of applied)fs.copyFileSync(file+'.bak-fase81-vista',file);throw e}
