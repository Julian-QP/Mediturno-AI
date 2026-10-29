import mongoose from 'mongoose';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
async function ownDoctor(userId){return Doctor.findOne({user:userId});}
const dto=a=>({id:String(a._id),patientName:a.patient?.name||'Paciente',startsAt:a.startsAt,status:a.status,visitType:a.visitType||'initial',careType:a.careType||'general',reason:a.reason||'',locationName:a.site?.name||a.locationName||'Sede por confirmar',siteAddress:a.site?.address||'',cancellation:a.cancellation||{status:'none'}});
export async function myDoctorAppointments(req,res){
 const doctor=await ownDoctor(req.currentUser._id);if(!doctor)return res.status(404).json({message:'Perfil médico no encontrado'});
 const items=await Appointment.find({doctor:doctor._id}).populate('patient','name').populate('site','name address').sort({startsAt:1}).limit(300);
 res.json(items.map(dto));
}
export async function doctorStats(req,res){
 const doctor=await ownDoctor(req.currentUser._id);if(!doctor)return res.status(404).json({message:'Perfil médico no encontrado'});
 const now=new Date();
 const [pending,cancellationRequests,completed]=await Promise.all([
  Appointment.countDocuments({doctor:doctor._id,status:'reserved',startsAt:{$gte:now}}),
  Appointment.countDocuments({doctor:doctor._id,status:'reserved','cancellation.status':'pending'}),
  Appointment.countDocuments({doctor:doctor._id,status:'completed'})
 ]);
 res.json({pending,cancellationRequests,completed});
}
export async function decideCancellation(req,res){
 if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:'Identificador inválido'});
 const {decision,note=''}=req.body;
 if(!['approved','rejected'].includes(decision)||typeof note!=='string'||note.length>500)return res.status(400).json({message:'Decisión o nota inválida'});
 const doctor=await ownDoctor(req.currentUser._id);if(!doctor)return res.status(404).json({message:'Perfil médico no encontrado'});
 const update={$set:{'cancellation.status':decision,'cancellation.reviewedAt':new Date(),'cancellation.reviewedBy':req.currentUser._id,'cancellation.reviewNote':note}};
 if(decision==='approved')update.$set.status='cancelled';
 const changed=await Appointment.findOneAndUpdate({_id:req.params.id,doctor:doctor._id,status:'reserved','cancellation.status':'pending'},update,{new:true});
 if(!changed)return res.status(409).json({message:'Solicitud no encontrada o ya revisada'});
 res.json({message:decision==='approved'?'Cancelación aprobada':'Cancelación rechazada',appointment:changed});
}
