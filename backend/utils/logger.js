import fs from 'fs';
import path from 'path';
import { config } from './config.js';

const logFilePath = path.join(config.paths.root, 'neurosyn-server.log');

/**
 * Appends formatted system records to a log file on disk and prints them to stdout.
 * @param {string} level - Log level classification (INFO | WARN | ERROR)
 * @param {string} module - Class or helper emitting the tracer
 * @param {string} message - Description of event
 * @param {Object} [meta] - Optional diagnostic details
 */
export function logEvent(level, module, message, meta = null) {
  const timestamp = new Date().toISOString();
  const rawMetaString = meta ? ` | Meta: ${JSON.stringify(meta)}` : '';
  const logLine = `[${timestamp}] [${level}] [${module}]: ${message}${rawMetaString}\n`;

  // Print console output
  if (level === 'ERROR') {
    console.error(logLine.trim());
  } else if (level === 'WARN') {
    console.warn(logLine.trim());
  } else {
    console.log(logLine.trim());
  }

  // Safe non-blocking file append
  fs.appendFile(logFilePath, logLine, 'utf8', (err) => {
    if (err) {
      console.warn('[Logger Failure]: Could not write entry to disk log.', err.message);
    }
  });
}

export const logger = {
  info: (mod, msg, meta) => logEvent('INFO', mod, msg, meta),
  warn: (mod, msg, meta) => logEvent('WARN', mod, msg, meta),
  error: (mod, msg, meta) => logEvent('ERROR', mod, msg, meta)
};