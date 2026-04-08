import express from 'express';
import cors from 'cors';
import auditsRouter from './routes/audits.js';
import paymentsRouter from './routes/payments.js';
import exportsRouter from './routes/exports.js';
import authRouter from './routes/auth.js';
import shareRouter from './routes/share.js';
import timelineRouter from './routes/timeline.js';
import { handleWebhook } from './controllers/paymentController.js';

const app = express();

app.use(cors());

// Stripe webhook needs raw body — must be registered before express.json()
app.post('/api/payments/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// JSON parsing for all other routes
app.use(express.json());

app.use('/api/audits', auditsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/audits', exportsRouter);
app.use('/api/auth', authRouter);
app.use('/api', shareRouter);
app.use('/api/audits', timelineRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;
