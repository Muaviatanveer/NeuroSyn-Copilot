import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../utils/config.js';
import { parseExcel } from '../parsers/excel.js';
import { parseCSV } from '../parsers/csv.js';
import { parsePDF } from '../parsers/pdf.js';
import { saveFileRecord } from '../services/dbService.js';

const router = express.Router();

// Initialize global memory cache safely for Serverless (Vercel) environments
if (!global.workspaceCache) {
  global.workspaceCache = {};
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const sessionId = req.body.sessionId || uuidv4();
    req.sessionId = sessionId;
    
    const sessionDir = path.join(config.paths.uploads, sessionId);
    if (!fs.existsSync(sessionDir)) {
      try {
        fs.mkdirSync(sessionDir, { recursive: true });
      } catch (err) {
        // Safe to ignore in stateless Serverless environments
      }
    }
    cb(null, sessionDir);
  },
  filename: (req, file, cb) => {
    const sanitizedName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    cb(null, `${Date.now()}-${sanitizedName}`);
  }
});

const upload = multer({ storage });

router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file was provided in the request payload.' });
  }

  const { sessionId } = req;
  const filePath = req.file.path;
  const extension = path.extname(req.file.originalname).toLowerCase();
  const userId = req.headers['x-user-id'] || 'default_user_workspace';

  try {
    let parsedData = null;

    if (extension === '.xlsx' || extension === '.xls') {
      parsedData = await parseExcel(filePath);
    } else if (extension === '.csv') {
      parsedData = await parseCSV(filePath);
    } else if (extension === '.pdf') {
      parsedData = await parsePDF(filePath);
    } else {
      const rawText = fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : 'Serverless environment lost file buffer.';
      parsedData = {
        type: 'text',
        characterCount: rawText.length,
        text: rawText.slice(0, 10000)
      };
    }

    const payloadToSave = {
      ...parsedData,
      meta: {
        fileName: req.file.originalname,
        fileSize: req.file.size
      }
    };

    // Store in global memory cache (survives Vercel container resets better than /tmp)
    global.workspaceCache[sessionId] = payloadToSave;

    // Optional Fallback to disk (for local development)
    const sessionDir = path.join(config.paths.uploads, sessionId);
    if (fs.existsSync(sessionDir)) {
      fs.writeFileSync(
        path.join(sessionDir, 'parsed.json'),
        JSON.stringify(payloadToSave, null, 2),
        'utf8'
      );
    }

    await saveFileRecord(userId, {
      sessionId,
      name: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size
    });

    res.status(200).json({
      success: true,
      sessionId,
      file: {
        name: req.file.originalname,
        filename: req.file.filename,
        size: req.file.size,
        path: filePath
      },
      parsed: parsedData
    });

  } catch (error) {
    console.error(`[Upload Service Failure]:`, error);
    res.status(500).json({
      error: 'Failed to process document',
      details: error.message
    });
  }
});

export default router;