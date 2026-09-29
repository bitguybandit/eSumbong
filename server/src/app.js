import express from 'express';
import cors from 'cors';
import { config } from './config.js';

import authRoutes from './routes/auth.routes.js';
import categoriesRoutes from './routes/categories.routes.js';
import referralTargetsRoutes from './routes/referralTargets.routes.js';
import uploadsRoutes from './routes/uploads.routes.js';
import complaintsRoutes from './routes/complaints.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import officerRoutes from './routes/officer.routes.js';

const app = express();

app.use(
  cors({
    origin: config.clientUrl,
    credentials: true,
  })
);
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'eSumbong API' }));

app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/referral-targets', referralTargetsRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/officer', officerRoutes);

// 404 for unknown API routes
app.use('/api', (_req, res) => res.status(404).json({ error: 'Endpoint not found.' }));

// Central error handler
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[error]', err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error.' });
});

export default app;
