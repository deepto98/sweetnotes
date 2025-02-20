const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const webpush = require("web-push");

require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// VAPID config for Web Push notifications
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Note Schema and Model
const noteSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  message: String,
  iv: String,
  revealDate: Date,
});

const Note = mongoose.model("Note", noteSchema);

// Subscriptions Schema and Model
const SubscriptionSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  noteId: { type: String, required: true },
  revealDate: { type: Date, required: true },
  subscription: { type: Object, required: true },
  notified: { type: Boolean, default: false },
});

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

// Routes

// 1. Create a note

// Utility function to validate date strings
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime()); // Check if the date is valid
};

app.post("/api/notes", async (req, res) => {
  const { sender, receiver, message, iv, revealDate } = req.body;

  // Validate required fields aren't empty
  if (!sender || !receiver || !message || !revealDate) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Validate sender, receiver, and message are strings
  if (
    typeof sender !== "string" ||
    typeof receiver !== "string" ||
    typeof message !== "string"
    // || typeof iv !== "string"
  ) {
    return res.status(400).json({
      error: "Sender, receiver, and message must be strings.",
    });
  }

  // Validate revealDate format
  if (!isValidDate(revealDate)) {
    return res.status(400).json({ error: "Invalid revealDate format." });
  }

  try {
    const note = new Note({
      sender,
      receiver,
      message,
      iv,
      revealDate: new Date(revealDate), // Ensure it's stored as a Date object
    });

    await note.save();
    res.status(200).json({ id: note._id });
  } catch (err) {
    console.error("Error creating note:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 2. Get a note by ID

// Utility function to check if a string is a valid ObjectId
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// Get a note by ID
app.get("/api/notes/:id", async (req, res) => {
  const noteId = req.params.id;

  // Validate ObjectId format
  if (!isValidObjectId(noteId)) {
    return res.status(400).json({ error: "Invalid note ID format." });
  }

  try {
    const note = await Note.findById(noteId);

    if (!note) {
      return res.status(404).json({ error: "Note not found." });
    }

    // Check if the reveal date has passed
    const currentDate = new Date();
    const timeToDecrypt =
      currentDate >= new Date(note.revealDate) ? true : false;

    // if (currentDate < new Date(note.revealDate)) {
    return res.json({
      sender: note.sender,
      receiver: note.receiver,
      message: timeToDecrypt
        ? note.message
        : "This Sweetnote is still hidden! 🤫",
      iv: note.iv,
      revealDate: note.revealDate,
      timeToDecrypt: timeToDecrypt,
    });
    // }

    // If the reveal date has passed, return the full note
    // res.json(note);
  } catch (err) {
    console.error("Error fetching note:", err);
    res.status(500).json({ error: "Internal server error." });
  }
});

// 3 . Endpoint for Web Push Subscription
app.post("/subscribe", async (req, res) => {
  const { subscription, userId, noteId, revealDate } = req.body;
  try {
    await Subscription.findOneAndUpdate(
      { userId, noteId },
      { subscription, revealDate, notified: false },
      { upsert: true, new: true }
    );
    res.status(201).json({ message: "Subscription saved!" });
  } catch (error) {
    console.error("Error saving subscription:", error);
    res.status(500).json({ error: "Failed to save subscription" });
  }
});

// Check for notes that need to be revealed
// Set up an interval to check for notes to reveal every minute (60000ms)
// Scheduled task to send notifications when reveal time has passed
setInterval(async () => {
  const now = new Date();
  try {
    // Find subscriptions with revealDate passed which are not yet notified
    const subscriptionsToNotify = await Subscription.find({
      revealDate: { $lte: now },
      notified: false,
    });

    for (const sub of subscriptionsToNotify) {
      // Get the note details
      const note = await Note.findById(sub.noteId);

      if (!note) continue;

      const payload = JSON.stringify({
        title: "🎁✨ Sweetnotes Reveal! 🎁✨",
        body: `*Psst! Sweetnote from ${note.sender} for ${note.receiver} is ready to be read!* `,
        url: `/notes/${sub.noteId}`,
      });
      try {
        await webpush.sendNotification(sub.subscription, payload);
        sub.notified = true;
        await sub.save();
        console.log(`Notification sent for subscription ${sub._id}`);
      } catch (err) {
        console.error(
          `Error sending notification for subscription ${sub._id}:`,
          err
        );
      }
    }
  } catch (error) {
    console.error("Error in notification scheduler:", error);
  }
}, 30000); // Check every 30s

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
