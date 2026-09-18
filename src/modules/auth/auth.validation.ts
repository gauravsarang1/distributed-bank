import { BadRequestError } from '../../utils/errors.ts';

export const validateRegisterInput = (body: any) => {
  const { name, email, password } = body || {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    throw new BadRequestError('Name must be at least 2 characters long');
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    throw new BadRequestError('Valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    throw new BadRequestError('Password must be at least 6 characters long');
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
  };
};

export const validateLoginInput = (body: any) => {
  const { email, password } = body || {};

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    throw new BadRequestError('Valid email address is required');
  }

  if (!password || typeof password !== 'string' || password.length === 0) {
    throw new BadRequestError('Password is required');
  }

  return {
    email: email.trim().toLowerCase(),
    password,
  };
};
