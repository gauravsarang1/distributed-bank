import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware.ts';
import { UserService } from './user.service.ts';
import { UnauthorizedError } from '../../utils/errors.ts';

export class UserController {
  static async getMe(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new UnauthorizedError();
      }

      const user = await UserService.getCurrentUser(req.userId);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
}
