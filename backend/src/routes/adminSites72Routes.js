import {Router} from 'express';
import mongoose from 'mongoose';
import ClinicSite from '../models/ClinicSite.js';
import Consultorio72 from '../models/Consultorio72.js';
import DoctorShift from '../models/DoctorShift.js';
import Appointment from '../models/Appointment.js';
import {requireAuth} from '../middlewares/authMiddleware.js';
import {authorizeDb} from '../middlewares/authorizeDb.js';

const router=Router();router.use(requireAuth,authorizeDb('admin'));
const safe=fn=>(req,res,next)=>Promise.resolve(fn(req,res,next)).catch(next);
const valid=id=>mongoose.isValidObjectId(id);
const clean=(v,max=250)=>String(v??'').trim().slice(0,max);
const idFilter=(param,res)=>{if(valid(param))return true;res.status(400).json({message:'ID inválido'});return false;};
const siteOut=s=>({id:String(s._id),name:s.name,address:s.address,district:s.district||'',latitude:s.latitude??null,longitude:s.longitude??null,isActive:s.isActive!==false,services:s.services||[]});
async function siteExists(id,res){if(!valid(id)){res.status(400).json({message:'ID de sede inválido'});return null;}const s=await ClinicSite.findById(id);if(!s)res.status(404).json({message:'Sede no encontrada'});return s;}
function sitePayload(req,res){const b=req.body||{};const result={};for(const f of ['name','address','district'])if(b[f]!==undefined)result[f]=clean(b[f],f==='address'?250:100);
 if(result.name!==undefined&&!result.name)return res.status(400).json({message:'Nombre obligatorio'});
 if(result.address!==undefined&&!result.address)return res.status(400).json({message:'Dirección obligatoria'});
 if(b.latitude!==undefined||b.longitude!==undefined){if(b.latitude==null||b.longitude==null||b.latitude===''||b.longitude===''){result.latitude=undefined;result.longitude=undefined;}else{const lat=Number(b.latitude),lon=Number(b.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lon)||Math.abs(lat)>90||Math.abs(lon)>180)return res.status(400).json({message:'Coordenadas inválidas'});result.latitude=lat;result.longitude=lon;}}
 return result;
}
router.get('/sites',safe(async(_req,res)=>{const sites=await ClinicSite.find().sort({name:1}).lean();res.json({items:sites.map(siteOut)});}));
router.post('/sites',safe(async(req,res)=>{const data=sitePayload(req,res);if(res.headersSent)return;if(!data.name||!data.address)return res.status(400).json({message:'Nombre y dirección requeridos'});const site=await ClinicSite.create(data);res.status(201).json({site:siteOut(site)});}));
router.patch('/sites/:id',safe(async(req,res)=>{const site=await siteExists(req.params.id,res);if(!site)return;const data=sitePayload(req,res);if(res.headersSent)return;
 if(req.body?.isActive!==undefined){if(typeof req.body.isActive!=='boolean')return res.status(400).json({message:'Estado inválido'});
  if(!req.body.isActive&&site.isActive!==false){const future=await Appointment.countDocuments({site:site._id,startsAt:{$gte:new Date()},status:{$in:['reserved','confirmed','pending']}});if(future)return res.status(409).json({message:`Hay ${future} citas futuras en la sede. Reprograma o cancela esas citas antes de desactivarla.`});}
  data.isActive=req.body.isActive;
 }
 Object.assign(site,data);await site.save();res.json({site:siteOut(site)});
}));
router.get('/rooms',safe(async(req,res)=>{const filter={};if(req.query.site){if(!valid(req.query.site))return res.status(400).json({message:'Sede inválida'});filter.site=req.query.site;}const rooms=await Consultorio72.find(filter).populate('doctor','name specialty').sort({name:1}).lean();res.json({items:rooms.map(r=>({id:String(r._id),site:String(r.site),name:r.name,floor:r.floor,isActive:r.isActive,doctorId:r.doctor?String(r.doctor._id):null,doctorName:r.doctor?.name||'',notes:r.notes}))});}));
router.post('/rooms',safe(async(req,res)=>{const site=await siteExists(req.body?.site,res);if(!site)return;const name=clean(req.body?.name,90);if(!name)return res.status(400).json({message:'Nombre de consultorio obligatorio'});const room=await Consultorio72.create({site:site._id,name,floor:clean(req.body?.floor,60),notes:clean(req.body?.notes,300)});res.status(201).json({id:String(room._id)});}));
router.patch('/rooms/:id',safe(async(req,res)=>{if(!idFilter(req.params.id,res))return;const room=await Consultorio72.findById(req.params.id);if(!room)return res.status(404).json({message:'Consultorio no encontrado'});const b=req.body||{};
 for(const f of ['name','floor','notes'])if(b[f]!==undefined)room[f]=clean(b[f],f==='notes'?300:f==='name'?90:60);
 if(!room.name)return res.status(400).json({message:'Nombre obligatorio'});
 if(b.isActive!==undefined){if(typeof b.isActive!=='boolean')return res.status(400).json({message:'Estado inválido'});if(!b.isActive&&room.doctor)return res.status(409).json({message:'Desasigna al médico antes de desactivar el consultorio'});room.isActive=b.isActive;}
 if(b.doctor!==undefined){if(b.doctor===null||b.doctor===''){room.doctor=null;}else{if(!valid(b.doctor))return res.status(400).json({message:'ID de médico inválido'});const shift=await DoctorShift.exists({doctor:b.doctor,site:room.site,isActive:true});if(!shift)return res.status(409).json({message:'El médico debe tener un horario activo en esta sede antes de asignarle el consultorio'});if(!room.isActive)return res.status(409).json({message:'Activa el consultorio antes de asignar un médico'});room.doctor=b.doctor;}}
 await room.save();res.json({id:String(room._id),message:'Consultorio actualizado'});
}));
router.delete('/rooms/:id',safe(async(req,res)=>{if(!idFilter(req.params.id,res))return;const room=await Consultorio72.findById(req.params.id);if(!room)return res.status(404).json({message:'Consultorio no encontrado'});if(room.doctor)return res.status(409).json({message:'Desasigna al médico antes de eliminar el consultorio'});await room.deleteOne();res.json({message:'Consultorio eliminado'});}));
router.get('/doctors',safe(async(req,res)=>{const filter={isActive:true};if(req.query.site){if(!valid(req.query.site))return res.status(400).json({message:'Sede inválida'});filter.site=req.query.site;}const shifts=await DoctorShift.find(filter).populate('doctor','name specialty').lean();const unique=new Map();for(const shift of shifts){const d=shift.doctor;if(d?._id)unique.set(String(d._id),{id:String(d._id),name:d.name||'Médico',specialty:d.specialty||''});}res.json({items:[...unique.values()].sort((a,b)=>a.name.localeCompare(b.name))});}));
export default router;
