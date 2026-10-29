import {request} from './client.js';
const base=id=>`/ai/doctor/appointments/${encodeURIComponent(id)}`;
export const getAiSummary=id=>request(base(id));
export const makeAiDraft=id=>request(`${base(id)}/draft`,{method:'POST'});
export const saveAiDraft=(id,draft)=>request(`${base(id)}/draft`,{method:'PATCH',body:{draft}});
export const approveAi=(id)=>request(`${base(id)}/approve`,{method:'POST',body:{confirmed:true}});
export const getPatientSummary=id=>request(`/ai/patient/appointments/${encodeURIComponent(id)}`);
const apiUrl=(import.meta.env.VITE_API_URL||'http://localhost:3000/api').replace(/\/$/,'');
export async function sendAudio(id,file){const body=new FormData();body.append('audio',file);body.append('consent','true');const token=sessionStorage.getItem('token');const response=await fetch(`${apiUrl}${base(id)}/transcribe`,{method:'POST',headers:{Authorization:`Bearer ${token}`},body});const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.message||`Error HTTP ${response.status}`);return data;}
export async function downloadApprovedPdf(id){const token=sessionStorage.getItem('token');const response=await fetch(`${apiUrl}/ai/appointments/${encodeURIComponent(id)}/pdf`,{headers:{Authorization:`Bearer ${token}`}});if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.message||'No se pudo descargar el documento');}const blob=await response.blob();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`MediTurno_${id}.pdf`;a.click();setTimeout(()=>URL.revokeObjectURL(url),15000);}
