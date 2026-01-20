import { NextResponse } from 'next/server';
import client from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { sendNotification } from '@/lib/notifications';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, subscription, action } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const db = client.db('vocabsnap');
    const users = db.collection('users');

    if (action === 'subscribe') {
      const { timezone } = body;
      if (!subscription) {
        return NextResponse.json({ error: 'Subscription is required' }, { status: 400 });
      }

      await users.updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            pushSubscription: subscription,
            notificationsEnabled: true,
            timezone: timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            lastReminderSent: null
          } 
        }
      );

      // Send a confirmation notification
      await sendNotification(
        subscription, 
        'Reminders Enabled!', 
        'You will now receive reminders to study your word lists.',
        '/'
      );

      return NextResponse.json({ message: 'Subscribed successfully' });
    }

    if (action === 'unsubscribe') {
      await users.updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { notificationsEnabled: false },
          $unset: { pushSubscription: "" }
        }
      );
      return NextResponse.json({ message: 'Unsubscribed successfully' });
    }

    if (action === 'test') {
      const user = await users.findOne({ _id: new ObjectId(userId) });
      if (!user || !user.pushSubscription) {
        return NextResponse.json({ error: 'User not found or not subscribed' }, { status: 404 });
      }

      const result = await sendNotification(
        user.pushSubscription,
        'Test Notification',
        'This is a test notification from VocabSnap!',
        '/'
      );

      if (result.success) {
        return NextResponse.json({ message: 'Test notification sent' });
      } else {
        return NextResponse.json({ error: result.error || 'Failed to send notification' }, { status: 500 });
      }
    }

    if (action === 'test-reminders') {
      const { checkAndSendReminders } = await import('@/lib/reminders');
      await checkAndSendReminders();
      return NextResponse.json({ message: 'Reminder check triggered' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Push API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
