import { Router } from 'express';
import { router as auth } from './auth.js';
import { router as wallet } from './wallet.js';
import { router as transfers } from './transfers.js';
import { router as catalog } from './catalog.js';
import { router as redemptions } from './redemptions.js';

export const router = Router();
router.use('/auth', auth);
router.use('/wallet', wallet);
router.use('/transfers', transfers);
router.use('/catalog', catalog);
router.use('/redemptions', redemptions);