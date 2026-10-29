import lab77Routes from './routes/lab77Routes.js'; // mediturno-fase7-7
import adminShiftFix76Routes from './routes/adminShiftFix76Routes.js'; // mediturno-fase7-6
import lab74Routes from './routes/lab74Routes.js'; // mediturno-fase7-4
import lab73Routes from './routes/lab73Routes.js'; // mediturno-fase7-3
import adminSites72Routes from './routes/adminSites72Routes.js'; // mediturno-fase7-2
import adminAdvancedRoutes7 from './routes/adminAdvancedRoutes7.js'; // mediturno-fase7
import profileRoutes67 from './routes/profileRoutes67.js'; // mediturno-fase67
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import {rateLimit} from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import doctorRoutes from './routes/doctorRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import doctorPortalRoutes from './routes/doctorPortalRoutes.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import adminScheduleRoutes from './routes/adminScheduleRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import clinicalRoutes from './routes/clinicalRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import liveRoutes from './routes/liveRoutes.js';
import {errorHandler} from './middlewares/errorMiddleware.js';
const app=express();
app.use(helmet());
app.use(cors({origin:(origin,cb)=>!origin||[process.env.FRONTEND_URL,'http://localhost:5173','http://127.0.0.1:5173'].includes(origin)?cb(null,true):cb(new Error('Origen no permitido'))}));
app.use(express.json({limit:'20kb'}));
app.use('/api/auth',rateLimit({windowMs:15*60*1000,limit:40,standardHeaders:'draft-8',legacyHeaders:false}));
app.get('/api/health',(_req,res)=>res.json({status:'ok',app:'MediTurno'}));
app.use('/api/auth',authRoutes);
app.use('/api/profile',profileRoutes67);
app.use('/api/doctors',doctorRoutes);
app.use('/api/admin',adminRoutes);
app.use('/api/admin/advanced7',adminAdvancedRoutes7);
app.use('/api/lab73',lab73Routes);
app.use('/api/lab77',lab77Routes);
app.use('/api/lab74',lab74Routes);
app.use('/api/admin/sites72',adminSites72Routes);
app.use('/api/doctor-portal',doctorPortalRoutes);
app.use('/api/schedule',scheduleRoutes);
app.use('/api/admin/schedule/fix76',adminShiftFix76Routes);
app.use('/api/admin/schedule',adminScheduleRoutes);
app.use('/api/announcements',announcementRoutes);
app.use('/api/clinical',clinicalRoutes);
app.use('/api/live',liveRoutes);
app.use('/api/ai',aiRoutes);
app.use('/api/appointments',appointmentRoutes);
app.use('/api/consultations',consultationRoutes);
app.use((_req,res)=>res.status(404).json({message:'Ruta no encontrada'}));
app.use(errorHandler);
export default app;
