import Decimal from 'decimal.js';
import { BadRequestError } from '../../utils/errors.ts';

export const validateTransferInput = (body: any) => {
  const { senderAccountId, receiverIdentifier, amount } = body || {};

  if (!senderAccountId || typeof senderAccountId !== 'string') {
    throw new BadRequestError('Sender account is required');
  }

  const targetReceiver = receiverIdentifier?.toString();
  if (!targetReceiver || typeof targetReceiver !== 'string' || targetReceiver.trim().length === 0) {
    throw new BadRequestError('Recipient account ID or Account Number is required');
  }

  if (amount === undefined || amount === null || amount === '') {
    throw new BadRequestError('Amount is required');
  }

  let decimalAmount: Decimal;
  try {
    decimalAmount = new Decimal(amount);
  } catch (err) {
    throw new BadRequestError('Invalid amount format');
  }

  if (decimalAmount.isNaN() || !decimalAmount.isFinite()) {
    throw new BadRequestError('Invalid amount value');
  }

  if (decimalAmount.lte(0)) {
    throw new BadRequestError('Amount must be greater than zero');
  }

  if (decimalAmount.decimalPlaces() > 2) {
    throw new BadRequestError('Amount cannot exceed 2 decimal places');
  }

  return {
    senderAccountId: senderAccountId.trim(),
    receiverIdentifier: targetReceiver.trim(),
    amount: decimalAmount,
  };
};
