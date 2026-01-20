import client from '@/lib/mongodb';
import { ActivityType } from '@/types/types';

export async function logActivity(userId: string, type: ActivityType, metadata: any = {}) {
  try {
    const db = client.db('vocabsnap');
    const activities = db.collection('activities');

    const activity = {
      userId,
      type,
      metadata,
      createdAt: new Date(),
    };

    const result = await activities.insertOne(activity);
    return { ...activity, _id: result.insertedId };
  } catch (error) {
    console.error('Error in logActivity utility:', error);
    // Don't throw, just log. Logging shouldn't break the main flow.
    return null;
  }
}
