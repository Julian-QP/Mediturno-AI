import mongoose from 'mongoose';
import Announcement from '../models/Announcement.js';
import AvailabilityBlock from '../models/AvailabilityBlock.js';
import ClinicSite from '../models/ClinicSite.js';
import Appointment from '../models/Appointment.js';
const validTime=s=>/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
const validDay=s=>/^\d{4}-\d\d-\d\d$/.test(s)&&!Number.isNaN(Date.parse(s+'T12:00:00-05:00'));
const serialize=a=>({id:String(a._id),title:a.title,message:a.message,category:a.category,audience:a.audience,validFrom:a.validFrom,validUntil:a.validUntil,siteName:a.site?.name||'',blockId:a.block?String(a.block):null,isActive:a.isActive});
export async function listAnnouncements(req,res){
 const role=req.currentUser.role;
 const now=new Date();
 const filter=role==='admin'?{}:{isActive:true,validFrom:{$lte:now},validUntil:{$gte:now},audience:{$in:['all',role==='patient'?'patients':'doctors']}};
 const items=await Announcement.find(filter).populate('site','name').sort({createdAt:-1}).limit(120);
 res.json(items.map(serialize));
}
export async function publishAnnouncement(req,res){
 const {title,message,category,audience='all',validFrom,validUntil,siteId,date,startHour='00:00',endHour='23:59'}=req.body||{};
 if(typeof title!=='string'||title.trim().length<5||title.length>120||typeof message!=='string'||message.trim().length<8||message.length>1200||!['informative','urgent','suspension'].includes(category)||!['all','patients','doctors'].includes(audience))return res.status(400).json({message:'Completa título, contenido, categoría y destinatarios válidos'});
 const from=new Date(validFrom),until=new Date(validUntil);
 if(!Number.isFinite(from.getTime())||!Number.isFinite(until.getTime())||from>=until)return res.status(400).json({message:'Indica un período de publicación válido'});
 let site=null,block=null,appointmentsToReview=0;
 if(category==='suspension'){
  if(audience!=='all')return res.status(400).json({message:'Las suspensiones deben comunicarse a médicos y pacientes'});
  if(!mongoose.isValidObjectId(siteId)||!validDay(date)||!validTime(startHour)||!validTime(endHour)||startHour>=endHour)return res.status(400).json({message:'Selecciona sede, fecha y horas de suspensión válidas'});
  site=await ClinicSite.findOne({_id:siteId,isActive:true});
  if(!site)return res.status(400).json({message:'La sede no existe o está desactivada'});
 }
 try{
  if(category==='suspension'){
   block=await AvailabilityBlock.create({site:site._id,date,startHour,endHour,reason:title.trim(),createdBy:req.currentUser._id});
   const dayStart=new Date(`${date}T00:00:00-05:00`);
   const dayEnd=new Date(dayStart.getTime()+86400000);
   appointmentsToReview=await Appointment.countDocuments({site:site._id,status:'reserved',startsAt:{$gte:dayStart,$lt:dayEnd}});
  }
  const newItem=await Announcement.create({title:title.trim(),message:message.trim(),category,audience,validFrom:from,validUntil:until,site:site?._id||null,block:block?._id||null,publishedBy:req.currentUser._id});
  res.status(201).json({message:'Comunicado publicado',announcement:serialize(newItem),appointmentsToReview});
 }catch(err){if(block)await AvailabilityBlock.findByIdAndDelete(block._id).catch(()=>{});throw err;}
}
