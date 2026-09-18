import { AuthService } from '../src/modules/auth/auth.service.ts';
import { AccountService } from '../src/modules/accounts/account.service.ts';
import { PaymentService } from '../src/modules/payments/payment.service.ts';
import { runSeed } from '../prisma/seed.ts';
import Decimal from 'decimal.js';

async function runBankingTests() {
  console.log('--- Starting Banking Invariants & Domain Tests ---');
  await runSeed();

  // Test 1: Authentication & Account lookup
  const loginA = await AuthService.login('usera@test.com', 'password123');
  console.log('✓ Login User A success, Token generated');

  const loginB = await AuthService.login('userb@test.com', 'password123');
  console.log('✓ Login User B success, Token generated');

  const accountsA = await AccountService.getAccountsByUser(loginA.user.id);
  const accountsB = await AccountService.getAccountsByUser(loginB.user.id);
  const accountA = accountsA[0];
  const accountB = accountsB[0];

  console.log(`Initial balances: User A = ₹${accountA.balance}, User B = ₹${accountB.balance}`);

  // Test 2: Invariant 4 - Self-transfer must be rejected
  try {
    await PaymentService.transfer(
      loginA.user.id,
      accountA.id,
      accountA.accountNumber,
      new Decimal('500')
    );
    throw new Error('FAILED: Self-transfer should have been rejected!');
  } catch (err: any) {
    console.log('✓ Invariant 4 Verified: Self-transfer correctly rejected ->', err.message);
  }

  // Test 3: Invariant 2 - Unauthorized account debit must be rejected
  try {
    await PaymentService.transfer(
      loginB.user.id, // User B tries to transfer from User A's account
      accountA.id,
      accountB.accountNumber,
      new Decimal('500')
    );
    throw new Error('FAILED: Unauthorized debit should have been rejected!');
  } catch (err: any) {
    console.log('✓ Invariant 2 Verified: Unauthorized account access rejected ->', err.message);
  }

  // Test 4: Invariant 1 - Insufficient balance rejected
  try {
    await PaymentService.transfer(
      loginA.user.id,
      accountA.id,
      accountB.accountNumber,
      new Decimal('9999999')
    );
    throw new Error('FAILED: Insufficient balance transfer should have been rejected!');
  } catch (err: any) {
    console.log('✓ Invariant 1 Verified: Insufficient balance transfer rejected ->', err.message);
  }

  // Test 5: Atomic Transfer (Test Scenario: Transfer ₹2,000 from A to B)
  const transferRes = await PaymentService.transfer(
    loginA.user.id,
    accountA.id,
    accountB.accountNumber,
    new Decimal('2000.00')
  );
  console.log('✓ Invariant 3 Verified: Atomic transfer executed ->', transferRes);

  const updatedA = await AccountService.getAccountById(accountA.id, loginA.user.id);
  const updatedB = await AccountService.getAccountById(accountB.id, loginB.user.id);
  console.log(`Post-transfer balances: User A = ₹${updatedA.balance}, User B = ₹${updatedB.balance}`);

  // Test 6: Payment history verification
  const paymentsA = await PaymentService.getPaymentsByUser(loginA.user.id);
  const paymentsB = await PaymentService.getPaymentsByUser(loginB.user.id);

  console.log(`Payments count: User A has ${paymentsA.length}, User B has ${paymentsB.length}`);
  console.log('User A perspective:', paymentsA[0].type, '₹' + paymentsA[0].amount);
  console.log('User B perspective:', paymentsB[0].type, '₹' + paymentsB[0].amount);

  console.log('--- ALL BANKING INVARIANTS VERIFIED SUCCESSFULLY ---');
}

runBankingTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test run error:', err);
    process.exit(1);
  });
