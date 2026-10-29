import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import {connectDB} from '../config/database.js';

// Ejecutar una sola vez. Nunca usa contraseñas predeterminadas.
const {INITIAL_ADMIN_NAME:name,INITIAL_ADMIN_EMAIL:email,INITIAL_ADMIN_PASSWORD:password}=process.env;
if(!name?.trim() || !/^\S+@\S+\.\S+$/.test(email||'') || !password || password.length<14){
 console.error('Configura INITIAL_ADMIN_NAME, INITIAL_ADMIN_EMAIL e INITIAL_ADMIN_PASSWORD (mín. 14 caracteres) en backend/.env');
 process.exit(1);
}
try{
 await connectDB();
 if(await User.exists({role:'admin'})) throw new Error('Ya existe un administrador. Script bloqueado para evitar crear otro.');
 if(await User.exists({email:email.toLowerCase().trim()})) throw new Error('El correo ya está registrado. Utiliza otro correo para el administrador.');
 await User.create({name:name.trim(),email:email.toLowerCase().trim(),passwordHash:await bcrypt.hash(password,12),role:'admin'});
 console.log('Administrador inicial creado. Retira las variables INITIAL_ADMIN_* del archivo .env.');
}catch(e){console.error('No se creó el administrador:',e.message);process.exitCode=1;}
finally{await mongoose.disconnect();}
