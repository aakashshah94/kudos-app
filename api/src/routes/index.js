
import { router as feed } from './feed.js';
import { router as adminAllocations } from './admin.allocations.js';

export const router = Router();
router.use('/auth', auth);
router.use('/wallet', wallet);
router.use('/transfers', transfers);
router.use('/catalog', catalog);
router.use('/redemptions', redemptions);
router.use('/feed', feed);
router.use('/admin/allocations', adminAllocations);