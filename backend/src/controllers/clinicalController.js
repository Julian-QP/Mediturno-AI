import LabExamCatalog74 from '../models/LabExamCatalog74.js'; // mediturno-fase7-4
import mongoose from 'mongoose';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import ClinicalEncounter from '../models/ClinicalEncounter.js';
import TreatmentPlan from '../models/TreatmentPlan.js';
import ExamOrder from '../models/ExamOrder.js';
import {availability,dateInstant,validDay,validHour} from '../services/scheduling.js';
import ClinicSite from '../models/ClinicSite.js';
const valid=id=>mongoose.isValidObjectId(id);
async function ownDoctor(req){return Doctor.findOne({user:req.currentUser._id});}
async function ownedAppointment(req,res){
 if(!valid(req.params.id)){res.status(400).json({message:'Identificador inválido'});return null;}
 const doctor=await ownDoctor(req);
 if(!doctor){res.status(404).json({message:'Perfil médico inexistente'});return null;}
 const appointment=await Appointment.findOne({_id:req.params.id,doctor:doctor._id});
 if(!appointment){res.status(404).json({message:'Cita no encontrada para este médico'});return null;}
 return {doctor,appointment};
}
const serialPlan=p=>({id:String(p._id),title:p.title,status:p.status,patientId:String(p.patient),doctorId:String(p.doctor),appointmentIds:p.appointmentIds.map(String)});
const serialExam=e=>({id:String(e._id),appointmentId:String(e.appointment),title:e.title,patientInstructions:e.patientInstructions,status:e.status,requestedAt:e.requestedAt});
const serialEncounter=e=>e?{id:String(e._id),status:e.status,privateNotes:e.privateNotes,publicInstructions:e.publicInstructions,startedAt:e.startedAt,completedAt:e.completedAt}:null;
export async function doctorClinicalDetails(req,res){
 const data=await ownedAppointment(req,res);if(!data)return;
 const {appointment}=data;
 const [encounter,plans,exams]=await Promise.all([
  ClinicalEncounter.findOne({appointment:appointment._id}),
  TreatmentPlan.find({doctor:data.doctor._id,patient:appointment.patient}).sort({createdAt:-1}),
  ExamOrder.find({appointment:appointment._id}).sort({requestedAt:-1})
 ]);
 res.json({appointment:{id:String(appointment._id),doctorId:String(data.doctor._id),status:appointment.status,startsAt:appointment.startsAt,visitType:appointment.visitType,reason:appointment.reason},encounter:serialEncounter(encounter),plans:plans.map(serialPlan),exams:exams.map(serialExam)});
}
export async function startEncounter(req,res){
 const data=await ownedAppointment(req,res);if(!data)return;
 const {doctor,appointment}=data;
 if(appointment.status!=='reserved')return res.status(409).json({message:'Solo se pueden atender citas reservadas'});
 if(appointment.cancellation?.status==='pending')return res.status(409).json({message:'Resuelve la solicitud de cancelación antes de atender'});
 const encounter=await ClinicalEncounter.findOneAndUpdate({appointment:appointment._id},{$setOnInsert:{doctor:doctor._id,patient:appointment.patient,status:'in_progress',startedAt:new Date()}},{upsert:true,new:true,runValidators:true});
 if(encounter.status==='completed')return res.status(409).json({message:'La consulta ya está finalizada'});
 res.json({encounter:serialEncounter(encounter)});
}
export async function saveEncounter(req,res){
 const data=await ownedAppointment(req,res);if(!data)return;
 const {appointment}=data;
 const {privateNotes='',publicInstructions=''}=req.body||{};
 if(typeof privateNotes!=='string'||privateNotes.length>8000||typeof publicInstructions!=='string'||publicInstructions.length>1500)return res.status(400).json({message:'Notas o indicaciones inválidas'});
 const encounter=await ClinicalEncounter.findOneAndUpdate({appointment:appointment._id,status:'in_progress'},{$set:{privateNotes,publicInstructions}},{new:true,runValidators:true});
 if(!encounter)return res.status(409).json({message:'Primero inicia la consulta; las consultas finalizadas son de solo lectura'});
 res.json({encounter:serialEncounter(encounter)});
}
export async function finishEncounter(req,res){
 const data=await ownedAppointment(req,res);if(!data)return;
 const {appointment}=data;
 if(appointment.status!=='reserved')return res.status(409).json({message:'Esta cita no puede finalizarse'});
 const encounter=await ClinicalEncounter.findOneAndUpdate({appointment:appointment._id,status:'in_progress'},{$set:{status:'completed',completedAt:new Date()}},{new:true});
 if(!encounter)return res.status(409).json({message:'Primero inicia la consulta'});
 appointment.status='completed';await appointment.save();
 res.json({message:'Atención finalizada',encounter:serialEncounter(encounter)});
}
export async function createTreatment(req,res){
 const data=await ownedAppointment(req,res);if(!data)return;
 const title=req.body?.title;
 if(typeof title!=='string'||title.trim().length<3||title.length>120)return res.status(400).json({message:'Nombre de seguimiento inválido'});
 const {doctor,appointment}=data;
 if(appointment.status==='cancelled')return res.status(409).json({message:'No se puede crear un seguimiento desde una cita cancelada'});
 const plan=await TreatmentPlan.create({doctor:doctor._id,patient:appointment.patient,title:title.trim(),appointmentIds:[appointment._id]});
 res.status(201).json({plan:serialPlan(plan)});
}
export async function linkTreatment(req,res){
 const data=await ownedAppointment(req,res);if(!data)return;
 if(!valid(req.params.planId))return res.status(400).json({message:'Seguimiento inválido'});
 const plan=await TreatmentPlan.findOneAndUpdate({_id:req.params.planId,doctor:data.doctor._id,patient:data.appointment.patient,status:'active'},{$addToSet:{appointmentIds:data.appointment._id}},{new:true});
 if(!plan)return res.status(404).json({message:'Seguimiento no disponible'});
 res.json({plan:serialPlan(plan)});
}
export async function createExam(req,res){
 const data=await ownedAppointment(req,res);if(!data)return;
 const {title,patientInstructions=''}=req.body||{};
 if(typeof title!=='string'||title.trim().length<3||title.length>160||typeof patientInstructions!=='string'||patientInstructions.length>1200)return res.status(400).json({message:'Examen o indicaciones inválidos'});
 const catalogItem=await LabExamCatalog74.findOne({name:String(title).trim(),isActive:true});
 if(!catalogItem)return res.status(409).json({message:'El examen no está en el catálogo activo del administrador. Selecciona un examen de la lista.'});
 if(data.appointment.status==='cancelled')return res.status(409).json({message:'La cita está cancelada'});
 const exam=await ExamOrder.create({appointment:data.appointment._id,patient:data.appointment.patient,doctor:data.doctor._id,title:title.trim(),patientInstructions:patientInstructions.trim()});
 res.status(201).json({exam:serialExam(exam)});
}
export async function doctorClinicalList(req,res){
 const doctor=await ownDoctor(req);if(!doctor)return res.status(404).json({message:'Perfil médico no encontrado'});
 const [plans,exams]=await Promise.all([TreatmentPlan.find({doctor:doctor._id}).populate('patient','name').sort({createdAt:-1}),ExamOrder.find({doctor:doctor._id}).populate('patient','name').sort({requestedAt:-1})]);
 res.json({plans:plans.map(p=>({...serialPlan(p),patientName:p.patient?.name||'Paciente'})),exams:exams.map(e=>({...serialExam(e),patientName:e.patient?.name||'Paciente'}))});
}
export async function patientClinicalList(req,res){
 const patient=req.currentUser._id;
 const [plans,exams]=await Promise.all([TreatmentPlan.find({patient}).select('title status createdAt appointmentIds').sort({createdAt:-1}),ExamOrder.find({patient}).select('title status patientInstructions requestedAt').sort({requestedAt:-1})]);
 res.json({plans:plans.map(p=>({id:String(p._id),title:p.title,status:p.status,appointmentCount:p.appointmentIds.length})),exams:exams.map(e=>({id:String(e._id),title:e.title,status:e.status,patientInstructions:e.patientInstructions,requestedAt:e.requestedAt}))});
}

// Cambio/eliminación de solicitudes de prueba: únicamente durante la atención en curso.
export async function updateExam(req,res){
 const data=await ownedAppointment(req,res);if(!data)return;
 const encounter=await ClinicalEncounter.exists({appointment:data.appointment._id,status:'in_progress'});
 if(!encounter)return res.status(409).json({message:'Solo puedes corregir exámenes mientras la atención está abierta'});
 const {title,patientInstructions=''}=req.body||{};
 if(typeof title!=='string'||title.trim().length<3||title.length>160||typeof patientInstructions!=='string'||patientInstructions.length>1200)return res.status(400).json({message:'Datos del examen inválidos'});
 const exam=await ExamOrder.findOneAndUpdate({_id:req.params.examId,appointment:data.appointment._id,doctor:data.doctor._id,status:'requested'},{$set:{title:title.trim(),patientInstructions:patientInstructions.trim()}},{new:true,runValidators:true});
 if(!exam)return res.status(409).json({message:'Examen no editable o inexistente'});
 res.json({exam:serialExam(exam)});
}
export async function deleteExam(req,res){
 const data=await ownedAppointment(req,res);if(!data)return;
 if(!await ClinicalEncounter.exists({appointment:data.appointment._id,status:'in_progress'}))return res.status(409).json({message:'Solo puedes eliminar solicitudes durante la atención'});
 const exam=await ExamOrder.findOneAndDelete({_id:req.params.examId,appointment:data.appointment._id,doctor:data.doctor._id,status:'requested'});
 if(!exam)return res.status(409).json({message:'No puedes eliminar un examen ya procesado'});
 res.json({message:'Solicitud de examen eliminada'});
}
export async function deleteTreatment(req,res){
 const data=await ownedAppointment(req,res);if(!data)return;
 if(!await ClinicalEncounter.exists({appointment:data.appointment._id,status:'in_progress'}))return res.status(409).json({message:'La atención debe seguir abierta'});
 const plan=await TreatmentPlan.findOne({_id:req.params.planId,doctor:data.doctor._id,patient:data.appointment.patient,status:'active'});
 if(!plan||plan.appointmentIds.length!==1||String(plan.appointmentIds[0])!==String(data.appointment._id))return res.status(409).json({message:'Solo puedes eliminar seguimientos recién creados sin otras citas vinculadas'});
 await TreatmentPlan.deleteOne({_id:plan._id});res.json({message:'Seguimiento eliminado'});
}
// El médico programa un control, valida el mismo motor de turnos y enlaza el seguimiento.
export async function bookFollowup(req,res){
 const data=await ownedAppointment(req,res);if(!data)return;
 const {doctor,appointment}=data;
 const {planId,siteId,date,time,reason='Consulta de seguimiento'}=req.body||{};
 if(!valid(planId)||!valid(siteId)||!validDay(date)||!validHour(time)||typeof reason!=='string'||reason.trim().length<5||reason.length>600)return res.status(400).json({message:'Revisa los datos de la nueva cita'});
 const plan=await TreatmentPlan.findOne({_id:planId,doctor:doctor._id,patient:appointment.patient,status:'active',appointmentIds:appointment._id});
 if(!plan)return res.status(404).json({message:'Seguimiento inexistente o no vinculado a esta atención'});
 const site=await ClinicSite.findOne({_id:siteId,isActive:true});if(!site)return res.status(404).json({message:'Sede no disponible'});
 const slots=await availability(String(doctor._id),siteId,date);
 if(!slots.slots.includes(time))return res.status(409).json({message:'El horario ya no está disponible; selecciona otro'});
 const startsAt=dateInstant(date,time);
 try{
  const next=await Appointment.create({doctor:doctor._id,patient:appointment.patient,startsAt,status:'reserved',visitType:'followup',careType:'control',reason:reason.trim(),site:site._id,locationName:site.name});
  await TreatmentPlan.updateOne({_id:plan._id},{$addToSet:{appointmentIds:next._id}});
  res.status(201).json({message:'Próxima cita de seguimiento confirmada',appointment:{id:String(next._id),startsAt:next.startsAt,locationName:site.name,visitType:'followup'}});
 }catch(error){if(error.code===11000)return res.status(409).json({message:'Ese horario fue reservado por otra persona'});throw error;}
}
export async function patientCareDetails(req,res){
 const patient=req.currentUser._id;
 const appointments=await Appointment.find({patient}).populate({path:'doctor',populate:{path:'user',select:'name'}}).sort({startsAt:-1}).limit(150);
 const ids=appointments.map(a=>a._id);
 const [encounters,plans,exams]=await Promise.all([
  ClinicalEncounter.find({appointment:{$in:ids}}).select('appointment status startedAt completedAt'),
  TreatmentPlan.find({patient}).select('title status appointmentIds'),
  ExamOrder.find({patient}).select('appointment title status patientInstructions')
 ]);
 const em=new Map(encounters.map(e=>[String(e.appointment),e]));
 const records=appointments.map(a=>{
  const id=String(a._id),en=em.get(id);
  const linked=plans.filter(p=>p.appointmentIds.some(v=>String(v)===id));
  return {id,doctorName:a.doctor?.user?.name||'Médico',specialty:a.doctor?.specialty||'',startsAt:a.startsAt,status:a.status,visitType:a.visitType||'initial',careType:a.careType||'general',reason:a.reason||'',locationName:a.locationName||'Sede por confirmar',attentionStatus:en?.status||(a.status==='completed'?'completed':'pending'),completedAt:en?.completedAt||null,followups:linked.map(p=>({id:String(p._id),title:p.title,status:p.status})),exams:exams.filter(x=>String(x.appointment)===id).map(x=>({id:String(x._id),title:x.title,status:x.status,patientInstructions:x.patientInstructions}))};
 });
 res.json({records});
}
