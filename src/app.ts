import express from 'express';
import authRoutes from './modules/auth/auth.routes.ts';
import userRoutes from './modules/users/user.routes.ts';
import accountRoutes from './modules/accounts/account.routes.ts';
import paymentRoutes from './modules/payments/payment.routes.ts';
import { errorHandler } from './middleware/error.middleware.ts';

const app = express();

app.use(express.json());

// Health route (Section 20)
app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// Domain API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/payments', paymentRoutes);

// Centralized error handler
app.use(errorHandler);

export default app;
