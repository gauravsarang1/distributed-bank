import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service.ts';
import { validateRegisterInput, validateLoginInput } from './auth.validation.ts';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, email, password } = validateRegisterInput(req.body);
      const result = await AuthService.register(name, email, password);
      res.status(201).json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password } = validateLoginInput(req.body);
      const result = await AuthService.login(email, password);
      res.status(200).json({
        success: true,
        user: result.user,
        token: result.token,
      });
    } catch (error) {
      next(error);
    }
  }
}
