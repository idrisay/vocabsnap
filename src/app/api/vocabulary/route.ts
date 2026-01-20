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

    const clusterId = searchParams.get('clusterId');

    const query: any = { userId };
    if (clusterId) {
        query.clusterId = new ObjectId(clusterId);
    }

    const db = client.db('vocabsnap');
    const vocabularies = await db
      .collection('vocabularies')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(vocabularies);
  } catch (error) {
    console.error('Error fetching vocabularies:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const db = client.db('vocabsnap');
    
    // Handle Bulk Insert
    if (body.items && Array.isArray(body.items)) {
      const { userId, items } = body;
      
      if (!userId || items.length === 0) {
        return NextResponse.json({ error: 'Missing userId or items' }, { status: 400 });
      }

      // 1. Get list of words trying to be added
      const incomingWords = items.map((item: any) => item.word);

      // 2. Find which of these already exist for this user
      const existingDocs = await db.collection('vocabularies')
        .find({ userId, word: { $in: incomingWords } })
        .project({ word: 1 })
        .toArray();
      
      const existingWords = new Set(existingDocs.map(d => d.word));

      // 3. Filter out duplicates
      const newVocabs = items
        .filter((item: any) => !existingWords.has(item.word))
        .map((item: any) => ({
          userId,
          clusterId: body.clusterId ? new ObjectId(body.clusterId) : null,
          word: item.word,
          meaning: item.meaning,
          example: item.example || '',
          memoryTip: item.memoryTip || '',
          createdAt: new Date(),
        }));

      if (newVocabs.length === 0) {
        return NextResponse.json({ count: 0, skipped: items.length }, { status: 200 });
      }

      const result = await db.collection('vocabularies').insertMany(newVocabs);

      // Log Activity
      logActivity(userId, ActivityType.WORDS_IMPORTED, { 
        count: result.insertedCount, 
        clusterId: body.clusterId 
      });

      return NextResponse.json({ 
        count: result.insertedCount, 
        skipped: items.length - result.insertedCount 
      }, { status: 201 });
    }

    // Handle Single Insert (Existing logic)
    const { userId, word, meaning, example, memoryTip, clusterId } = body;

    if (!userId || !word || !meaning) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check availability
    const existing = await db.collection('vocabularies').findOne({ userId, word });
    if (existing) {
      return NextResponse.json({ error: 'Word already exists' }, { status: 409 });
    }

    const newVocab = {
      userId,
      clusterId: clusterId ? new ObjectId(clusterId) : null,
      word,
      meaning,
      example: example || '',
      memoryTip: memoryTip || '',
      createdAt: new Date(),
    };

    const result = await db.collection('vocabularies').insertOne(newVocab);

    // Log Activity
    logActivity(userId, ActivityType.WORD_ADDED, { 
      wordId: result.insertedId.toString(), 
      word,
      clusterId 
    });

    return NextResponse.json({ ...newVocab, _id: result.insertedId }, { status: 201 });
  } catch (error) {
    console.error('Error creating vocabulary:', error);
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
    
    // Get word details for logging before deleting
    const wordDoc = await db.collection('vocabularies').findOne({ _id: new ObjectId(id) });
    
    await db.collection('vocabularies').deleteOne({ _id: new ObjectId(id) });

    if (wordDoc) {
      logActivity(wordDoc.userId, ActivityType.WORD_DELETED, { 
        wordId: id, 
        word: wordDoc.word 
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
