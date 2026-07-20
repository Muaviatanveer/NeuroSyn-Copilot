import express from 'express';
import { fetchHistoryLogs } from '../services/dbService.js';
import { connectDB } from '../utils/db.js';

const router = express.Router();

/**
 * Retrieves all persistent task logs stored inside MongoDB scoped to the active user.
 * GET /api/history
 */
router.get('/', async (req, res) => {
  const userId = req.headers['x-user-id'] || 'default_user_workspace';

  try {
    const logs = await fetchHistoryLogs(userId);
    res.status(200).json({
      success: true,
      count: logs.length,
      history: logs
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to retrieve persistent history logs.',
      details: error.message
    });
  }
});

/**
 * Secures and deletes an individual task log from MongoDB.
 * DELETE /api/history/:sessionId
 */
router.delete('/:sessionId', async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.headers['x-user-id'] || 'default_user_workspace';

  try {
    const db = await connectDB();
    if (!db) {
      throw new Error('Database connection is currently offline.');
    }

    const collection = db.collection('history');
    
    // Ensure the record is deleted only if it belongs strictly to the requesting user
    const result = await collection.deleteOne({ sessionId, userId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Task record not found or unauthorized access.' });
    }

    res.status(200).json({
      success: true,
      message: 'Task record deleted successfully.'
    });

  } catch (error) {
    res.status(500).json({
      error: 'Failed to delete task record.',
      details: error.message
    });
  }
});

export default router;