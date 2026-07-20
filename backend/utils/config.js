import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serverless-aware path resolver. If running on Vercel, write to the allowed /tmp directory.
const isVercel = process.env.VERCEL === '1';

const ROOT_DIR = isVercel ? '/tmp' : path.resolve(__dirname, '..');
const WORKSPACE_DIR = path.join(ROOT_DIR, 'workspace');
const UPLOADS_DIR = path.join(WORKSPACE_DIR, 'uploads');
const OUTPUTS_DIR = path.join(WORKSPACE_DIR, 'outputs');

const PORT = process.env.PORT || 5001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/neurosyn';

const initializeDirectories = () => {
  const dirs = [WORKSPACE_DIR, UPLOADS_DIR, OUTPUTS_DIR];
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      try {
        fs.mkdirSync(dir, { recursive: true });
      } catch (err) {
        console.warn(`[Config Warning]: Could not create directory ${dir}. This is normal in serverless environments.`, err.message);
      }
    }
  });
};

initializeDirectories();

export const config = {
  PORT,
  OPENAI_API_KEY,
  mongodbUri: MONGODB_URI,
  paths: {
    root: ROOT_DIR,
    workspace: WORKSPACE_DIR,
    uploads: UPLOADS_DIR,
    outputs: OUTPUTS_DIR
  }
};