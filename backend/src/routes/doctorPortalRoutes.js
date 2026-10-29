import {Router} from 'express';
import {requireAuth} from '../middlewares/authMiddleware.js';
import {authorizeDb} from '../middlewares/authorizeDb.js';
import {myDoctorAppointments,doctorStats,decideCancellation} from '../controllers/doctorPortalController.js';
const router=Router();router.use(requireAuth,authorizeDb('doctor'));
router.get('/appointments',myDoctorAppointments);
router.get('/stats',doctorStats);
router.patch('/appointments/:id/cancellation',decideCancellation);
export default router;
