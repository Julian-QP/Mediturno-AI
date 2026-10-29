import {Router} from 'express';
import mongoose from 'mongoose';
import {requireAuth} from '../middlewares/authMiddleware.js';
import {authorizeDb} from '../middlewares/authorizeDb.js';
import DoctorShift from '../models/DoctorShift.js';
import Doctor from '../models/Doctor.js';
import ClinicSite from '../models/ClinicSite.js';
import Appointment from '../models/Appointment.js';

const router=Router();
router.use(requireAuth,authorizeDb('admin'));
const validId=mongoose.isValidObjectId;
const timeOK=value=>typeof value==='string'&&/^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const minute=value=>Number(value.slice(0,2))*60+Number(value.slice(3,5));
const localParts=date=>{
 const p=Object.fromEntries(new Intl.DateTimeFormat('en-US',{timeZone:'America/Lima',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date).map(x=>[x.type,x.value]));
 return {day:{Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6}[p.weekday],at:`${p.hour}:${p.minute}`};
};
const fail=(res,status,message)=>res.status(status).json({message});
async function activeFutureBookings(shift){
 const bookings=await Appointment.find({doctor:shift.doctor,status:'reserved',startsAt:{$gt:new Date()}}).select('site startsAt').lean();
 return bookings.some(b=>{
  const p=localParts(b.startsAt);
  return (!b.site||String(b.site)===String(shift.site))&&p.day===shift.weekday&&minute(p.at)>=minute(shift.startHour)&&minute(p.at)<minute(shift.endHour);
 });
}
async function overlap(doctor,weekday,startHour,endHour,excludeId){
 const query={doctor,weekday,isActive:true,startHour:{$lt:endHour},endHour:{$gt:startHour}};
 if(excludeId)query._id={$ne:excludeId};
 return DoctorShift.exists(query);
}
router.post('/batch',async(req,res,next)=>{
 try{
  const {doctorId,siteId,startHour,endHour,weekdays}=req.body||{};
  if(!validId(doctorId)||!validId(siteId)||!timeOK(startHour)||!timeOK(endHour)||minute(endHour)-minute(startHour)<30||!Array.isArray(weekdays)||weekdays.length<1||weekdays.length>7)return fail(res,400,'Médico, sede, días u horas inválidos');
  const days=[...new Set(weekdays.map(Number))];
  if(days.some(d=>!Number.isInteger(d)||d<0||d>6))return fail(res,400,'Días inválidos');
  const [doctor,site]=await Promise.all([Doctor.findById(doctorId),ClinicSite.findById(siteId)]);
  if(!doctor||!site?.isActive)return fail(res,400,'Médico o sede no disponibles');
  for(const day of days){if(await overlap(doctorId,day,startHour,endHour))return fail(res,409,`El médico tiene un horario que se solapa el día ${day}. No se guardó ningún turno.`);}
  const created=[];
  try{
   for(const weekday of days){created.push(await DoctorShift.create({doctor:doctorId,site:siteId,weekday,startHour,endHour}));}
  }catch(error){if(created.length)await DoctorShift.deleteMany({_id:{$in:created.map(s=>s._id)}});if(error.code===11000)return fail(res,409,'Horario duplicado. No se registraron los nuevos turnos.');throw error;}
  return res.status(201).json({message:`${created.length} turno(s) creados`,count:created.length});
 }catch(error){next(error);}
});
router.patch('/:id',async(req,res,next)=>{
 try{
  if(!validId(req.params.id))return fail(res,400,'Turno inválido');
  const current=await DoctorShift.findOne({_id:req.params.id,isActive:true});
  if(!current)return fail(res,404,'Horario inexistente o inactivo');
  const {siteId,weekday,startHour,endHour}=req.body||{};
  const day=Number(weekday);
  if(!validId(siteId)||!Number.isInteger(day)||day<0||day>6||!timeOK(startHour)||!timeOK(endHour)||minute(endHour)-minute(startHour)<30)return fail(res,400,'Sede, día u horas inválidos');
  if(!await ClinicSite.exists({_id:siteId,isActive:true}))return fail(res,400,'Sede inactiva o inexistente');
  const changed=String(current.site)!==siteId||current.weekday!==day||current.startHour!==startHour||current.endHour!==endHour;
  if(!changed)return res.json({message:'Sin cambios'});
  if(await activeFutureBookings(current))return fail(res,409,'Este turno tiene citas futuras activas. Reprograma las citas antes de modificar el horario.');
  if(await overlap(current.doctor,day,startHour,endHour,current._id))return fail(res,409,'El nuevo horario se solapa con otro turno activo del médico.');
  try{
   current.site=siteId;current.weekday=day;current.startHour=startHour;current.endHour=endHour;
   await current.save();
  }catch(error){if(error.code===11000)return fail(res,409,'Ya existe un turno igual.');throw error;}
  return res.json({message:'Horario actualizado correctamente',id:String(current._id)});
 }catch(error){next(error);}
});
export default router;
