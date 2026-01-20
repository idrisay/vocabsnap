import { NextResponse } from 'next/server';
import { logActivity } from '@/lib/activity';
import { ActivityType } from '@/types/types';
import { waitUntil } from '@vercel/functions';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    if (userId) {
      waitUntil(logActivity(userId, ActivityType.USER_LOGOUT));
    }

    return NextResponse.json({ message: 'Logout logged' }, { status: 200 });
  } catch (error) {
    console.error('Logout logging error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
