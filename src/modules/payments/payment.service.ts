import Decimal from 'decimal.js';
import { prisma } from '../../lib/prisma.ts';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from '../../utils/errors.ts';

export class PaymentService {
  static async transfer(
    userId: string,
    senderAccountId: string,
    receiverIdentifier: string,
    amount: Decimal
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. Validate Sender Account
      const sender = await tx.account.findUnique({
        where: { id: senderAccountId },
      });

      if (!sender) {
        throw new NotFoundError('Sender account not found');
      }

      if (sender.userId !== userId) {
        throw new ForbiddenError('Unauthorized: Sender account does not belong to authenticated user');
      }

      if (sender.status !== 'ACTIVE') {
        throw new BadRequestError('Sender account is not active');
      }

      // 2. Locate and Validate Receiver Account (by UUID id or by accountNumber)
      let receiver = await tx.account.findUnique({
        where: { id: receiverIdentifier },
      });

      if (!receiver) {
        receiver = await tx.account.findUnique({
          where: { accountNumber: receiverIdentifier },
        });
      }

      if (!receiver) {
        throw new NotFoundError('Receiver account not found');
      }

      if (receiver.status !== 'ACTIVE') {
        throw new BadRequestError('Receiver account is not active');
      }

      // 3. Prevent Self Transfer (Invariant 4)
      if (sender.id === receiver.id) {
        throw new BadRequestError('Cannot transfer money to the same account');
      }

      // 4. Validate Sufficient Balance (Invariant 1)
      const senderBalance = new Decimal(sender.balance.toString());
      if (senderBalance.lt(amount)) {
        throw new BadRequestError('Insufficient balance');
      }

      // 5. Calculate new balances using Decimal arithmetic
      const newSenderBalance = senderBalance.minus(amount);
      const receiverBalance = new Decimal(receiver.balance.toString());
      const newReceiverBalance = receiverBalance.plus(amount);

      // 6. Deduct sender balance
      await tx.account.update({
        where: { id: sender.id },
        data: { balance: newSenderBalance.toFixed(2) },
      });

      // 7. Credit receiver balance
      await tx.account.update({
        where: { id: receiver.id },
        data: { balance: newReceiverBalance.toFixed(2) },
      });

      // 8. Create Payment record with SUCCESS status
      const payment = await tx.payment.create({
        data: {
          senderAccountId: sender.id,
          receiverAccountId: receiver.id,
          amount: amount.toFixed(2),
          status: 'SUCCESS',
        },
        include: {
          senderAccount: {
            select: {
              accountNumber: true,
              userId: true,
            },
          },
          receiverAccount: {
            select: {
              accountNumber: true,
              userId: true,
            },
          },
        },
      });

      return {
        id: payment.id,
        senderAccountId: payment.senderAccountId,
        senderAccountNumber: payment.senderAccount.accountNumber,
        receiverAccountId: payment.receiverAccountId,
        receiverAccountNumber: payment.receiverAccount.accountNumber,
        amount: new Decimal(payment.amount.toString()).toFixed(2),
        status: payment.status,
        createdAt: payment.createdAt,
        newSenderBalance: newSenderBalance.toFixed(2),
      };
    });
  }

  static async getPaymentsByUser(userId: string) {
    // Find all accounts owned by user
    const userAccounts = await prisma.account.findMany({
      where: { userId },
      select: { id: true, accountNumber: true },
    });

    const userAccountIds = userAccounts.map((a) => a.id);

    if (userAccountIds.length === 0) {
      return [];
    }

    const payments = await prisma.payment.findMany({
      where: {
        OR: [
          { senderAccountId: { in: userAccountIds } },
          { receiverAccountId: { in: userAccountIds } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        senderAccount: {
          select: {
            id: true,
            accountNumber: true,
            userId: true,
          },
        },
        receiverAccount: {
          select: {
            id: true,
            accountNumber: true,
            userId: true,
          },
        },
      },
    });

    return payments.map((p) => {
      const isSender = userAccountIds.includes(p.senderAccountId);
      const isReceiver = userAccountIds.includes(p.receiverAccountId);

      let type: 'SENT' | 'RECEIVED' | 'INTERNAL' = 'SENT';
      if (isSender && isReceiver) {
        type = 'INTERNAL';
      } else if (isReceiver) {
        type = 'RECEIVED';
      }

      return {
        id: p.id,
        senderAccountId: p.senderAccountId,
        senderAccountNumber: p.senderAccount.accountNumber,
        receiverAccountId: p.receiverAccountId,
        receiverAccountNumber: p.receiverAccount.accountNumber,
        amount: new Decimal(p.amount.toString()).toFixed(2),
        status: p.status,
        createdAt: p.createdAt,
        type,
      };
    });
  }

  static async getPaymentById(paymentId: string, userId: string) {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        senderAccount: { select: { accountNumber: true, userId: true } },
        receiverAccount: { select: { accountNumber: true, userId: true } },
      },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Check ownership
    const isOwner =
      payment.senderAccount.userId === userId ||
      payment.receiverAccount.userId === userId;

    if (!isOwner) {
      throw new ForbiddenError('Unauthorized access to payment record');
    }

    return {
      id: payment.id,
      senderAccountId: payment.senderAccountId,
      senderAccountNumber: payment.senderAccount.accountNumber,
      receiverAccountId: payment.receiverAccountId,
      receiverAccountNumber: payment.receiverAccount.accountNumber,
      amount: new Decimal(payment.amount.toString()).toFixed(2),
      status: payment.status,
      createdAt: payment.createdAt,
    };
  }
}
