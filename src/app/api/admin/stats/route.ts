import { NextResponse } from 'next/server';
import client from '@/lib/mongodb';
import { ActivityType } from '@/types/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = client.db('vocabsnap');
    
    // 1. Total Users
    const totalUsers = await db.collection('users').countDocuments();
    
    // 2. Total Activities
    const totalActivities = await db.collection('activities').countDocuments();
    
    // 3. Activity breakdown by type
    const breakdown = await db.collection('activities').aggregate([
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]).toArray();
    
    // 4. Daily activity trends (last 14 days)
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);
    fourteenDaysAgo.setHours(0, 0, 0, 0);

    const trends = await db.collection('activities').aggregate([
      { $match: { createdAt: { $gte: fourteenDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]).toArray();

    // 5. User List with activity counts
    const userStats = await db.collection('users').aggregate([
      {
        $lookup: {
          from: 'activities',
          let: { userIdStr: { $toString: '$_id' } },
          pipeline: [
            { $match: { $expr: { $eq: ['$userId', '$$userIdStr'] } } },
            { $count: 'count' }
          ],
          as: 'activityCount'
        }
      },
      {
        $project: {
          nickname: 1,
          joinedAt: 1,
          activityCount: { $ifNull: [{ $arrayElemAt: ['$activityCount.count', 0] }, 0] }
        }
      },
      { $sort: { activityCount: -1 } }
    ]).toArray();

    return NextResponse.json({
      totalUsers,
      totalActivities,
      breakdown,
      trends,
      users: userStats
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
