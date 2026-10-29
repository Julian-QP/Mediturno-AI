import mongoose from 'mongoose';
import Doctor from '../models/Doctor.js';
import DoctorShift from '../models/DoctorShift.js';
import ClinicSite from '../models/ClinicSite.js';
import Appointment from '../models/Appointment.js';
import AvailabilityBlock from '../models/AvailabilityBlock.js';
export const validDay=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T12:00:00-05:00'))&&new Date(s+'T12:00:00-05:00').toISOString().slice(0,10)===s;
export const validHour=s=>typeof s==='string'&&/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(s);
export const minutes=s=>Number(s.slice(0,2))*60+Number(s.slice(3));
export const formatHour=m=>`${String(Math.floor(m/60)).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`;
export const weekday=date=>new Date(date+'T12:00:00-05:00').getUTCDay();
export const dateInstant=(date,time)=>new Date(`${date}T${time}:00-05:00`);
export const limaToday=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Lima',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
export async function availability(doctorId,siteId,date){
 if(!mongoose.isValidObjectId(doctorId)||!mongoose.isValidObjectId(siteId)||!validDay(date))throw Object.assign(new Error('Médico, sede o fecha inválidos'),{status:400});
 const [doctor,site]=await Promise.all([Doctor.findById(doctorId),ClinicSite.findById(siteId)]);
 if(!doctor||!site||!site.isActive)throw Object.assign(new Error('Médico o sede no disponible'),{status:404});
 const shifts=await DoctorShift.find({doctor:doctorId,site:siteId,weekday:weekday(date),isActive:true}).lean();
 const startOfDay=dateInstant(date,'00:00');const endOfDay=new Date(startOfDay.getTime()+86400000);
 const [existing,blocks]=await Promise.all([
  Appointment.find({doctor:doctorId,status:'reserved',startsAt:{$gte:startOfDay,$lt:endOfDay}}).select('startsAt').lean(),
  AvailabilityBlock.find({site:siteId,date,$or:[{doctor:null},{doctor:doctorId}]}).lean()
 ]);
 const occupied=new Set(existing.map(x=>x.startsAt.getTime()));const now=Date.now();const seen=new Set();const slots=[];
 for(const s of shifts){for(let m=minutes(s.startHour);m+30<=minutes(s.endHour);m+=30){
  const time=formatHour(m),instant=dateInstant(date,time);
  if(instant.getTime()<=now||occupied.has(instant.getTime())||blocks.some(b=>m<minutes(b.endHour)&&m+30>minutes(b.startHour)))continue;
  if(!seen.has(time)){seen.add(time);slots.push(time)}
 }}
 slots.sort();return {doctorId,siteId,date,slots};
}
