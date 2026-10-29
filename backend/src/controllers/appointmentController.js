import mongoose from 'mongoose';
import Appointment from '../models/Appointment.js';
import Doctor from '../models/Doctor.js';
import ClinicSite from '../models/ClinicSite.js';
import {availability,dateInstant,validDay,validHour} from '../services/scheduling.js';
const serialize=a=>({id:String(a._id),doctorId:String(a.doctor?._id||a.doctor),doctorName:a.doctor?.user?.name||'Médico',specialty:a.doctor?.specialty||'',patientName:a.patient?.name||'',startsAt:a.startsAt,status:a.status,visitType:a.visitType||'initial',careType:a.careType||'general',reason:a.reason||'',siteId:a.site?._id?String(a.site._id):a.site?String(a.site):null,locationName:a.site?.name||a.locationName||'Sede por confirmar',siteAddress:a.site?.address||'',cancellation:a.cancellation||{status:'none'}});
export async function createAppointment(req,res){
 const {doctorId,siteId,date,time,visitType='initial',careType='general',reason=''}=req.body||{};
 if(!mongoose.isValidObjectId(doctorId)||!mongoose.isValidObjectId(siteId)||!validDay(date)||!validHour(time)||!/^\d{2}:(00|30)$/.test(time))return res.status(400).json({message:'Selecciona médico, sede, fecha y horario válidos'});
 if(!['initial','followup','single'].includes(visitType)||!['general','specialized','test','control'].includes(careType)||typeof reason!=='string'||reason.trim().length<5||reason.length>600)return res.status(400).json({message:'Indica el tipo y motivo de consulta (mínimo 5 caracteres)'});
 const selected=await availability(doctorId,siteId,date);
 if(!selected.slots.includes(time))return res.status(409).json({message:'Horario no disponible, fuera de turno, bloqueado u ocupado. Actualiza los horarios.'});
 const startsAt=dateInstant(date,time);
 const site=await ClinicSite.findById(siteId);if(!site?.isActive)return res.status(404).json({message:'Sede no disponible'});
 try{const appointment=await Appointment.create({doctor:doctorId,site:siteId,patient:req.user.id,startsAt,visitType,careType,reason:reason.trim(),locationName:site.name});res.status(201).json({appointment,message:'Cita reservada'});}
 catch(error){if(error.code===11000)return res.status(409).json({message:'Ese horario acaba de reservarse. Selecciona otro.'});throw error;}
}
export async function myAppointments(req,res){
 const items=await Appointment.find({patient:req.user.id}).populate({path:'doctor',populate:{path:'user',select:'name'}}).populate('site','name address').sort({startsAt:1});
 res.json(items.map(serialize));
}
export async function requestCancellation(req,res){
 if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:'Identificador inválido'});
 const reason=typeof req.body?.reason==='string'?req.body.reason.trim():'';
 if(reason.length<5||reason.length>500)return res.status(400).json({message:'Indica el motivo de cancelación (5 a 500 caracteres)'});
 const item=await Appointment.findOneAndUpdate({_id:req.params.id,patient:req.user.id,status:'reserved',startsAt:{$gt:new Date()},'cancellation.status':{$nin:['pending','approved']}},{$set:{cancellation:{status:'pending',reason,requestedAt:new Date()}}},{new:true});
 if(!item)return res.status(409).json({message:'La cita no admite una nueva solicitud de cancelación'});
 res.json({message:'Solicitud enviada. La cita sigue reservada hasta que el médico decida.'});
}
// Mantener la ruta /cancel como solicitud para que clientes antiguos no cancelen directamente.
export const cancelAppointment=requestCancellation;
