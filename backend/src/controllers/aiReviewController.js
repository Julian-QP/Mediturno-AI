import AiSummary from '../models/AiSummary.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
export async function reviewList(req,res){
 const doctor=await Doctor.findOne({user:req.currentUser._id});
 if(!doctor)return res.status(404).json({message:'Perfil médico no encontrado'});
 const rows=await AiSummary.find({doctor:doctor._id,transcript:{$exists:true,$ne:''}}).sort({updatedAt:-1}).limit(200).lean();
 const appts=await Appointment.find({_id:{$in:rows.map(x=>x.appointment)},doctor:doctor._id}).populate('patient','name').lean();
 const map=new Map(appts.map(x=>[String(x._id),x]));
 const items=rows.filter(x=>map.has(String(x.appointment))).filter(x=>map.get(String(x.appointment)).status==='completed').map(x=>{
  const a=map.get(String(x.appointment));
  return {id:String(x.appointment),patientName:a.patient?.name||'Paciente',startsAt:a.startsAt,status:x.status,hasTranscript:true,approvedAt:x.approvedAt||null};
 });
 res.json({items});
}
