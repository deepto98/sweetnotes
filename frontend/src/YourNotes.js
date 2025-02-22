import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const YourNotes = () => {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_API_URL;
  const itemsPerPage = 5;

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
        <p className="empty-message">You haven't viewed any notes yet.</p>
      ) : (
        <>
          <div className="notes-list">
            {displayedNotes.map((note) => {
              const now = new Date();
              const noteRevealDate = new Date(note.revealDate);
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
                    <strong>Snippet:</strong> {snippet}
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
