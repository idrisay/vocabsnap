import { NextResponse } from 'next/server';
import client from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

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

    // Check if user already exists
    const existingUser = await users.findOne({ nickname });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Nickname already taken' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await users.insertOne({
      nickname,
      password: hashedPassword,
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: 'User registered successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
