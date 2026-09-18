import bcrypt from 'bcryptjs';
import { prisma } from '../../lib/prisma.ts';
import { signToken } from '../../utils/jwt.ts';
import { ConflictError, UnauthorizedError } from '../../utils/errors.ts';

const SALT_ROUNDS = 10;

async function generateAccountNumber(): Promise<string> {
  const count = await prisma.account.count();
  const nextNum = 100000001 + count;
  let accountNumber = nextNum.toString();

  // Guard against any collision
  let existing = await prisma.account.findUnique({ where: { accountNumber } });
  let offset = 1;
  while (existing) {
    accountNumber = (nextNum + offset).toString();
    existing = await prisma.account.findUnique({ where: { accountNumber } });
    offset++;
  }

  return accountNumber;
}

export class AuthService {
  static async register(name: string, email: string, password: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictError('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const accountNumber = await generateAccountNumber();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        accounts: {
          create: {
            accountNumber,
            balance: 0,
            currency: 'INR',
            status: 'ACTIVE',
          },
        },
      },
      include: {
        accounts: true,
      },
    });

    const token = signToken({ userId: user.id });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      account: user.accounts[0]
        ? {
            id: user.accounts[0].id,
            accountNumber: user.accounts[0].accountNumber,
            balance: user.accounts[0].balance.toString(),
            currency: user.accounts[0].currency,
            status: user.accounts[0].status,
          }
        : null,
      token,
    };
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = signToken({ userId: user.id });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      token,
    };
  }
}
