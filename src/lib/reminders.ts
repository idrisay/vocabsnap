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
      const lastSent = user.lastReminderSentAt ? new Date(user.lastReminderSentAt) : null;
      const tenMinutesInMs = 10 * 60 * 1000;
      
      const shouldSend = !lastSent || (now.getTime() - lastSent.getTime() >= tenMinutesInMs);

      if (shouldSend) {
        console.log(`Sending 10-minute reminder to user ${user.nickname} (${user._id})`);
        
        const result = await sendNotification(
          user.pushSubscription,
          'Practice Reminder',
          'Ready to repeat your collections? A quick 5-minute review keeps the memory fresh!',
          '/dashboard'
        );

        if (result.success) {
          await users.updateOne(
            { _id: user._id },
            { $set: { lastReminderSentAt: now } }
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
