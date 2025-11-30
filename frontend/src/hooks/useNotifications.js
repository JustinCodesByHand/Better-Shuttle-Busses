import { useState } from 'react';

export function useNotifications() {
  const [status, setStatus] = useState('unknown');

  async function requestPermission() {
    if (!('Notification' in window)) {
      setStatus('unsupported');
      return;
    }
    const permission = await Notification.requestPermission();
    setStatus(permission);
  }

  function sendTestNotification() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'granted') {
      new Notification('UAlbany Shuttle', {
        body: 'This is a test arrival alert 🚍',
      });
    }
  }

  return { status, requestPermission, sendTestNotification };
}
