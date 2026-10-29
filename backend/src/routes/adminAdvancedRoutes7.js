import {Router} from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import ClinicSite from '../models/ClinicSite.js';
import Appointment from '../models/Appointment.js';
import ExamOrder from '../models/ExamOrder.js';
import {requireAuth} from '../middlewares/authMiddleware.js';
import {authorizeDb} from '../middlewares/authorizeDb.js';
const router=Router();
router.use(requireAuth,authorizeDb('admin'));
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const valid=id=>mongoose.isValidObjectId(id);
const clean=x=>String(x??'').trim();
const getPage=req=>Math.min(Math.max(Number.parseInt(req.query.page)||1,1),10000);
const limit=25;
router.get('/overview',wrap(async(_req,res)=>{
 const [users,sites,appointments,exams,pending]=await Promise.all([
  User.countDocuments({}),ClinicSite.countDocuments({}),Appointment.countDocuments({}),ExamOrder.countDocuments({}),
  Appointment.countDocuments({status:'reserved'})
 ]);
 const byRole=await User.aggregate([{$group:{_id:'$role',count:{$sum:1}}}]);
 res.json({users,sites,appointments,exams,pending,byRole});
}));
router.get('/appointments',wrap(async(req,res)=>{
 const filter={};if(['reserved','cancelled','completed'].includes(req.query.status))filter.status=req.query.status;
 const page=getPage(req);
 const [rows,total]=await Promise.all([Appointment.find(filter).sort({startsAt:-1}).skip((page-1)*limit).limit(limit).populate('patient','name email').populate('doctor','name specialty').populate('site','name address').lean(),Appointment.countDocuments(filter)]);
 res.json({items:rows.map(a=>({id:String(a._id),patient:a.patient?.name||'Paciente',doctor:a.doctor?.name||'Médico',site:a.site?.name||a.locationName,startsAt:a.startsAt,status:a.status,visitType:a.visitType,careType:a.careType,cancellation:a.cancellation?.status||'none'})),total,page,pages:Math.ceil(total/limit)});
}));
router.get('/exams',wrap(async(req,res)=>{
 const filter={};if(['requested','scheduled','received','reviewed'].includes(req.query.status))filter.status=req.query.status;
 const page=getPage(req);
 const [rows,total]=await Promise.all([ExamOrder.find(filter).sort({createdAt:-1}).skip((page-1)*limit).limit(limit).populate('patient','name').populate('doctor','name').lean(),ExamOrder.countDocuments(filter)]);
 res.json({items:rows.map(e=>({id:String(e._id),title:e.title,patient:e.patient?.name||'Paciente',doctor:e.doctor?.name||'Médico',status:e.status,requestedAt:e.requestedAt,patientInstructions:e.patientInstructions})),total,page,pages:Math.ceil(total/limit)});
}));
router.get('/users',wrap(async(req,res)=>{
 const filter={};if(['patient','doctor','admin'].includes(req.query.role))filter.role=req.query.role;
 if(req.query.q){const q=clean(req.query.q).slice(0,70).replace(/[.*+?^${}()|[\]\\]/g,'\\$&');filter.$or=[{name:{$regex:q,$options:'i'}},{email:{$regex:q,$options:'i'}}];}
 const page=getPage(req);
 const [rows,total]=await Promise.all([User.find(filter).select('name email role isActive createdAt').sort({createdAt:-1}).skip((page-1)*limit).limit(limit).lean(),User.countDocuments(filter)]);
 res.json({items:rows.map(u=>({id:String(u._id),name:u.name,email:u.email,role:u.role,isActive:u.isActive!==false,createdAt:u.createdAt})),total,page,pages:Math.ceil(total/limit)});
}));
router.patch('/users/:id/status',wrap(async(req,res)=>{
 if(!valid(req.params.id))return res.status(400).json({message:'Identificador inválido'});
 if(typeof req.body?.isActive!=='boolean')return res.status(400).json({message:'Indica isActive booleano'});
 if(String(req.user.id)===req.params.id)return res.status(409).json({message:'No puedes desactivar tu propia cuenta'});
 const user=await User.findById(req.params.id);if(!user)return res.status(404).json({message:'Usuario no encontrado'});
 if(user.role==='admin')return res.status(403).json({message:'Las cuentas administrativas requieren revisión separada'});
 user.isActive=req.body.isActive;await user.save();
 res.json({message:user.isActive?'Cuenta reactivada':'Cuenta desactivada',id:String(user._id),isActive:user.isActive});
}));
router.get('/services',wrap(async(_req,res)=>{
 const sites=await ClinicSite.find({}).select('name address isActive services').sort({name:1}).lean();
 res.json({items:sites.map(s=>({id:String(s._id),name:s.name,address:s.address,isActive:s.isActive,services:s.services||[]}))});
}));
router.put('/services/:siteId',wrap(async(req,res)=>{
 if(!valid(req.params.siteId))return res.status(400).json({message:'Sede inválida'});
 if(!Array.isArray(req.body?.services)||req.body.services.length>30)return res.status(400).json({message:'Se requiere lista de hasta 30 servicios'});
 const services=[...new Set(req.body.services.map(clean).filter(Boolean))];
 if(services.some(x=>x.length>90))return res.status(400).json({message:'Servicio demasiado largo'});
 const site=await ClinicSite.findByIdAndUpdate(req.params.siteId,{$set:{services}},{returnDocument:'after',runValidators:true});
 if(!site)return res.status(404).json({message:'Sede no encontrada'});
 res.json({message:'Servicios actualizados',site:{id:String(site._id),name:site.name,services:site.services}});
}));
router.get('/reports',wrap(async(req,res)=>{
 const end=new Date(),start=new Date(end.getTime()-30*86400000);
 const since=req.query.since?new Date(req.query.since):start;
 if(Number.isNaN(since.getTime())||since>end)return res.status(400).json({message:'Fecha inválida'});
 const [status,visits,exams,users]=await Promise.all([
  Appointment.aggregate([{$match:{createdAt:{$gte:since}}},{$group:{_id:'$status',count:{$sum:1}}}]),
  Appointment.aggregate([{$match:{createdAt:{$gte:since}}},{$group:{_id:'$visitType',count:{$sum:1}}}]),
  ExamOrder.aggregate([{$match:{createdAt:{$gte:since}}},{$group:{_id:'$status',count:{$sum:1}}}]),
  User.countDocuments({createdAt:{$gte:since}})
 ]);
 res.json({since,end,status,visits,exams,newUsers:users});
}));
export default router;
