import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function ViewNote() {
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState("");

  const baseURL = "http://localhost:3000"; // Change this to your deployed frontend URL if hosting elsewhere.

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/notes/${id}`);
        if (response.ok) {
          const data = await response.json();
          setNote(data);
        } else {
          setError("Failed to fetch the note.");
        }
      } catch (error) {
        setError("An error occurred. Please try again later.");
      }
    };

    fetchNote();
  }, [id]);

  const copyToClipboard = () => {
    const noteLink = `${baseURL}/notes/${id}`;
    navigator.clipboard
      .writeText(noteLink)
      .then(() => setCopySuccess("Link copied to clipboard!"))
      .catch(() => setCopySuccess("Failed to copy the link."));
  };

  const shareOnWhatsApp = () => {
    if (note) {
      const noteLink = `${baseURL}/notes/${id}`;
      const whatsappMessage = `${note.sender} has a secretnote for ${note.receiver}: ${noteLink}`;
      const whatsappURL = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappURL, "_blank");
    }
  };

  return (
    <div className="view-note-container">
      <h1 className="title">Sweetnotes</h1>
      <div className="note-box">
        {error ? (
          <p className="error-message">{error}</p>
        ) : note ? (
          <>
            <p>
              <strong>From:</strong> {note.sender}
            </p>
            <p>
              <strong>To:</strong> {note.receiver}
            </p>
            <p>
              <strong>Message:</strong> {note.message}
            </p>
            <p>
              <strong>Reveal Date:</strong> {new Date(note.revealDate).toLocaleDateString()}
            </p>
            <div className="share-buttons">
              <button className="copy-button" onClick={copyToClipboard}>
                Copy Link
              </button>
              <button className="whatsapp-button" onClick={shareOnWhatsApp}>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WhatsApp"
                  className="whatsapp-icon"
                />
                WhatsApp
              </button>
              {copySuccess && <p className="copy-success">{copySuccess}</p>}
            </div>
          </>
        ) : (
          <p>Loading note...</p>
        )}
      </div>
    </div>
  );
}

export default ViewNote;
