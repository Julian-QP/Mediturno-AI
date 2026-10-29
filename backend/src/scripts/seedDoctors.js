import 'dotenv/config';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Doctor from '../models/Doctor.js';
import {connectDB} from '../config/database.js';
const demo=[{name:'Dra. Ana Torres',email:'ana.demo@mediturno.test',specialty:'Medicina general'},{name:'Dr. Luis Ramos',email:'luis.demo@mediturno.test',specialty:'Pediatría'},{name:'Dra. Rosa Flores',email:'rosa.demo@mediturno.test',specialty:'Dermatología'}];
try {
  await connectDB();
  for(const item of demo){
    let user=await User.findOne({email:item.email});
    if(!user) user=await User.create({name:item.name,email:item.email,passwordHash:await bcrypt.hash('DemoNoAcceder2026!',12),role:'doctor'});
    await Doctor.updateOne({user:user._id},{$setOnInsert:{user:user._id,specialty:item.specialty}}, {upsert:true});
  }
  console.log('Médicos ficticios cargados correctamente');
} catch(e){ console.error(e);process.exitCode=1; } finally {await mongoose.disconnect();}
