import { Router } from 'express';
import { PaymentController } from './payment.controller.ts';
import { authenticate } from '../../middleware/auth.middleware.ts';

const router = Router();

router.use(authenticate);

router.post('/transfer', PaymentController.transfer);
router.get('/', PaymentController.getPayments);
router.get('/:id', PaymentController.getPaymentById);

export default router;
