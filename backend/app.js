import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './utils/config.js';
import { logger } from './utils/logger.js';
import { connectDB } from './utils/db.js';

// Routes Imports
import uploadRouter from './api/upload.js';
import executeRouter from './api/execute.js';
import downloadRouter from './api/download.js';
import historyRouter from './api/history.js';
import authRouter from './api/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

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

// 1. Mount API Controller Routers
app.use('/api/upload', uploadRouter);
app.use('/api/execute', executeRouter);
app.use('/api/download', downloadRouter);
app.use('/api/history', historyRouter);
app.use('/api/auth', authRouter);

// 2. UNIFIED FRONTEND STATIC SERVING (Precedence Moved Here)
const frontendDistPath = path.join(ROOT_DIR, 'frontend', 'dist');

// Serve pre-compiled static assets
app.use(express.static(frontendDistPath));

// Fallback catch-all to serve index.html for React Router compatibility
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/static')) {
    return next();
  }
  
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('NeuroSyn Backend Operational. Ingest Client assets to bind views.');
  }
});

// Initialize MongoDB safely on boot to prevent serverless lambda crashes
connectDB()
  .then(() => {
    logger.info('System', 'Persistent database routing initialized.');
  })
  .catch((err) => {
    logger.error('System', 'Failed to initialize database on boot.', err);
  });

// 3. Central 404 Route Catch-All (Precedence Moved Below Frontend Serving)
app.use((req, res, next) => {
  res.status(404).json({ error: 'Endpoint route not found on this server.' });
});

// 4. Global Error Handler
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