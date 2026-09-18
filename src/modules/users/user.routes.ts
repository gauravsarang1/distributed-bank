import { Router } from 'express';
import { UserController } from './user.controller.ts';
import { authenticate } from '../../middleware/auth.middleware.ts';

const router = Router();

router.get('/me', authenticate, UserController.getMe);

export default router;
