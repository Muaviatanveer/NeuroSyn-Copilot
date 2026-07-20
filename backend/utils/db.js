import { MongoClient } from 'mongodb';
import { config } from './config.js';
import { logger } from './logger.js';

let client = null;
let db = null;

/**
 * Establishes a database connection pool using variables parsed from .env.
 */
export async function connectDB() {
  if (db) return db;

  try {
    client = new MongoClient(config.mongodbUri, {
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000
    });
    
    await client.connect();
    db = client.db();
    logger.info('Database', `Successfully bound connection to local MongoDB: ${config.mongodbUri}`);
    return db;
  } catch (error) {
    logger.warn('Database', `Could not reach local MongoDB at ${config.mongodbUri}. Operating with active in-memory fallbacks.`);
    return null;
  }
}

export function getDB() {
  return db;
}