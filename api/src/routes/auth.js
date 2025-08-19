import { Router } from 'express';
import { register, login } from '../controllers/authController.js';

export const router = Router();
// NOTE: For pilot only; later replace with Azure AD
router.post('/register', register);
router.post('/login', login);