import { NextResponse } from 'next/server';
import client from '@/lib/mongodb';
import { ActivityType } from '@/types/types';

export async function POST(request: Request) {
  try {
    const { userId, type, metadata } = await request.json();

    if (!userId || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const db = client.db('vocabsnap');
    const activities = db.collection('activities');

    const activity = {
      userId,
      type,
      metadata: metadata || {},
      createdAt: new Date(),
    };

    const result = await activities.insertOne(activity);

    return NextResponse.json({ ...activity, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Error logging activity:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const db = client.db('vocabsnap');
    
    // Build pipeline for aggregation
    const pipeline: any[] = [];

    // Filter by userId if not 'all'
    if (userId !== 'all') {
      pipeline.push({ $match: { userId } });
    }

    // Join with users to get nickname
    pipeline.push({
      $lookup: {
        from: 'users',
        let: { userIdStr: '$userId' },
        pipeline: [
          { 
            $match: { 
              $expr: { 
                $eq: [{ $toString: '$_id' }, '$$userIdStr'] 
              } 
            } 
          },
          { $project: { nickname: 1, _id: 0 } }
        ],
        as: 'userInfo'
      }
    });

    // Unwind userInfo and format
    pipeline.push({
      $addFields: {
        nickname: { $arrayElemAt: ['$userInfo.nickname', 0] }
      }
    });

    pipeline.push({ $project: { userInfo: 0 } });
    pipeline.push({ $sort: { createdAt: -1 } });
    pipeline.push({ $limit: 100 }); // Sanity limit for admin

    const activities = await db.collection('activities').aggregate(pipeline).toArray();

    return NextResponse.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

