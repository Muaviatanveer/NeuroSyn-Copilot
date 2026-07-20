import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('--- NEUROSYN CLOUD BOOTSTRAPPER ---');

try {
  // 1. Install Backend Dependencies
  console.log('Installing Backend dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, 'backend') });

  // 2. Install Frontend Dependencies
  console.log('Installing Frontend dependencies...');
  execSync('npm install', { stdio: 'inherit', cwd: path.join(__dirname, 'frontend') });

  // 3. Build Frontend React App
  console.log('Building Frontend application...');
  execSync('npm run build', { stdio: 'inherit', cwd: path.join(__dirname, 'frontend') });

  // 4. Start the Express Server
  console.log('Booting Unified Backend Server...');
  execSync('node app.js', { stdio: 'inherit', cwd: path.join(__dirname, 'backend') });

} catch (error) {
  console.error('Fatal boot error:', error);
  process.exit(1);
}