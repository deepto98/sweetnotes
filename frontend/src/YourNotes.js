import CryptoJS from "crypto-js";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const YourNotes = () => {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_API_URL;
  const itemsPerPage = 5;

  // Function to decrypt a note's message using CryptoJS
  const decryptNoteMessage = (encryptedMessage, encryptionKey, iv) => {
    try {
      // Parse IV from hex if needed (assuming encryptionKey is a string)
      const decrypted = CryptoJS.AES.decrypt(encryptedMessage, encryptionKey, {
        iv: CryptoJS.enc.Hex.parse(iv),
      }).toString(CryptoJS.enc.Utf8);
      return decrypted;
    } catch (error) {
      console.error("Decryption error for note:", error);
      return null;
    }
  };

  useEffect(() => {
    // Iterate over all localStorage keys and filter those starting with "note-key-"
    const keys = Object.keys(localStorage).filter((key) =>
      key.startsWith("note-key-")
    );
    const noteIds = keys.map((key) => key.replace("note-key-", ""));

    // Fetch note details for each noteId from the backend
    Promise.all(
      noteIds.map((noteId) =>
        fetch(`${backendUrl}/api/notes/${noteId}`)
          .then((res) => {
            if (!res.ok) throw new Error(`Failed to fetch note ${noteId}`);
            return res.json();
          })
          .then((data) => ({ ...data, id: noteId }))
          .catch((err) => {
            console.error("Error fetching note", noteId, err);
            return null;
          })
      )
    )
      .then((results) => {
        const validNotes = results.filter((note) => note !== null);
        setNotes(validNotes);
      })
      .catch((err) => {
        console.error("Error fetching notes:", err);
        setError("Failed to load your notes.");
      });
  }, [backendUrl]);

  // Calculate pagination details
  const totalPages = Math.ceil(notes.length / itemsPerPage);
  const displayedNotes = notes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNoteClick = (noteId) => {
    navigate(`/notes/${noteId}`);
  };

  const handlePrevious = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  return (
    <div className="your-notes-container">
      {error && <div className="error-message">{error}</div>}
      {notes.length === 0 ? (
        <p className="empty-message">You don't have any notes yet.</p>
      ) : (
        <>
          <div className="notes-list">
            {displayedNotes.map((note) => {
              const now = new Date();
              const noteRevealDate = new Date(note.revealDate);
              let snippet = "";
              if (now >= noteRevealDate) {
                // If reveal time has passed, try to get encryption key from localStorage.
                const storedKey = localStorage.getItem(`note-key-${note.id}`);
                if (storedKey) {
                  // Attempt to decrypt the message
                  const decrypted = decryptNoteMessage(
                    note.message,
                    storedKey,
                    note.iv
                  );
                  if (decrypted && decrypted.length > 0) {
                    snippet =
                      decrypted.length > 100
                        ? decrypted.substring(0, 100) + "..."
                        : decrypted;
                  } else {
                    snippet = "Open to read the note";
                  }
                } else {
                  snippet = "Open to read the note";
                }
              } else {
                // If the reveal time has not passed, show placeholder
                snippet = "This Sweetnote is still hidden! 🤫";
              }
              return (
                <div
                  key={note.id}
                  className="note-summary"
                  onClick={() => handleNoteClick(note.id)}
                >
                  <p>
                    <strong>From:</strong> {note.sender}
                  </p>
                  <p>
                    <strong>To:</strong> {note.receiver}
                  </p>
                  <p>
                    <strong>Reveal Date:</strong>{" "}
                    {new Date(note.revealDate).toLocaleString()}
                  </p>
                  <p>
                    <strong>Message:</strong> {snippet}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="pagination">
            <button
              className="pagination-button"
              onClick={handlePrevious}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <span className="pagination-info">
              Page {currentPage} of {totalPages}
            </span>
            <button
              className="pagination-button"
              onClick={handleNext}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default YourNotes;
