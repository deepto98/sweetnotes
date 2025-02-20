self.addEventListener("push", function (event) {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Sweetnotes Notification";
  const options = {
    body: data.body || "You have a new Sweetnote waiting to be revealed!",
    icon: "/favicon.ico",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification click
self.addEventListener("notificationclick", function (event) {
  console.log("[Service Worker] Notification click received");
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url)

    // clients
    //   .matchAll({ type: "window", includeUncontrolled: true })
    //   .then((clientList) => {
    //     // If a window/tab is already open, focus it.
    //     for (const client of clientList) {
    //       if (client.url === event.notification.data.url && "focus" in client) {
    //         return client.focus();
    //       }
    //     }
    //     // Otherwise, open a new window/tab.
    //     if (clients.openWindow) {
    //       return clients.openWindow(event.notification.data.url);
    //     }
    //   })
  );
});
