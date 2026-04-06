import express from 'express';
import cors from 'cors';
import auditsRouter from './routes/audits.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/audits', auditsRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

export default app;
