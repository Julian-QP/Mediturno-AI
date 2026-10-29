import mongoose from 'mongoose';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import AiSummary from '../models/AiSummary.js';
import LiveRecording from '../models/LiveRecording.js';
const base = path.resolve(process.cwd(), 'uploads', 'mediturno-live-private');
const safe = s=>String(s||'').trim();
async function owned(req){
 if(!mongoose.isValidObjectId(req.params.id))return null;
 const doctor=await Doctor.findOne({user:req.currentUser._id});
 if(!doctor)return null;
 const appointment=await Appointment.findOne({_id:req.params.id,doctor:doctor._id});
 return appointment?{doctor,appointment}:null;
}
export async function consent(req,res){
 const own=await owned(req);if(!own)return res.status(404).json({message:'Cita no encontrada para este médico'});
 if(own.appointment.status!=='reserved')return res.status(409).json({message:'La cita debe estar activa para iniciar una grabación'}); // mediturno-live-active-only
 if(req.body?.doctorAccepted!==true||req.body?.patientAccepted!==true)return res.status(400).json({message:'Ambos consentimientos son obligatorios'});
 const ai=await AiSummary.findOne({appointment:own.appointment._id});
 if(ai?.status==='approved')return res.status(409).json({message:'El resumen ya fue aprobado y no puede sobrescribirse'});
 const record=await LiveRecording.findOneAndUpdate({appointment:own.appointment._id},{$set:{doctor:own.doctor._id,patient:own.appointment.patient,doctorConsent:true,patientConsent:true,consentRecordedAt:new Date(),status:'consented',transcript:''}}, {upsert:true,returnDocument:'after'});
 res.json({message:'Consentimiento registrado',consentRecordedAt:record.consentRecordedAt});
}
export async function streamingToken(req,res){
 const own=await owned(req);if(!own)return res.status(404).json({message:'Cita no encontrada'});
 const row=await LiveRecording.findOne({appointment:own.appointment._id,doctorConsent:true,patientConsent:true});
 if(!row)return res.status(409).json({message:'Registra ambos consentimientos primero'});
 if((await AiSummary.findOne({appointment:own.appointment._id}))?.status==='approved')return res.status(409).json({message:'El resumen ya está aprobado'});
 const key=process.env.ASSEMBLYAI_API_KEY;
 if(!key)return res.status(503).json({message:'AssemblyAI no está configurado'});
 const endpoint='https://streaming.assemblyai.com/v3/token?expires_in_seconds=60';
 const upstream=await fetch(endpoint,{headers:{Authorization:key},signal:AbortSignal.timeout(12000)});
 const data=await upstream.json().catch(()=>({}));
 if(!upstream.ok||!data.token)return res.status(502).json({message:'No se pudo iniciar streaming de AssemblyAI',detail:safe(data.error||data.message).slice(0,180)});
 await LiveRecording.updateOne({_id:row._id},{$set:{status:'recording',startedAt:new Date()}});
 res.json({token:data.token});
}
export async function saveRecording(req,res){
 const own=await owned(req);if(!own)return res.status(404).json({message:'Cita no encontrada'});
 const row=await LiveRecording.findOne({appointment:own.appointment._id,doctorConsent:true,patientConsent:true});
 if(!row||!['recording','consented'].includes(row.status))return res.status(409).json({message:'No hay sesión autorizada para finalizar'});
 if((await AiSummary.findOne({appointment:own.appointment._id}))?.status==='approved')return res.status(409).json({message:'El resumen ya está aprobado'});
 const transcript=safe(req.body?.transcript);
 if(transcript.length<5||transcript.length>45000)return res.status(400).json({message:'La transcripción está vacía o supera el máximo permitido. Conserva el audio antes de salir.'});
 if(!req.file?.buffer?.length)return res.status(400).json({message:'No se recibió el audio grabado'});
 const mime=req.file.mimetype;
 if(!['audio/webm','audio/ogg','audio/mp4','audio/wav'].includes(mime))return res.status(400).json({message:'Formato de audio no admitido'});
 await fs.mkdir(base,{recursive:true,mode:0o700});
 const ext=mime==='audio/mp4'?'.m4a':mime==='audio/wav'?'.wav':mime==='audio/ogg'?'.ogg':'.webm';
 const fileName=`${crypto.randomUUID()}${ext}`;
 await fs.writeFile(path.join(base,fileName),req.file.buffer,{flag:'wx',mode:0o600});
 const old=row.fileName;
 try {
  await AiSummary.findOneAndUpdate({appointment:own.appointment._id},{$set:{doctor:own.doctor._id,patient:own.appointment.patient,consentAt:row.consentRecordedAt,transcript,draft:'',status:'transcribed'}},{upsert:true,returnDocument:'after',setDefaultsOnInsert:true});
  row.status='completed';row.stoppedAt=new Date();row.transcript=transcript;row.mimeType=mime;row.fileName=fileName;row.audioBytes=req.file.size;await row.save();
  if(old&&old!==fileName)await fs.rm(path.join(base,path.basename(old)),{force:true}).catch(()=>{});
 } catch(err){await fs.rm(path.join(base,fileName),{force:true});throw err;}
 res.json({message:'Audio y transcripción guardados',status:'transcribed',transcriptLength:transcript.length});
}
export async function recordingInfo(req,res){const own=await owned(req);if(!own)return res.status(404).json({message:'Cita no encontrada'});const r=await LiveRecording.findOne({appointment:own.appointment._id});res.json({recording:r?{status:r.status,consentRecordedAt:r.consentRecordedAt,startedAt:r.startedAt,stoppedAt:r.stoppedAt,hasAudio:!!r.fileName,transcript:r.transcript}:null});}
export async function recordingAudio(req,res){const own=await owned(req);if(!own)return res.status(404).json({message:'Cita no encontrada'});const r=await LiveRecording.findOne({appointment:own.appointment._id,status:'completed'});if(!r?.fileName)return res.status(404).json({message:'Grabación no disponible'});res.set('Content-Type',r.mimeType||'audio/webm');res.set('Cache-Control','no-store');res.set('Content-Disposition','attachment; filename="consulta-ficticia'+path.extname(r.fileName)+'"');res.sendFile(path.basename(r.fileName),{root:base});}
