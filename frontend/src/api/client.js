const API = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
export async function request(path,{method='GET',body}={}){
  const token=sessionStorage.getItem('token');
  let response;
  try {response=await fetch(API+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},...(body!==undefined?{body:JSON.stringify(body)}:{})});}
  catch {throw new Error('No se pudo conectar con el backend. Comprueba que Node.js está funcionando y que la URL/CORS es correcta.');}
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw new Error(data.message||`Error HTTP ${response.status}`);
  return data;
}
