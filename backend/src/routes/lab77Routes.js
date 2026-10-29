import { Router } from 'express';
import mongoose from 'mongoose';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { authorizeDb } from '../middlewares/authorizeDb.js';
import LabBooking73 from '../models/LabBooking73.js';
import LabSlot73 from '../models/LabSlot73.js';
import ExamOrder from '../models/ExamOrder.js';
import ClinicSite from '../models/ClinicSite.js';

const router = Router();
router.use(requireAuth);
const patient = authorizeDb('patient');
const admin = authorizeDb('admin');
const idOf = req => String(req.user?.id || req.user?._id || '');
const safeId = v => mongoose.isValidObjectId(v);
const norm = v => String(v || '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const wrap = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
const CUTOFF_MS = 2 * 60 * 60 * 1000; // Prevent last-minute patient cancellations.

/** All booking + counter updates are transactional; requires MongoDB Atlas replica set. */
async function changeBooking(req,res,mode) {
  const bookingId = req.params.id;
  if (!safeId(bookingId)) return res.status(400).json({message:'Reserva inválida'});
  const isAdmin = req.user?.role === 'admin';
  const session = await mongoose.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      const booking = await LabBooking73.findOne({
        _id: bookingId, ...(isAdmin ? {} : {patient: idOf(req)})
      }).session(session);
      if (!booking) {const e = new Error('Reserva no encontrada');e.status=404;throw e;}
      if (booking.status !== 'scheduled') {const e=new Error('Solo pueden modificarse reservas programadas');e.status=409;throw e;}
      const old = await LabSlot73.findById(booking.slot).session(session);
      if (!old) {const e=new Error('Horario original no encontrado');e.status=409;throw e;}
      if (!isAdmin && old.startsAt.getTime()-Date.now()<CUTOFF_MS) {
        const e=new Error('Las cancelaciones o cambios deben solicitarse con al menos 2 horas de anticipación');e.status=409;throw e;
      }
      const order = await ExamOrder.findById(booking.order).session(session);
      if (!order) {const e=new Error('Orden médica no encontrada');e.status=409;throw e;}
      if (mode === 'reschedule') {
        if (!safeId(req.body?.slotId)) {const e=new Error('Selecciona un horario válido');e.status=400;throw e;}
        const next = await LabSlot73.findById(req.body.slotId).session(session);
        if (!next || !next.isActive || next.startsAt<=new Date() || next.booked>=next.capacity) {
          const e=new Error('El horario seleccionado no está disponible');e.status=409;throw e;
        }
        if (String(next._id)===String(old._id)) {const e=new Error('Selecciona un horario diferente');e.status=400;throw e;}
        if (norm(next.examType)!==norm(order.title)) {const e=new Error('El horario no corresponde a esta orden');e.status=409;throw e;}
        const site=await ClinicSite.findById(next.site).session(session);
        if (!site || site.isActive===false) {const e=new Error('Sede no disponible');e.status=409;throw e;}
        const seat=await LabSlot73.updateOne({_id:next._id,booked:{$lt:next.capacity},isActive:true},{$inc:{booked:1}},{session});
        if (!seat.modifiedCount) {const e=new Error('Se agotaron los cupos');e.status=409;throw e;}
        const previousId=booking.slot;
        booking.slot=next._id;
        booking.changeHistory.push({action:'rescheduled',by:idOf(req),previousSlot:previousId,newSlot:next._id,at:new Date()});
        await booking.save({session});
        await LabSlot73.updateOne({_id:old._id,booked:{$gt:0}},{$inc:{booked:-1}},{session});
        result={message:'Examen reprogramado correctamente',bookingId:String(booking._id)};
      } else {
        booking.status='cancelled';
        booking.cancelledAt=new Date();
        booking.changeHistory.push({action:'cancelled',by:idOf(req),previousSlot:old._id,at:new Date()});
        await booking.save({session});
        await LabSlot73.updateOne({_id:old._id,booked:{$gt:0}},{$inc:{booked:-1}},{session});
        await ExamOrder.updateOne({_id:order._id,status:'scheduled'},{$set:{status:'requested'}},{session});
        result={message:'Reserva cancelada. La orden médica sigue vigente para nueva programación.'};
      }
    });
    res.json(result);
  } catch (e) {
    if (e.status) return res.status(e.status).json({message:e.message});
    if (e.code===112 || e.errorLabels?.includes('TransientTransactionError'))return res.status(409).json({message:'La disponibilidad cambió. Actualiza los horarios e intenta nuevamente.'});
    throw e;
  } finally {await session.endSession();}
}
router.post('/my/bookings/:id/cancel',patient,wrap((req,res)=>changeBooking(req,res,'cancel')));
router.post('/my/bookings/:id/reschedule',patient,wrap((req,res)=>changeBooking(req,res,'reschedule')));
router.post('/admin/bookings/:id/cancel',admin,wrap((req,res)=>changeBooking(req,res,'cancel')));
router.post('/my/orders/:id/rebook',patient,wrap(async(req,res)=>{
 if(!safeId(req.params.id)||!safeId(req.body?.slotId))return res.status(400).json({message:'Orden u horario inválido'});
 const session=await mongoose.startSession();
 try{
  await session.withTransaction(async()=>{
   const order=await ExamOrder.findOne({_id:req.params.id,patient:idOf(req)}).session(session);
   if(!order||order.status!=='requested'){const e=new Error('Orden no disponible para programación');e.status=409;throw e;}
   const booking=await LabBooking73.findOne({order:order._id,patient:idOf(req)}).session(session);
   if(!booking||booking.status!=='cancelled'){const e=new Error('No existe una reserva cancelada para reactivar');e.status=409;throw e;}
   const slot=await LabSlot73.findById(req.body.slotId).session(session);
   if(!slot||!slot.isActive||slot.startsAt<=new Date()||slot.booked>=slot.capacity||norm(slot.examType)!==norm(order.title)){
    const e=new Error('El horario no está disponible para este examen');e.status=409;throw e;
   }
   const site=await ClinicSite.findById(slot.site).session(session);
   if(!site||site.isActive===false){const e=new Error('Sede no disponible');e.status=409;throw e;}
   const update=await LabSlot73.updateOne({_id:slot._id,booked:{$lt:slot.capacity},isActive:true},{$inc:{booked:1}},{session});
   if(!update.modifiedCount){const e=new Error('Sin cupos');e.status=409;throw e;}
   const oldId=booking.slot;
   booking.slot=slot._id;booking.status='scheduled';booking.cancelledAt=undefined;
   booking.changeHistory.push({action:'rescheduled',by:idOf(req),previousSlot:oldId,newSlot:slot._id,at:new Date()});
   await booking.save({session});
   await ExamOrder.updateOne({_id:order._id,status:'requested'},{$set:{status:'scheduled'}},{session});
  });
  res.json({message:'Examen programado nuevamente'});
 }catch(e){if(e.status)return res.status(e.status).json({message:e.message});throw e;}finally{await session.endSession();}
}));
router.get('/my/bookings/:id/history',patient,wrap(async(req,res)=>{
 if(!safeId(req.params.id))return res.status(400).json({message:'Reserva inválida'});
 const b=await LabBooking73.findOne({_id:req.params.id,patient:idOf(req)}).select('changeHistory status cancelledAt').lean();
 if(!b)return res.status(404).json({message:'Reserva no encontrada'});
 res.json({status:b.status,history:b.changeHistory||[],cancelledAt:b.cancelledAt||null});
}));
export default router;
