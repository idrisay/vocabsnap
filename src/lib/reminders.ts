import client from './mongodb';
import { sendNotification } from './notifications';

export async function checkAndSendReminders() {
  try {
    const db = client.db('vocabsnap');
    const users = db.collection('users');

    // Get all users who have notifications enabled
    const subscribedUsers = await users.find({
      notificationsEnabled: true,
      pushSubscription: { $exists: true },
      timezone: { $exists: true }
    }).toArray();

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

    for (const user of subscribedUsers) {
      // Check if it's 20:00 in user's timezone
      const userTime = new Intl.DateTimeFormat('en-US', {
        timeZone: user.timezone,
        hour: '2-digit',
        hour12: false
      }).format(now);

      const hour = parseInt(userTime, 10);

      // If it's 20:00 and we haven't sent a reminder today
      if (hour === 20 && user.lastReminderSent !== todayStr) {
        console.log(`Sending daily reminder to user ${user.nickname} (${user._id})`);
        
        const result = await sendNotification(
          user.pushSubscription,
          'VocabSnap Reminder',
          'Time to practice! Review your collection or check your mistakes.',
          '/dashboard'
        );

        if (result.success) {
          await users.updateOne(
            { _id: user._id },
            { $set: { lastReminderSent: todayStr } }
          );
        } else if (result.expired) {
          // Clean up expired subscriptions
          await users.updateOne(
            { _id: user._id },
            { 
              $set: { notificationsEnabled: false },
              $unset: { pushSubscription: "" }
            }
          );
        }
      }
    }
  } catch (error) {
    console.error('Error in checkAndSendReminders:', error);
  }
}
