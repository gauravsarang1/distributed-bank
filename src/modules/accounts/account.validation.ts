import Decimal from 'decimal.js';
import { BadRequestError } from '../../utils/errors.ts';

export const validateAmount = (amountInput: any): Decimal => {
  if (amountInput === undefined || amountInput === null || amountInput === '') {
    throw new BadRequestError('Amount is required');
  }

  let decimalAmount: Decimal;
  try {
    decimalAmount = new Decimal(amountInput);
  } catch (err) {
    throw new BadRequestError('Invalid amount format. Must be a valid positive number');
  }

  if (decimalAmount.isNaN() || !decimalAmount.isFinite()) {
    throw new BadRequestError('Invalid amount value');
  }

  if (decimalAmount.lte(0)) {
    throw new BadRequestError('Amount must be greater than zero');
  }

  // Ensure maximum 2 decimal places for banking precision
  if (decimalAmount.decimalPlaces() > 2) {
    throw new BadRequestError('Amount cannot have more than 2 decimal places');
  }

  return decimalAmount;
};
