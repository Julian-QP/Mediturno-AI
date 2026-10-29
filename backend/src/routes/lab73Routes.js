import LabExamCatalog74 from '../models/LabExamCatalog74.js'; // mediturno-fase7-4
import {Router} from 'express';
import mongoose from 'mongoose';
import {requireAuth} from '../middlewares/authMiddleware.js';
import {authorizeDb} from '../middlewares/authorizeDb.js';
import ClinicSite from '../models/ClinicSite.js';
import ExamOrder from '../models/ExamOrder.js';
import LabSlot73 from '../models/LabSlot73.js';
import LabBooking73 from '../models/LabBooking73.js';
const router=Router();router.use(requireAuth);
const admin=authorizeDb('admin'),patient=authorizeDb('patient'),doctor=authorizeDb('doctor');
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const valid=id=>mongoose.isValidObjectId(id);
const who=req=>String(req.user?.id||req.user?._id||'');
const out=s=>({id:String(s._id),siteId:String(s.site?._id||s.site),siteName:s.site?.name||'',examType:s.examType,startsAt:s.startsAt,capacity:s.capacity,available:Math.max(0,s.capacity-s.booked),isActive:s.isActive});
const bookOut=b=>({id:String(b._id),orderId:String(b.order?._id||b.order),orderTitle:b.order?.title||'',patientName:b.patient?.name||'',patientId:String(b.patient?._id||b.patient),doctorId:String(b.doctor?._id||b.doctor),slotId:String(b.slot?._id||b.slot),siteName:b.slot?.site?.name||'',startsAt:b.slot?.startsAt||null,status:b.status,resultText:b.resultText||'',resultRecordedAt:b.resultRecordedAt,reviewedAt:b.reviewedAt});
const bookingPopulate=q=>q.populate('order','title patientInstructions').populate('patient','name').populate('doctor','name').populate({path:'slot',populate:{path:'site',select:'name'}});
router.get('/slots',wrap(async(req,res)=>{let filter={isActive:true,startsAt:{$gt:new Date()}};if(req.query.all==='1'&&req.user?.role==='admin')filter={};if(req.query.site){if(!valid(req.query.site))return res.status(400).json({message:'Sede inválida'});filter.site=req.query.site;}
const list=await LabSlot73.find(filter).populate('site','name').sort({startsAt:1}).limit(300).lean();res.json({items:list.map(out)}); }));
router.post('/admin/slots',admin,wrap(async(req,res)=>{const {site,examType,startsAt,capacity}=req.body||{};if(!valid(site)||!String(examType||'').trim()||String(examType).length>160||!Number.isInteger(capacity)||capacity<1||capacity>100)return res.status(400).json({message:'Sede, examen y capacidad (1–100) obligatorios'});
const catalogItem=await LabExamCatalog74.findOne({name:String(examType).trim(),isActive:true});
 if(!catalogItem)return res.status(400).json({message:'Selecciona un examen activo del catálogo administrado.'});
 const date=new Date(startsAt);if(!Number.isFinite(date.getTime())||date<=new Date())return res.status(400).json({message:'Fecha futura inválida'});const s=await ClinicSite.findById(site);if(!s||s.isActive===false)return res.status(409).json({message:'La sede no existe o está desactivada'});
const slot=await LabSlot73.create({site,examType:String(examType).trim(),startsAt:date,capacity});res.status(201).json({slot:out(slot)}); }));
router.patch('/admin/slots/:id',admin,wrap(async(req,res)=>{if(!valid(req.params.id))return res.status(400).json({message:'ID inválido'});const slot=await LabSlot73.findById(req.params.id);if(!slot)return res.status(404).json({message:'Horario no encontrado'});
if(req.body.capacity!==undefined){const n=req.body.capacity;if(!Number.isInteger(n)||n<slot.booked||n<1||n>100)return res.status(409).json({message:'Capacidad inválida o menor a las reservas existentes'});slot.capacity=n;}
if(req.body.isActive!==undefined){if(typeof req.body.isActive!=='boolean')return res.status(400).json({message:'Estado inválido'});if(!req.body.isActive&&slot.booked>0)return res.status(409).json({message:'No se puede desactivar un horario con reservas'});slot.isActive=req.body.isActive;}await slot.save();res.json({slot:out(slot)}); }));
router.get('/my/orders',patient,wrap(async(req,res)=>{const orders=await ExamOrder.find({patient:who(req)}).sort({createdAt:-1}).limit(200).lean();const bookings=await bookingPopulate(LabBooking73.find({patient:who(req)})).lean();const map=new Map(bookings.map(b=>[String(b.order._id),bookOut(b)]));res.json({items:orders.map(o=>({id:String(o._id),title:o.title,status:o.status,instructions:o.patientInstructions,booking:map.get(String(o._id))||null}))});}));
router.post('/my/orders/:id/book',patient,wrap(async(req,res)=>{const orderId=req.params.id,slotId=req.body?.slotId;if(!valid(orderId)||!valid(slotId))return res.status(400).json({message:'ID inválido'});
const order=await ExamOrder.findOne({_id:orderId,patient:who(req)});if(!order)return res.status(404).json({message:'Orden no encontrada'});if(order.status!=='requested')return res.status(409).json({message:'La orden no admite una reserva nueva'});
if(await LabBooking73.exists({order:orderId}))return res.status(409).json({message:'La orden ya tiene una reserva'});
const slot=await LabSlot73.findOneAndUpdate({_id:slotId,isActive:true,startsAt:{$gt:new Date()},$expr:{$lt:['$booked','$capacity']}},{$inc:{booked:1}},{returnDocument:'after'});
if(!slot)return res.status(409).json({message:'Horario no disponible o sin cupos'});
let created=false;
try {if(slot.examType.trim().toLocaleLowerCase('es')!==order.title.trim().toLocaleLowerCase('es'))return res.status(409).json({message:'El horario pertenece a otro tipo de examen'});
 const site=await ClinicSite.findById(slot.site);if(!site||site.isActive===false)return res.status(409).json({message:'Sede no disponible'});
 const booking=await LabBooking73.create({order:orderId,slot:slot._id,patient:order.patient,doctor:order.doctor});created=true;await ExamOrder.updateOne({_id:orderId,status:'requested'},{$set:{status:'scheduled'}});return res.status(201).json({message:'Examen programado',bookingId:String(booking._id)});
} catch(err){if(err.code===11000)return res.status(409).json({message:'Orden ya programada'});throw err;}finally{ // Keep the booked seat only if the booking was actually created.
 if(!created)await LabSlot73.updateOne({_id:slot._id,booked:{$gt:0}},{$inc:{booked:-1}});
}}));
router.get('/admin/bookings',admin,wrap(async(req,res)=>{const bookings=await bookingPopulate(LabBooking73.find().sort({createdAt:-1}).limit(300)).lean();res.json({items:bookings.map(bookOut)});}));
router.post('/admin/bookings/:id/result',admin,wrap(async(req,res)=>{if(!valid(req.params.id))return res.status(400).json({message:'ID inválido'});const resultText=String(req.body?.resultText||'').trim();if(!resultText||resultText.length>5000)return res.status(400).json({message:'Resultado obligatorio (máximo 5000 caracteres)'});
const booking=await LabBooking73.findById(req.params.id);if(!booking)return res.status(404).json({message:'Reserva no encontrada'});if(booking.status!=='scheduled')return res.status(409).json({message:'El resultado ya fue registrado'});
const slot=await LabSlot73.findById(booking.slot);if(!slot||slot.startsAt>new Date())return res.status(409).json({message:'Aún no ocurre el examen'});
booking.resultText=resultText;booking.resultRecordedAt=new Date();booking.status='result_received';await booking.save();await ExamOrder.updateOne({_id:booking.order},{$set:{status:'received'}});res.json({message:'Resultado registrado; pendiente de revisión médica'}); }));
router.get('/doctor/bookings',doctor,wrap(async(req,res)=>{const bookings=await bookingPopulate(LabBooking73.find({doctor:who(req)}).sort({createdAt:-1}).limit(300)).lean();res.json({items:bookings.map(bookOut)});}));
router.post('/doctor/bookings/:id/review',doctor,wrap(async(req,res)=>{if(!valid(req.params.id))return res.status(400).json({message:'ID inválido'});const booking=await LabBooking73.findOne({_id:req.params.id,doctor:who(req)});if(!booking)return res.status(404).json({message:'Reserva no encontrada'});if(booking.status!=='result_received')return res.status(409).json({message:'El resultado no está pendiente de revisión'});
booking.status='reviewed';booking.reviewedBy=who(req);booking.reviewedAt=new Date();await booking.save();await ExamOrder.updateOne({_id:booking.order},{$set:{status:'reviewed'}});res.json({message:'Resultado revisado'});}));
export default router;
