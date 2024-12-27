import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import logo from "./sweetnotes-logo.png";
import CryptoJS from "crypto-js";

function ViewNote() {
  const [searchParams] = useSearchParams();
  const { id } = useParams();
  const [note, setNote] = useState(null);
  const [error, setError] = useState("");
  const [copyButtonText, setCopyButtonText] = useState("Copy Link");
  const navigate = useNavigate();

  const backendUrl = process.env.REACT_APP_BACKEND_API_URL;

  // Dynamically get the base URL for the React app
  const baseURL = window.location.origin;

  useEffect(() => {
    const fetchNote = async () => {
      const encryptionKey = searchParams.get("key");
      if (!encryptionKey) {
        setError("Encryption key missing from URL.");
        return;
      }

      try {
        const response = await fetch(`${backendUrl}/api/notes/${id}`);
        if (response.ok) {
          const data = await response.json();

          // Decrypt the message
          const decryptedMessage = CryptoJS.AES.decrypt(
            data.message,
            encryptionKey,
            { iv: data.iv }
          ).toString(CryptoJS.enc.Utf8);
          if (!decryptedMessage)
            throw new Error("Failed to decrypt the message.");

          setNote({
            sender: data.sender,
            receiver: data.receiver,
            message: decryptedMessage,
            revealDate: new Date(data.revealDate).toLocaleString("en-US", {
              hour: "numeric",
              minute: "numeric",
              day: "numeric",
              month: "numeric",
              year: "numeric",
              hour12: true,
            }),
          });
        } else {
          setError("Failed to fetch the note.");
        }
      } catch (error) {
        console.error("Error fetching or decrypting the note:", error);

        setError("An error occurred. Please try again later.");
      }
    };

    fetchNote();
  }, [id, searchParams, backendUrl]);

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
      const whatsappMessage = `🤫 ${note.sender} has a secret Sweetnote for ${note.receiver} 🤫\n ${noteLink}`;
      const whatsappURL = `https://wa.me/?text=${encodeURIComponent(
        whatsappMessage
      )}`;
      window.open(whatsappURL, "_blank");
    }
  };

  return (
    <div className="view-note-container">
      <div className="title-container" onClick={() => navigate("/")}>
        <img src={logo} alt="Sweetnotes Logo" className="logo" />
        <h1 className="title">Sweetnotes</h1>
      </div>
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
              <strong>Reveal Date: </strong>
              {new Intl.DateTimeFormat("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              }).format(new Date(note.revealDate))}{" "}
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
