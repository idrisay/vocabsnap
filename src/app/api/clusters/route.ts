import { NextResponse } from 'next/server';
import client from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

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
      await db.collection('clusters').deleteOne({ _id: new ObjectId(id) });
      
      // Also delete words in this cluster? Or unset them?
      // User likely wants words deleted if they delete the deck.
      // But safe option: Unset clusterId.
      // Let's go with DELETE for now as clearer semantics for "Delete Folder".
      // Actually, standard behavior: Delete words inside.
      await db.collection('vocabularies').deleteMany({ clusterId: new ObjectId(id) });
  
      return NextResponse.json({ success: true });
    } catch (error) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
