import {request} from './client.js';
export const getReviews=()=>request('/ai/doctor/reviews');
export async function loadRecordingAudio(id){
 const apiBase=(import.meta.env.VITE_API_URL||'http://localhost:3000/api').replace(/\/$/,'');
 const token=sessionStorage.getItem('token');
 const response=await fetch(`${apiBase}/live/appointments/${encodeURIComponent(id)}/audio`,{headers:{Authorization:`Bearer ${token}`}});
 if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.message||`Error ${response.status}`);}
 return URL.createObjectURL(await response.blob());
}
