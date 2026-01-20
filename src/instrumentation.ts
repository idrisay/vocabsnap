export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const cron = await import('node-cron');
    const { checkAndSendReminders } = await import('./lib/reminders');

    // Run every minute to check if any user needs a reminder
    // We use a global variable to ensure the cron job is only registered once
    // during development hot-reloads.
    const globalCron = global as any;

    if (!globalCron.remindersJobStarted) {
      console.log('Registering daily reminders cron job...');
      cron.schedule('* * * * *', () => {
        checkAndSendReminders();
      });
      globalCron.remindersJobStarted = true;
    }
  }
}
