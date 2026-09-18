import Decimal from 'decimal.js';
import { prisma } from '../../lib/prisma.ts';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../utils/errors.ts';

export class AccountService {
  static async getAccountsByUser(userId: string) {
    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });

    return accounts.map((acc) => ({
      id: acc.id,
      accountNumber: acc.accountNumber,
      balance: new Decimal(acc.balance.toString()).toFixed(2),
      currency: acc.currency,
      status: acc.status,
      createdAt: acc.createdAt,
    }));
  }

  static async getAccountById(accountId: string, userId: string) {
    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      throw new NotFoundError('Account not found');
    }

    if (account.userId !== userId) {
      throw new ForbiddenError('Unauthorized access to account');
    }

    return {
      id: account.id,
      accountNumber: account.accountNumber,
      balance: new Decimal(account.balance.toString()).toFixed(2),
      currency: account.currency,
      status: account.status,
      createdAt: account.createdAt,
    };
  }

  static async deposit(accountId: string, userId: string, amount: Decimal) {
    return await prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw new NotFoundError('Account not found');
      }

      if (account.userId !== userId) {
        throw new ForbiddenError('Unauthorized access to account');
      }

      if (account.status !== 'ACTIVE') {
        throw new BadRequestError('Account is not active');
      }

      const currentBalance = new Decimal(account.balance.toString());
      const newBalance = currentBalance.plus(amount);

      const updated = await tx.account.update({
        where: { id: accountId },
        data: { balance: newBalance.toFixed(2) },
      });

      return {
        id: updated.id,
        accountNumber: updated.accountNumber,
        balance: new Decimal(updated.balance.toString()).toFixed(2),
        currency: updated.currency,
        status: updated.status,
        updatedAt: updated.updatedAt,
      };
    });
  }

  static async withdraw(accountId: string, userId: string, amount: Decimal) {
    return await prisma.$transaction(async (tx) => {
      const account = await tx.account.findUnique({
        where: { id: accountId },
      });

      if (!account) {
        throw new NotFoundError('Account not found');
      }

      if (account.userId !== userId) {
        throw new ForbiddenError('Unauthorized access to account');
      }

      if (account.status !== 'ACTIVE') {
        throw new BadRequestError('Account is not active');
      }

      const currentBalance = new Decimal(account.balance.toString());

      if (currentBalance.lt(amount)) {
        throw new BadRequestError('Insufficient balance');
      }

      const newBalance = currentBalance.minus(amount);

      const updated = await tx.account.update({
        where: { id: accountId },
        data: { balance: newBalance.toFixed(2) },
      });

      return {
        id: updated.id,
        accountNumber: updated.accountNumber,
        balance: new Decimal(updated.balance.toString()).toFixed(2),
        currency: updated.currency,
        status: updated.status,
        updatedAt: updated.updatedAt,
      };
    });
  }
}
