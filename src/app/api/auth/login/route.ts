import { NextResponse } from 'next/server';
import client from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { logActivity } from '@/lib/activity';
import { ActivityType } from '@/types/types';


export async function POST(request: Request) {
  try {
    const { nickname, password } = await request.json();

    if (!nickname || !password) {
      return NextResponse.json(
        { error: 'Nickname and password are required' },
        { status: 400 }
      );
    }

    const db = client.db('vocabsnap');
    const users = db.collection('users');

    // Find user
    const user = await users.findOne({ nickname });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Return user info (excluding password)
    const { password: _, ...userWithoutPassword } = user;

    // Log Activity
    await logActivity(user._id.toString(), ActivityType.USER_LOGIN);

    return NextResponse.json(
      { message: 'Login successful', user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
