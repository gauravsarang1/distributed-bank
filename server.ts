import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import app from './src/app.ts';
import { runSeed } from './prisma/seed.ts';

process.env.DATABASE_URL = process.env.DATABASE_URL || 'file:./dev.db';

const PORT = 3000;

async function startServer() {
  // Ensure default seed data exists for testing
  try {
    await runSeed();
  } catch (err) {
    console.warn('Seed execution notice:', err);
  }

  // Vite middleware for frontend development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Distributed Bank server running on http://localhost:${PORT}`);
  });
}

startServer();
