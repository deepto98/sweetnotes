const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Note Schema and Model
const noteSchema = new mongoose.Schema({
  sender: String,
  receiver: String,
  message: String,
  revealDate: Date,
});

const Note = mongoose.model('Note', noteSchema);

// Routes
// 1. Create a note
app.post('/api/notes', async (req, res) => {
  const { sender, receiver, message, revealDate } = req.body;

  if (!sender || !receiver || !message || !revealDate) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const note = new Note({ sender, receiver, message, revealDate });
  await note.save();
  res.json({ id: note._id });
});

// 2. Get a note by ID
app.get('/api/notes/:id', async (req, res) => {
  const { id } = req.params;
  const note = await Note.findById(id);

  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  const now = new Date();
  if (now < new Date(note.revealDate)) {
    return res.json({
      sender: note.sender,
      receiver: note.receiver,
      revealDate: note.revealDate,
      message: 'Hidden until reveal date!',
    });
  }

  res.json({
    sender: note.sender,
    receiver: note.receiver,
    message: note.message,
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
