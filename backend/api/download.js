import express from 'express';
import path from 'path';
import fs from 'fs';
import { config } from '../utils/config.js';

const router = express.Router();

/**
 * Handles secure file downloads for compiled session artifacts.
 * GET /api/download?sessionId=...&filename=...
 */
router.get('/', (req, res) => {
  const { sessionId, filename } = req.query;

  if (!sessionId || !filename) {
    return res.status(400).json({ error: 'Missing required query parameters: sessionId and filename.' });
  }

  // Prevent directory traversal attacks by isolating the filename and joining securely
  const sanitizedFilename = path.basename(filename);
  const filePath = path.join(config.paths.outputs, sessionId, sanitizedFilename);

  // Validate the target path resides strictly inside the declared output workspace
  if (!filePath.startsWith(config.paths.outputs)) {
    return res.status(403).json({ error: 'Access denied: Target path resides outside the allowed workspace.' });
  }

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'The requested file could not be found on the server.' });
  }

  res.download(filePath, sanitizedFilename, (err) => {
    if (err) {
      console.error('[Download Stream Error]:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to stream the file payload to client.' });
      }
    }
  });
});

export default router;