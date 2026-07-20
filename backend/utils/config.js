import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, '..');
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
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

initializeDirectories();

export const config = {
  PORT,
  OPENAI_API_KEY,
  mongodbUri: MONGODB_URI, // Exposed globally in the backend config
  paths: {
    root: ROOT_DIR,
    workspace: WORKSPACE_DIR,
    uploads: UPLOADS_DIR,
    outputs: OUTPUTS_DIR
  }
};