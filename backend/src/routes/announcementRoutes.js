import {Router} from 'express';
import {requireAuth} from '../middlewares/authMiddleware.js';
import {authorizeDb} from '../middlewares/authorizeDb.js';
import {listAnnouncements,publishAnnouncement} from '../controllers/announcementController.js';
const router=Router();
router.get('/',requireAuth,authorizeDb('patient','doctor','admin'),listAnnouncements);
router.post('/',requireAuth,authorizeDb('admin'),publishAnnouncement);
export default router;
