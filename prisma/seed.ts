import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma.ts';

export async function runSeed() {
  const userACheck = await prisma.user.findUnique({
    where: { email: 'usera@test.com' },
  });

  if (!userACheck) {
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create User A with Account A (₹10,000)
    await prisma.user.create({
      data: {
        name: 'User A',
        email: 'usera@test.com',
        password: passwordHash,
        accounts: {
          create: {
            accountNumber: '100000001',
            balance: '10000.00',
            currency: 'INR',
            status: 'ACTIVE',
          },
        },
      },
    });
    console.log('Seeded User A with Account 100000001 and ₹10,000.00');
  }

  const userBCheck = await prisma.user.findUnique({
    where: { email: 'userb@test.com' },
  });

  if (!userBCheck) {
    const passwordHash = await bcrypt.hash('password123', 10);

    // Create User B with Account B (₹5,000)
    await prisma.user.create({
      data: {
        name: 'User B',
        email: 'userb@test.com',
        password: passwordHash,
        accounts: {
          create: {
            accountNumber: '100000002',
            balance: '5000.00',
            currency: 'INR',
            status: 'ACTIVE',
          },
        },
      },
    });
    console.log('Seeded User B with Account 100000002 and ₹5,000.00');
  }
}

// Allow direct execution: npx tsx prisma/seed.ts
if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  runSeed()
    .then(() => {
      console.log('Database seeded successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database seed failed:', err);
      process.exit(1);
    });
}
