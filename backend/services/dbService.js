import { connectDB } from '../utils/db.js';
import { logger } from '../utils/logger.js';

/**
 * Saves uploaded file metadata into the 'files' collection scoped to a user.
 * @param {string} userId - Unique identifier of the individual user.
 * @param {Object} fileData - Ingested file parameters.
 */
export async function saveFileRecord(userId, fileData) {
  const db = await connectDB();
  if (!db) return null;

  try {
    const collection = db.collection('files');
    const result = await collection.insertOne({
      userId: userId || 'default_user_workspace',
      ...fileData,
      uploadedAt: new Date()
    });
    return result;
  } catch (err) {
    logger.error('dbService', `Failed to save file metadata for user: ${userId}`, err);
  }
}

/**
 * Saves a completed workflow run parameters directly into the 'history' collection scoped to a user.
 * @param {string} userId - Unique identifier of the individual user.
 * @param {Object} record - Executed run coordinates.
 */
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
    logger.info('dbService', `Persisted task ${record.id} for user ${userId} to MongoDB.`);
    return result;
  } catch (err) {
    logger.error('dbService', `Failed to insert history log for user: ${userId}`, err);
  }
}

/**
 * Fetches all persistent past runs belonging strictly to the active user.
 * @param {string} userId - Unique identifier of the individual user.
 */
export async function fetchHistoryLogs(userId) {
  const db = await connectDB();
  if (!db) return [];

  const targetUserId = userId || 'default_user_workspace';

  try {
    const collection = db.collection('history');
    // Filter strictly by the active individual user context
    return await collection.find({ userId: targetUserId }).sort({ createdAt: -1 }).toArray();
  } catch (err) {
    logger.error('dbService', `Failed to retrieve history logs for user: ${userId}`, err);
    return [];
  }
}