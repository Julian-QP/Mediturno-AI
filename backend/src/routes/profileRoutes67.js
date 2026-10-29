import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router=Router();
router.use(requireAuth);
const safeUser=u=>({id:String(u._id),name:u.name,email:u.email,role:u.role,phone:u.phone||'',address:u.address||''});
const allowed=u=>u?.role==='doctor'||u?.role==='patient';
router.get('/',async(req,res,next)=>{try{
 const user=await User.findById(req.user.id);
 if(!user||!allowed(user))return res.status(403).json({message:'Perfil no disponible para este rol'});
 res.json({user:safeUser(user)});
}catch(e){next(e)}});
router.patch('/',async(req,res,next)=>{try{
 const u=await User.findById(req.user.id);
 if(!u||!allowed(u))return res.status(403).json({message:'No autorizado'});
 const {name,phone,address}=req.body||{};
 if(typeof name!=='string'||name.trim().length<2||name.length>100)return res.status(400).json({message:'Nombre inválido (2 a 100 caracteres)'});
 if(typeof phone!=='string'||phone.length>25||! /^[+\d()\s-]*$/.test(phone))return res.status(400).json({message:'Teléfono inválido'});
 if(typeof address!=='string'||address.length>220)return res.status(400).json({message:'Dirección demasiado larga'});
 u.name=name.trim();u.phone=phone.trim();u.address=address.trim();await u.save();
 res.json({user:safeUser(u)});
}catch(e){next(e)}});
router.post('/password',rateLimit({windowMs:15*60*1000,limit:8,standardHeaders:'draft-8',legacyHeaders:false}),async(req,res,next)=>{try{
 const {currentPassword,newPassword}=req.body||{};
 if(typeof currentPassword!=='string'||typeof newPassword!=='string'||newPassword.length<8||newPassword.length>128)return res.status(400).json({message:'Contraseña inválida. Mínimo 8 caracteres.'});
 const user=await User.findById(req.user.id).select('+passwordHash');
 if(!user||!allowed(user))return res.status(403).json({message:'No autorizado'});
 if(!await bcrypt.compare(currentPassword,user.passwordHash))return res.status(401).json({message:'La contraseña actual no es correcta'});
 user.passwordHash=await bcrypt.hash(newPassword,12);await user.save();
 res.json({message:'Contraseña actualizada'});
}catch(e){next(e)}});
export default router;
