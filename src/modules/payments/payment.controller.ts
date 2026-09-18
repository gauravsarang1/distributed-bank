import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.ts';
import { PaymentService } from './payment.service.ts';
import { validateTransferInput } from './payment.validation.ts';
import { UnauthorizedError } from '../../utils/errors.ts';

export class PaymentController {
  static async transfer(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) throw new UnauthorizedError();
      const { senderAccountId, receiverIdentifier, amount } = validateTransferInput(req.body);

      const result = await PaymentService.transfer(
        req.userId,
        senderAccountId,
        receiverIdentifier,
        amount
      );

      res.status(200).json({
        success: true,
        message: `₹${amount.toFixed(2)} transferred successfully.`,
        payment: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getPayments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) throw new UnauthorizedError();
      const payments = await PaymentService.getPaymentsByUser(req.userId);
      res.status(200).json(payments);
    } catch (error) {
      next(error);
    }
  }

  static async getPaymentById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) throw new UnauthorizedError();
      const payment = await PaymentService.getPaymentById(req.params.id, req.userId);
      res.status(200).json(payment);
    } catch (error) {
      next(error);
    }
  }
}
