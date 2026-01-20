import webpush from 'web-push';

if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.warn('VAPID keys are not set. Push notifications will not work.');
} else {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:8qwerty7654321@gmail.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function sendNotification(subscription: any, title: string, body: string, url: string = '/') {
  try {
    const payload = JSON.stringify({
      title,
      body,
      url
    });

    await webpush.sendNotification(subscription, payload);
    return { success: true };
  } catch (error: any) {
    console.error('Error sending notification:', error);
    if (error.statusCode === 404 || error.statusCode === 410) {
      return { success: false, expired: true };
    }
    return { success: false, error: error.message };
  }
}
