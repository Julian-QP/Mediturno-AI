import {Router} from 'express';
import mongoose from 'mongoose';
import {requireAuth} from '../middlewares/authMiddleware.js';
import {authorizeDb} from '../middlewares/authorizeDb.js';
import LabExamCatalog74 from '../models/LabExamCatalog74.js';
import LabSlot73 from '../models/LabSlot73.js';
import ExamOrder from '../models/ExamOrder.js';
const router=Router();
router.use(requireAuth);
const wrap=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
router.get('/catalog',wrap(async(req,res)=>{
 const all=req.query.all==='1'&&req.user?.role==='admin';
 const records=await LabExamCatalog74.find(all?{}:{isActive:true}).sort({name:1}).lean();
 res.json({items:records.map(e=>({id:String(e._id),name:e.name,description:e.description,preparation:e.preparation,durationMinutes:e.durationMinutes,isActive:e.isActive}))});
}));
router.post('/admin/catalog',authorizeDb('admin'),wrap(async(req,res)=>{
 const name=String(req.body?.name||'').trim(),description=String(req.body?.description||'').trim(),preparation=String(req.body?.preparation||'').trim(),durationMinutes=Number(req.body?.durationMinutes||30);
 if(name.length<3||name.length>160||description.length>700||preparation.length>1200||!Number.isInteger(durationMinutes)||durationMinutes<5||durationMinutes>480)return res.status(400).json({message:'Datos del examen inválidos'});
 if(await LabExamCatalog74.exists({name:new RegExp('^'+name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'$','i')}))return res.status(409).json({message:'Ya existe un examen con este nombre'});
 const record=await LabExamCatalog74.create({name,description,preparation,durationMinutes});
 res.status(201).json({item:{id:String(record._id),name:record.name}});
}));
router.patch('/admin/catalog/:id',authorizeDb('admin'),wrap(async(req,res)=>{
 if(!mongoose.isValidObjectId(req.params.id))return res.status(400).json({message:'Identificador inválido'});
 const record=await LabExamCatalog74.findById(req.params.id);if(!record)return res.status(404).json({message:'Examen no encontrado'});
 if(req.body.isActive!==undefined){
  if(typeof req.body.isActive!=='boolean')return res.status(400).json({message:'Estado inválido'});
  if(!req.body.isActive){const [orders,slots]=await Promise.all([ExamOrder.exists({title:record.name,status:{$in:['requested','scheduled']}}),LabSlot73.exists({examType:record.name,isActive:true,startsAt:{$gt:new Date()}})]);if(orders||slots)return res.status(409).json({message:'El examen tiene órdenes pendientes u horarios activos; desactívalos o complétalos antes'});}
  record.isActive=req.body.isActive;
 }
 if(req.body.description!==undefined){if(typeof req.body.description!=='string'||req.body.description.length>700)return res.status(400).json({message:'Descripción inválida'});record.description=req.body.description.trim();}
 if(req.body.preparation!==undefined){if(typeof req.body.preparation!=='string'||req.body.preparation.length>1200)return res.status(400).json({message:'Preparación inválida'});record.preparation=req.body.preparation.trim();}
 await record.save();res.json({message:'Catálogo actualizado'});
}));
export default router;
