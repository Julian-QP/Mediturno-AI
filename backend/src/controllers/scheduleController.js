import mongoose from 'mongoose';
import ClinicSite from '../models/ClinicSite.js';
import Doctor from '../models/Doctor.js';
import DoctorShift from '../models/DoctorShift.js';
import AvailabilityBlock from '../models/AvailabilityBlock.js';
import Appointment from '../models/Appointment.js';
import {availability,minutes,validDay,validHour,dateInstant} from '../services/scheduling.js';
const oid=mongoose.isValidObjectId;
const fail=(res,msg)=>res.status(400).json({message:msg});
export async function listSites(_req,res){
 const sites=await ClinicSite.find({isActive:true}).sort({name:1}).lean();
 res.json(sites.map(s=>({id:String(s._id),name:s.name,address:s.address,district:s.district,latitude:s.latitude,longitude:s.longitude,services:s.services})));
}
export async function createSite(req,res){
 const {name,address,district='',latitude,longitude}=req.body||{};
 if(typeof name!=='string'||!name.trim()||name.length>100||typeof address!=='string'||!address.trim()||address.length>250)return fail(res,'Nombre y dirección de sede obligatorios');
 const geo={};if(latitude!==undefined&&latitude!==''){geo.latitude=Number(latitude);if(!Number.isFinite(geo.latitude)||Math.abs(geo.latitude)>90)return fail(res,'Latitud inválida')}
 if(longitude!==undefined&&longitude!==''){geo.longitude=Number(longitude);if(!Number.isFinite(geo.longitude)||Math.abs(geo.longitude)>180)return fail(res,'Longitud inválida')}
 const site=await ClinicSite.create({name:name.trim(),address:address.trim(),district:String(district).slice(0,100),...geo});
 res.status(201).json({message:'Sede creada',id:site.id});
}
export async function allShifts(_req,res){
 const shifts=await DoctorShift.find().populate({path:'doctor',populate:{path:'user',select:'name'}}).populate('site','name').sort({weekday:1,startHour:1});
 res.json(shifts.map(s=>({id:s.id,doctorId:String(s.doctor?._id||''),doctorName:s.doctor?.user?.name||'',siteId:String(s.site?._id||''),siteName:s.site?.name||'',weekday:s.weekday,startHour:s.startHour,endHour:s.endHour,isActive:s.isActive})));
}
export async function createShift(req,res){
 const {doctorId,siteId,weekday,startHour,endHour}=req.body||{};
 const wd=Number(weekday);
 if(!oid(doctorId)||!oid(siteId)||!Number.isInteger(wd)||wd<0||wd>6||!validHour(startHour)||!validHour(endHour)||minutes(endHour)-minutes(startHour)<30)return fail(res,'Doctor, sede, día y horas inválidos');
 const [doctor,site]=await Promise.all([Doctor.findById(doctorId),ClinicSite.findById(siteId)]);
 if(!doctor||!site?.isActive)return fail(res,'Médico o sede no disponibles');
 const overlap=await DoctorShift.exists({doctor:doctorId,weekday:wd,isActive:true,startHour:{$lt:endHour},endHour:{$gt:startHour}});
 if(overlap)return res.status(409).json({message:'Este médico ya tiene un turno que se solapa ese día, incluso en otra sede'});
 try{const shift=await DoctorShift.create({doctor:doctorId,site:siteId,weekday:wd,startHour,endHour});res.status(201).json({message:'Turno registrado',id:shift.id})}
 catch(err){if(err.code===11000)return res.status(409).json({message:'El turno ya existe'});throw err;}
}
// Desactivar turnos de forma lógica; nunca borrar físicamente turnos ni citas.
// La comprobación toma únicamente reservas futuras para el médico/sede y cada horario seleccionado.
function localParts(instant){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima',weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(instant);
 const values=Object.fromEntries(parts.map(p=>[p.type,p.value]));
 const week={Sun:0,Mon:1,Tue:2,Wed:3,Thu:4,Fri:5,Sat:6};
 return {weekday:week[values.weekday],time:values.hour+':'+values.minute};
}
async function protectedAppointments(shifts){
 const doctorIds=[...new Set(shifts.map(s=>String(s.doctor)))];
 const bookings=await Appointment.find({doctor:{$in:doctorIds},status:'reserved',startsAt:{$gt:new Date()}})
  .select('doctor site startsAt').lean();
 const conflicts=[];
 for(const shift of shifts){
  const conflicting=bookings.filter(a=>String(a.doctor)===String(shift.doctor)&&
   // Una cita heredada sin sede no se vincula inequívocamente: bloquear por precaución.
   (!a.site||String(a.site)===String(shift.site))&&
   (()=>{const p=localParts(a.startsAt);return p.weekday===shift.weekday && minutes(p.time)>=minutes(shift.startHour)&&minutes(p.time)<minutes(shift.endHour)})());
  if(conflicting.length)conflicts.push({id:String(shift._id),count:conflicting.length});
 }
 return conflicts;
}
export async function removeManyShifts(req,res){
 const ids=req.body?.ids;
 if(!Array.isArray(ids)||!ids.length||ids.length>100||ids.some(id=>!oid(id)))return fail(res,'Selecciona entre 1 y 100 turnos válidos');
 const unique=[...new Set(ids)];
 const shifts=await DoctorShift.find({_id:{$in:unique},isActive:true}).lean();
 if(shifts.length!==unique.length)return res.status(409).json({message:'Alguno de los turnos ya no está disponible. Recarga la lista.'});
 const conflicts=await protectedAppointments(shifts);
 if(conflicts.length)return res.status(409).json({message:`No se desactivaron los horarios: ${conflicts.length} turno(s) tienen citas futuras. Reprograma esas citas antes de eliminar los turnos.`,conflicts});
 const result=await DoctorShift.updateMany({_id:{$in:unique},isActive:true},{$set:{isActive:false}});
 return res.json({message:`${result.modifiedCount} turno(s) desactivado(s).`,count:result.modifiedCount});
}
export async function removeShift(req,res){
 req.body={ids:[req.params.id]};
 return removeManyShifts(req,res);
}
export async function listBlocks(_req,res){
 const blocks=await AvailabilityBlock.find().populate('site','name').sort({date:1}).limit(300);
 res.json(blocks.map(b=>({id:b.id,date:b.date,siteName:b.site?.name||'',startHour:b.startHour,endHour:b.endHour,reason:b.reason})));
}
export async function createBlock(req,res){
 const {siteId,date,startHour='00:00',endHour='23:59',reason}=req.body||{};
 if(!oid(siteId)||!validDay(date)||!validHour(startHour)||!validHour(endHour)||minutes(startHour)>=minutes(endHour)||typeof reason!=='string'||reason.trim().length<5||reason.length>250)return fail(res,'Sede, fecha, horario y motivo de bloqueo inválidos');
 if(!await ClinicSite.exists({_id:siteId,isActive:true}))return fail(res,'Sede inexistente');
 const block=await AvailabilityBlock.create({site:siteId,date,startHour,endHour,reason:reason.trim(),createdBy:req.currentUser._id});
 const start=dateInstant(date,'00:00'),end=new Date(start.getTime()+86400000);
 const affected=await Appointment.countDocuments({site:siteId,status:'reserved',startsAt:{$gte:start,$lt:end}});
 res.status(201).json({message:'Bloqueo creado; las citas existentes requieren revisión manual',id:block.id,appointmentsToReview:affected});
}
export async function getAvailability(req,res){
 const result=await availability(req.query.doctorId,req.query.siteId,req.query.date);res.json(result);
}
export async function publicShifts(req,res){
 if(!oid(req.query.doctorId))return fail(res,'Médico inválido');
 const shifts=await DoctorShift.find({doctor:req.query.doctorId,isActive:true}).populate('site','name address isActive').sort({weekday:1,startHour:1});
 res.json(shifts.filter(s=>s.site?.isActive).map(s=>({id:s.id,siteId:String(s.site._id),siteName:s.site.name,siteAddress:s.site.address,weekday:s.weekday,startHour:s.startHour,endHour:s.endHour})));
}
