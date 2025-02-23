import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { formatISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";
import CryptoJS from "crypto-js";

function CreateNote() {
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [revealDate, setRevealDate] = useState(() => {
    const now = new Date();
    now.setSeconds(0);
    return now;
  });
  const [loading, setLoading] = useState(false); // New state for loading
  const navigate = useNavigate();

  const backendUrl = process.env.REACT_APP_BACKEND_API_URL;
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start loading

    try {
      // Generate encryption key
      const encryptionKey = CryptoJS.lib.WordArray.random(32).toString();

      // Encrypt the message
      const iv = CryptoJS.lib.WordArray.random(16).toString();
      const encryptedMessage = CryptoJS.AES.encrypt(message, encryptionKey, {
        iv,
      }).toString();

      // Convert to ISO string with timezone included
      const revealDateISO = formatISO(revealDate);

      const response = await fetch(`${backendUrl}/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender,
          receiver,
          message: encryptedMessage,
          iv,
          revealDate: revealDateISO,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const noteId = data.id; // Extract the note ID
        // Redirect with note ID and encryption key as URL parameters
        navigate(`/notes/${noteId}?key=${encryptionKey}`);
      } else {
        alert("Failed to create the note. Please try again.");
      }
    } catch (error) {
      console.error("Error creating note:", error);
      alert("An error occurred. Please try again later.");
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <label className="form-label">From</label>
      <input
        type="text"
        className="form-input"
        value={sender}
        placeholder="Your name"
        onChange={(e) => setSender(e.target.value)}
        required
      />

      <label className="form-label">To</label>
      <input
        type="text"
        className="form-input"
        value={receiver}
        placeholder="Your friend's name"
        onChange={(e) => setReceiver(e.target.value)}
        required
      />

      <label className="form-label">Message</label>
      <textarea
        className="form-textarea"
        value={message}
        placeholder="Your secret message"
        onChange={(e) => setMessage(e.target.value)}
        required
      ></textarea>

      <label className="form-label">Reveal Date</label>
      <DatePicker
        selected={revealDate}
        onChange={(date) => {
          const adjustedDate = new Date(date);
          adjustedDate.setSeconds(0);
          setRevealDate(adjustedDate);
        }}
        // showTimeSelect
        // timeIntervals={1}

        timeInputLabel="Time:"
        showTimeInput
        dateFormat="dd/MM/yyyy h:mm aa"
        className="form-input"
        onFocus={(e) => (e.target.readOnly = true)}
        required
      />

      <button className="submit-button" type="submit" disabled={loading}>
        {loading ? (
          <>
            <span className="loading-circle"></span> Generating
          </>
        ) : (
          "Create Note"
        )}
      </button>
    </form>
  );
}

export default CreateNote;
