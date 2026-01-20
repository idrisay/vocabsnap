import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("vocabsnap");
    
    // Project only necessary fields
    const users = await db.collection("users").find({}, {
        projection: { nickname: 1, _id: 1, joinedAt: 1, createdAt: 1 }
    }).toArray();

    const serializedUsers = users.map(user => ({
        ...user,
        _id: user._id.toString(),
        joinedAt: user.joinedAt || user.createdAt
    }));

    return NextResponse.json(serializedUsers);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
