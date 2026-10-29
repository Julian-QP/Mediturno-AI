import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
const publicUser = u => ({ id: u._id, name:u.name, email:u.email, role:u.role });
const sign = u => jwt.sign({ id: String(u._id), role:u.role },process.env.JWT_SECRET,{expiresIn:'8h'});
export async function register(req,res) {
  const {name,email,password} = req.body;
  if (typeof name !== 'string' || !name.trim() || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email) || typeof password !== 'string' || password.length < 8)
    return res.status(400).json({ message:'Nombre, correo válido y contraseña de al menos 8 caracteres requeridos' });
  if (await User.exists({ email: email.toLowerCase().trim() })) return res.status(409).json({ message:'Correo ya registrado' });
  const user = await User.create({ name:name.trim(), email:email.trim(), passwordHash:await bcrypt.hash(password,12), role:'patient' });
  res.status(201).json({ token:sign(user), user:publicUser(user) });
}
export async function login(req,res) {
  const {email,password} = req.body;
  if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({message:'Datos inválidos'});
  const user = await User.findOne({email:email.trim().toLowerCase()}).select('+passwordHash');
  if (!user || user.isActive === false || !(await bcrypt.compare(password,user.passwordHash))) return res.status(401).json({message:'Credenciales incorrectas'});
  res.json({ token:sign(user), user:publicUser(user) });
}
export async function me(req,res) {
  const user=await User.findById(req.user.id);
  if (!user) return res.status(404).json({message:'Usuario no encontrado'});
  res.json({user:publicUser(user)});
}
