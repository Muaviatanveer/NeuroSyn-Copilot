import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './utils/config.js';
import { logger } from './utils/logger.js';
import { connectDB } from './utils/db.js';

// Routes Imports
import uploadRouter from './api/upload.js';
import executeRouter from './api/execute.js';
import downloadRouter from './api/download.js';
import historyRouter from './api/history.js';
import authRouter from './api/auth.js'; // <-- Added authentication router import

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve outputs static assets directly (such as charts, presentations, and documents)
app.use('/static/outputs', express.static(config.paths.outputs));

// Mount Controller Routers
app.use('/api/upload', uploadRouter);
app.use('/api/execute', executeRouter);
app.use('/api/download', downloadRouter);
app.use('/api/history', historyRouter);
app.use('/api/auth', authRouter); // <-- Mounted authentication router endpoint

// Initialize MongoDB on boot
connectDB().then(() => {
  logger.info('System', 'Persistent database routing initialized.');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint route not found on this server.' });
});

app.use((err, req, res, next) => {
  logger.error('Express', 'Global Error Caught.', {
    message: err.message,
    stack: err.stack
  });

  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message || 'An unexpected error occurred.'
  });
});

app.listen(config.PORT, () => {
  logger.info('System', `NeuroSyn operational and listening on port: ${config.PORT}`);
});

export default app;