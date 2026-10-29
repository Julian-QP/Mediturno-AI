import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import AiSummary from '../models/AiSummary.js';
import {transcribeAudio,draftSummary,generatePdf,uploadPrivatePdf,readPrivatePdf} from '../services/aiServices.js';
const validId=id=>mongoose.isValidObjectId(id);
async function ownAppointment(req){
 if(!validId(req.params.id))return null;
 const doctor=await Doctor.findOne({user:req.currentUser._id});if(!doctor)return null;
 const appointment=await Appointment.findOne({_id:req.params.id,doctor:doctor._id});return appointment?{appointment,doctor}:null;
}
const view=s=>s?{status:s.status,transcript:s.transcript,draft:s.draft,approvedText:s.approvedText,approvedAt:s.approvedAt,pdfAvailable:!!s.pdfDriveFileId}:null;
export async function doctorSummary(req,res){const own=await ownAppointment(req);if(!own)return res.status(404).json({message:'Cita no encontrada'});res.json({summary:view(await AiSummary.findOne({appointment:own.appointment._id}))});}
export async function transcribe(req,res){
 const own=await ownAppointment(req);if(!own)return res.status(404).json({message:'Cita no encontrada'});
 if(own.appointment.status!=='reserved')return res.status(409).json({message:'Solo puedes iniciar una transcripción en una consulta activa'});
 if(req.body?.consent!=='true')return res.status(400).json({message:'Confirma el consentimiento informado antes de transcribir'});
 if(!req.file)return res.status(400).json({message:'Adjunta un audio de prueba'});
 const previous=await AiSummary.findOne({appointment:own.appointment._id});if(previous?.status==='approved')return res.status(409).json({message:'El resumen ya está aprobado'});
 const transcript=await transcribeAudio(req.file.buffer);if(!transcript)return res.status(422).json({message:'Audio sin texto reconocible'});
 const summary=await AiSummary.findOneAndUpdate({appointment:own.appointment._id},{$set:{doctor:own.doctor._id,patient:own.appointment.patient,consentAt:new Date(),transcript,draft:'',status:'transcribed'}},{upsert:true,new:true,setDefaultsOnInsert:true});
 res.json({summary:view(summary)});
}
export async function generateDraft(req,res){
 // mediturno-review-only: operaciones exclusivas de consultas finalizadas
 const check=await ownAppointment(req);if(!check)return res.status(404).json({message:'Cita no encontrada'});
 if(check.appointment.status!=='completed')return res.status(409).json({message:'Finaliza la consulta antes de revisar y aprobar el resumen'});

 const own=await ownAppointment(req);if(!own)return res.status(404).json({message:'Cita no encontrada'});
 const summary=await AiSummary.findOne({appointment:own.appointment._id});if(!summary?.transcript)return res.status(409).json({message:'Primero transcribe el audio'});
 if(summary.status==='approved')return res.status(409).json({message:'Documento ya aprobado'});
 const draft=await draftSummary(summary.transcript);summary.draft=draft;summary.status='draft';await summary.save();res.json({summary:view(summary)});
}
export async function saveDraft(req,res){
 // mediturno-review-only: operaciones exclusivas de consultas finalizadas
 const check=await ownAppointment(req);if(!check)return res.status(404).json({message:'Cita no encontrada'});
 if(check.appointment.status!=='completed')return res.status(409).json({message:'Finaliza la consulta antes de revisar y aprobar el resumen'});

 const own=await ownAppointment(req);if(!own)return res.status(404).json({message:'Cita no encontrada'});
 const draft=req.body?.draft;if(typeof draft!=='string'||draft.trim().length<15||draft.length>18000)return res.status(400).json({message:'Revisa el contenido (15 a 18000 caracteres)'});
 const summary=await AiSummary.findOne({appointment:own.appointment._id});if(!summary||summary.status==='approved')return res.status(409).json({message:'No existe un borrador editable'});
 summary.draft=draft.trim();summary.status='draft';await summary.save();res.json({summary:view(summary)});
}
export async function approve(req,res){
 // mediturno-review-only: operaciones exclusivas de consultas finalizadas
 const check=await ownAppointment(req);if(!check)return res.status(404).json({message:'Cita no encontrada'});
 if(check.appointment.status!=='completed')return res.status(409).json({message:'Finaliza la consulta antes de revisar y aprobar el resumen'});

 const own=await ownAppointment(req);if(!own)return res.status(404).json({message:'Cita no encontrada'});
 if(req.body?.confirmed!==true)return res.status(400).json({message:'Debes confirmar la revisión médica'});
 const summary=await AiSummary.findOne({appointment:own.appointment._id});if(!summary||summary.status!=='draft'||summary.draft.trim().length<15)return res.status(409).json({message:'Falta revisar el borrador'});
 const doctorUser=await own.doctor.populate('user','name');const patient=await mongoose.model('User').findById(own.appointment.patient).select('name');
 const approvedAt=new Date();const pdf=await generatePdf({text:summary.draft,doctor:doctorUser.user?.name||'Médico',patient:patient?.name||'Paciente',approvedAt});
 const name=`MediTurno_${own.appointment._id}_${Date.now()}.pdf`;const uploaded=await uploadPrivatePdf(pdf,name);
 summary.approvedText=summary.draft;summary.status='approved';summary.approvedAt=approvedAt;summary.approvedBy=req.currentUser._id;summary.pdfDriveFileId=uploaded.id;summary.pdfDriveName=name;await summary.save();
 res.json({summary:view(summary),message:'Resumen aprobado y PDF privado guardado en Drive'});
}
export async function patientSummary(req,res){if(!validId(req.params.id))return res.status(400).json({message:'Identificador inválido'});const appointment=await Appointment.findOne({_id:req.params.id,patient:req.currentUser._id});if(!appointment)return res.status(404).json({message:'Cita no encontrada'});const doc=await AiSummary.findOne({appointment:appointment._id,status:'approved'});res.json({summary:doc?{approvedAt:doc.approvedAt,approvedText:doc.approvedText,pdfAvailable:!!doc.pdfDriveFileId}:null});}
export async function pdfDownload(req,res){if(!validId(req.params.id))return res.status(400).json({message:'Identificador inválido'});const filter=req.currentUser.role==='doctor'?{doctor:(await Doctor.findOne({user:req.currentUser._id}))?._id}:{patient:req.currentUser._id};const appointment=await Appointment.findOne({_id:req.params.id,...filter});if(!appointment)return res.status(404).json({message:'Cita no encontrada'});const summary=await AiSummary.findOne({appointment:appointment._id,status:'approved'});if(!summary?.pdfDriveFileId)return res.status(404).json({message:'No existe un PDF aprobado'});const bytes=await readPrivatePdf(summary.pdfDriveFileId);res.set('Content-Type','application/pdf');res.set('Content-Disposition',`attachment; filename="MediTurno_${appointment._id}.pdf"`);res.send(bytes);}
