// AL ANSAR PWA & Background Push Notification Service Worker
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Listen for messages from client app to display native OS system notifications
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    const { title, body, icon, badge, data, tag } = event.data;
    event.waitUntil(
      self.registration.showNotification(title || 'আল আনসার নোটিফিকেশন', {
        body: body || '',
        icon: icon || '/logo.jpg',
        badge: badge || '/logo.jpg',
        tag: tag || ('alansar_notif_' + Date.now()),
        vibrate: [300, 150, 300, 150, 300],
        requireInteraction: true,
        renotify: true,
        data: data || {}
      })
    );
  }
});

// Push notification click event - opens relevant page and focuses window
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = (event.notification.data && event.notification.data.url) || '/admin';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          if ('navigate' in client) {
            client.navigate(targetUrl);
          }
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
