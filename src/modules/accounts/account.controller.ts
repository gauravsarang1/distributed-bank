import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.ts';
import { AccountService } from './account.service.ts';
import { validateAmount } from './account.validation.ts';
import { UnauthorizedError } from '../../utils/errors.ts';

export class AccountController {
  static async getMyAccounts(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) throw new UnauthorizedError();
      const accounts = await AccountService.getAccountsByUser(req.userId);
      res.status(200).json(accounts);
    } catch (error) {
      next(error);
    }
  }

  static async getAccountById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) throw new UnauthorizedError();
      const account = await AccountService.getAccountById(req.params.id, req.userId);
      res.status(200).json(account);
    } catch (error) {
      next(error);
    }
  }

  static async deposit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) throw new UnauthorizedError();
      const amount = validateAmount(req.body.amount);
      const updated = await AccountService.deposit(req.params.id, req.userId, amount);
      res.status(200).json({
        success: true,
        message: `₹${amount.toFixed(2)} added to your account.`,
        account: updated,
      });
    } catch (error) {
      next(error);
    }
  }

  static async withdraw(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) throw new UnauthorizedError();
      const amount = validateAmount(req.body.amount);
      const updated = await AccountService.withdraw(req.params.id, req.userId, amount);
      res.status(200).json({
        success: true,
        message: `₹${amount.toFixed(2)} withdrawn from your account.`,
        account: updated,
      });
    } catch (error) {
      next(error);
    }
  }
}
