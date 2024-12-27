import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
  
function ViewNote() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [error, setError] = useState("");
  const [copyButtonText, setCopyButtonText] = useState("Copy Link");
  const backendUrl = process.env.REACT_APP_BACKEND_API_URL;

  const baseURL = "http://localhost:3000";

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/notes/${id}`);
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
  }, [id, backendUrl]);

  const copyToClipboard = () => {
    const noteLink = `${baseURL}/notes/${id}`;
    navigator.clipboard
      .writeText(noteLink)
      .then(() => setCopyButtonText("Copied!"))
      .catch(() => setCopyButtonText("Failed to Copy"));
    setTimeout(() => setCopyButtonText("Copy Link"), 2000); // Reset after 2 seconds
  };

  const shareOnWhatsApp = () => {
    if (note) {
      const noteLink = `${baseURL}/notes/${id}`;
      const whatsappMessage = `${note.sender} has a secret note for ${note.receiver}: ${noteLink}`;
      const whatsappURL = `https://wa.me/?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappURL, "_blank");
    }
  };

  return (
    <div className="view-note-container">
      <h1 className="title"  onClick={() => navigate("/")}>Sweetnotes</h1>
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
              <strong>Reveal Date:</strong> {new Date(note.revealDate).toLocaleString()}
            </p>
            <div className="share-buttons">
              <button className="copy-button" onClick={copyToClipboard}>
                {copyButtonText}
              </button>
              <button className="whatsapp-button" onClick={shareOnWhatsApp}>
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
                  alt="WhatsApp"
                  className="whatsapp-icon"
                />
                WhatsApp
              </button>
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
