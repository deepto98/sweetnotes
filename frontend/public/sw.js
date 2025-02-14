self.addEventListener("push", function (event) {
    const data = event.data ? event.data.json() : {};
    const title = data.title || "Sweetnotes Notification";
    const options = {
      body: data.body || "You have a new Sweetnote waiting to be revealed!",
      icon: "/favicon.ico",  
    };
  
    event.waitUntil(self.registration.showNotification(title, options));
  });