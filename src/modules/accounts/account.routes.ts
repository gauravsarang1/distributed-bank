import { Router } from 'express';
import { AccountController } from './account.controller.ts';
import { authenticate } from '../../middleware/auth.middleware.ts';

const router = Router();

router.use(authenticate);

router.get('/', AccountController.getMyAccounts);
router.get('/:id', AccountController.getAccountById);
router.post('/:id/deposit', AccountController.deposit);
router.post('/:id/withdraw', AccountController.withdraw);

export default router;
