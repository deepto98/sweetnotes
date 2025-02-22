import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const YourNotes = () => {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_API_URL;

  useEffect(() => {
    // Iterate over all localStorage keys and filter those starting with "note-key-"
    const keys = Object.keys(localStorage).filter(key => key.startsWith("note-key-"));
    const noteIds = keys.map(key => key.replace("note-key-", ""));

    // Fetch note details for each noteId from the backend
    Promise.all(
      noteIds.map(noteId =>
        fetch(`${backendUrl}/api/notes/${noteId}`)
          .then(res => {
            if (!res.ok) throw new Error(`Failed to fetch note ${noteId}`);
            return res.json();
          })
          .then(data => {
            // Attach the noteId so we can navigate later
            return { ...data, id: noteId };
          })
          .catch(err => {
            console.error("Error fetching note", noteId, err);
            return null;
          })
      )
    )
      .then(results => {
        // Filter out any notes that failed to load
        const validNotes = results.filter(note => note !== null);
        setNotes(validNotes);
      })
      .catch(err => {
        console.error("Error fetching notes:", err);
        setError("Failed to load your notes.");
      });
  }, [backendUrl]);

  const handleNoteClick = (noteId) => {
    // Navigate to the note view page.
    // The ViewNote component will retrieve the encryption key from localStorage.
    navigate(`/notes/${noteId}`);
  };

  return (
    <div className="your-notes-container">
       {error && <div className="error-message">{error}</div>}
      {notes.length === 0 ? (
        <p className="empty-message">You haven't viewed any notes yet.</p>
      ) : (
        <div className="notes-list">
          {notes.map((note) => {
            const now = new Date();
            const noteRevealDate = new Date(note.revealDate);
            // Todo : Maybe decrypt and show actual message if time has passed
            const snippet =
              now >= noteRevealDate
                ? note.message.length > 100
                  ? note.message.substring(0, 100) + "..."
                  : note.message
                : "This Sweetnote is still hidden! 🤫";
            return (
              <div
                key={note.id}
                className="note-summary"
                onClick={() => handleNoteClick(note.id)}
              >
                <p><strong>From:</strong> {note.sender}</p>
                <p><strong>To:</strong> {note.receiver}</p>
                <p><strong>Reveal Date:</strong> {new Date(note.revealDate).toLocaleString()}</p>
                <p><strong>Snippet:</strong> {snippet}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

};

export default YourNotes;
