import {Router} from 'express';
import {requireAuth} from '../middlewares/authMiddleware.js';
import {authorizeDb} from '../middlewares/authorizeDb.js';
import {createSite,allShifts,createShift,removeShift,removeManyShifts,listBlocks,createBlock} from '../controllers/scheduleController.js';
const router=Router();router.use(requireAuth,authorizeDb('admin'));
router.post('/sites',createSite);
router.get('/shifts',allShifts);router.post('/shifts',createShift);router.post('/shifts/bulk-remove',removeManyShifts);router.delete('/shifts/:id',removeShift);
router.get('/blocks',listBlocks);router.post('/blocks',createBlock);
export default router;
