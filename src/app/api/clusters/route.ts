import { NextResponse } from 'next/server';
import client from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { logActivity } from '@/lib/activity';
import { ActivityType } from '@/types/types';


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    const db = client.db('vocabsnap');
    
    // Simple fetch for now. We can add counts later if needed or via separate query.
    const clusters = await db.collection('clusters')
      .find({ userId })
      .sort({ createdAt: 1 })
      .toArray();

    return NextResponse.json(clusters);
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, name } = body;

    if (!userId || !name) {
      return NextResponse.json({ error: 'Missing requirements' }, { status: 400 });
    }

    const db = client.db('vocabsnap');
    const newCluster = {
      userId,
      name,
      createdAt: new Date(),
    };

    const result = await db.collection('clusters').insertOne(newCluster);

    // Log Activity
    logActivity(userId, ActivityType.DECK_CREATED, { 
      clusterId: result.insertedId.toString(), 
      deckName: name 
    });

    return NextResponse.json({ ...newCluster, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
    try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get('id');
  
      if (!id) {
         return NextResponse.json({ error: 'ID required' }, { status: 400 });
      }
  
      const db = client.db('vocabsnap');

      // Get cluster details for logging before deleting
      const clusterDoc = await db.collection('clusters').findOne({ _id: new ObjectId(id) });

      await db.collection('clusters').deleteOne({ _id: new ObjectId(id) });
      
      // Also delete words in this cluster? Or unset them?
      await db.collection('vocabularies').deleteMany({ clusterId: new ObjectId(id) });
  
      if (clusterDoc) {
        logActivity(clusterDoc.userId, ActivityType.DECK_DELETED, { 
          clusterId: id, 
          deckName: clusterDoc.name 
        });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
