import {escapeHtml} from '../../utils/format.js';
const category={urgent:['Urgente','danger'],suspension:['Suspensión de atención','warning'],informative:['Informativo','success']};
export function noticeBanner(items=[]){
 const first=[...items].sort((a,b)=>({urgent:0,suspension:1,informative:2}[a.category]??3)-({urgent:0,suspension:1,informative:2}[b.category]??3))[0];
 if(!first)return `<section class="notice-banner" aria-label="Comunicados prioritarios"><div class="notice-kicker">📢 CENTRO DE COMUNICADOS</div><h2>Sin avisos activos</h2><p>Cuando la administración publique un comunicado vigente, aparecerá aquí.</p><a class="btn-outline" href="#announcements">Ver comunicados</a></section>`;
 const [label,cls]=category[first.category]||['Comunicado',''];
 return `<section class="notice-banner notice-${escapeHtml(first.category)}" aria-label="Comunicado prioritario"><div class="notice-kicker">📢 ${escapeHtml(label.toUpperCase())}</div><h2>${escapeHtml(first.title)}</h2><p>${escapeHtml(first.message)}</p>${first.siteName?`<p><strong>Sede:</strong> ${escapeHtml(first.siteName)}</p>`:''}<div class="row-gap"><span class="tag ${cls}">${escapeHtml(label)}</span>${items.length>1?`<span class="tag">${items.length} comunicados vigentes</span>`:''}</div><a class="btn-outline" href="#announcements">Consultar todos →</a></section>`;
}
