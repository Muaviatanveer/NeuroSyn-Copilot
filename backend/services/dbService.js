import { connectDB } from '../utils/db.js';
import { logger } from '../utils/logger.js';

export async function saveFileRecord(userId, fileData) {
  const db = await connectDB();
  if (!db) return null;
  try {
    const collection = db.collection('files');
    return await collection.insertOne({
      userId: userId || 'default_user_workspace',
      ...fileData,
      uploadedAt: new Date()
    });
  } catch (err) {
    logger.error('dbService', `Failed to save file metadata for user: ${userId}`, err);
  }
}

export async function saveHistoryRecord(userId, record) {
  const db = await connectDB();
  if (!db) return null;
  try {
    const collection = db.collection('history');
    const result = await collection.insertOne({
      userId: userId || 'default_user_workspace',
      ...record,
      createdAt: new Date()
    });
    logger.info('dbService', `Persisted task ${record.id} to MongoDB.`);
    return result;
  } catch (err) {
    logger.error('dbService', `Failed to insert history log.`, err);
  }
}

export async function fetchHistoryLogs(userId) {
  const db = await connectDB();
  if (!db) return [];
  const targetUserId = userId || 'default_user_workspace';
  try {
    const collection = db.collection('history');
    return await collection.find({ userId: targetUserId }).sort({ createdAt: -1 }).toArray();
  } catch (err) {
    logger.error('dbService', `Failed to retrieve history logs.`, err);
    return [];
  }
}

// -------------------------------------------------------------
// NEW: SERVERLESS MONGODB CACHING FOR VERCEL
// -------------------------------------------------------------
export async function cacheSessionData(sessionId, parsedData) {
  const db = await connectDB();
  if (!db) return null;
  try {
    const collection = db.collection('session_cache');
    await collection.updateOne(
      { sessionId },
      { $set: { sessionId, data: parsedData, createdAt: new Date() } },
      { upsert: true }
    );
  } catch (err) {
    logger.error('dbService', `Failed to cache session data to MongoDB.`, err);
  }
}

export async function getCachedSessionData(sessionId) {
  const db = await connectDB();
  if (!db) return null;
  try {
    const collection = db.collection('session_cache');
    const record = await collection.findOne({ sessionId });
    return record ? record.data : null;
  } catch (err) {
    logger.error('dbService', `Failed to retrieve session cache from MongoDB.`, err);
    return null;
  }
}