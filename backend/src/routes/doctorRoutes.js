import { Router } from 'express';
import { listDoctors } from '../controllers/doctorController.js';
const router=Router();
router.get('/',listDoctors);
export default router;
