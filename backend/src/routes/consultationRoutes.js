import { Router } from 'express';
import { consultationStatus } from '../controllers/consultationController.js';
const router = Router();
router.get('/status', consultationStatus);
export default router;
