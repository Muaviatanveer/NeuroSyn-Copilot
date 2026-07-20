import AdmZip from 'adm-zip';
import path from 'path';
import fs from 'fs';
import { config } from './config.js';

/**
 * Compresses session output assets into a single downloadable .zip archive.
 * @param {string} sessionId - Workflow session identifier.
 * @returns {Promise<string>} Absolute disk path to the written .zip archive.
 */
export async function createSessionZipArchive(sessionId) {
  const sessionOutputDir = path.join(config.paths.outputs, sessionId);
  if (!fs.existsSync(sessionOutputDir)) {
    throw new Error(`Output folder not found for zip packaging: ${sessionOutputDir}`);
  }

  const zip = new AdmZip();
  const outputPath = path.join(sessionOutputDir, `workspace_artifacts_${Date.now()}.zip`);

  const files = fs.readdirSync(sessionOutputDir);
  
  files.forEach(file => {
    const fullPath = path.join(sessionOutputDir, file);
    const stat = fs.statSync(fullPath);

    // Prevent zipping an already existing ZIP file or folders
    if (stat.isFile() && !file.endsWith('.zip')) {
      zip.addLocalFile(fullPath);
    }
  });

  return new Promise((resolve, reject) => {
    zip.writeZip(outputPath, (err) => {
      if (err) {
        console.error('[Zipper Service Failure]:', err);
        return reject(err);
      }
      resolve(outputPath);
    });
  });
}