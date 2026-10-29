import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';

const validEmail = s => typeof s === 'string' && /^\S+@\S+\.\S+$/.test(s.trim()) && s.length <= 254;
export async function listPatients(_req,res){
  const patients = await User.find({role:'patient'}).select('name email isActive createdAt').sort({createdAt:-1}).limit(100);
  res.json(patients.map(u=>({id:u.id,name:u.name,email:u.email,isActive:u.isActive!==false,createdAt:u.createdAt})));
}
export async function listManagedDoctors(_req,res){
  const doctors=await Doctor.find().populate('user','name email role isActive').sort({createdAt:-1});
  res.json(doctors.filter(d=>d.user?.role==='doctor').map(d=>({id:d.id,userId:d.user.id,name:d.user.name,email:d.user.email,specialty:d.specialty,isActive:d.user.isActive!==false,workingDays:d.workingDays,startHour:d.startHour,endHour:d.endHour})));
}
export async function createDoctor(req,res,next){
  const {name,email,password,specialty}=req.body||{};
  if(typeof name!=='string'||!name.trim()||name.trim().length>100||!validEmail(email)||typeof specialty!=='string'||!specialty.trim()||specialty.length>100||typeof password!=='string'||password.length<12||password.length>128){
    return res.status(400).json({message:'Nombre, correo válido, especialidad y contraseña de 12 a 128 caracteres obligatorios'});
  }
  const normalizedEmail=email.trim().toLowerCase();
  if(await User.exists({email:normalizedEmail})) return res.status(409).json({message:'Correo ya registrado'});
  let user;
  try {
    user=await User.create({name:name.trim(),email:normalizedEmail,passwordHash:await bcrypt.hash(password,12),role:'doctor'});
    const doctor=await Doctor.create({user:user._id,specialty:specialty.trim()});
    return res.status(201).json({message:'Médico creado correctamente',doctor:{id:doctor.id,userId:user.id,name:user.name,email:user.email,specialty:doctor.specialty}});
  }catch(err){
    // La cuenta no debe quedar utilizable si falló la creación del perfil.
    if(user){try{await User.updateOne({_id:user._id},{$set:{isActive:false}});}catch{}}
    if(err.code===11000)return res.status(409).json({message:'El correo ya existe'});
    next(err);
  }
}
