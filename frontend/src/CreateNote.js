import React, { useState } from "react";
import DatePicker from "react-datepicker";
import { formatISO } from "date-fns";
import { useNavigate } from "react-router-dom";
import "react-datepicker/dist/react-datepicker.css";

function CreateNote() {
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [revealDate, setRevealDate] = useState(new Date()); // Default to current time
  const navigate = useNavigate();

  const backendUrl = process.env.REACT_APP_BACKEND_API_URL;
  console.log(backendUrl);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Convert to ISO string with timezone included
      const revealDateISO = formatISO(revealDate);

      const response = await fetch(`${backendUrl}/api/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender,
          receiver,
          message,
          revealDate: revealDateISO,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const noteId = data.id; // Extract the note ID
        navigate(`/notes/${noteId}`); // Redirect to the note's page
      } else {
        alert("Failed to create the note. Please try again.");
      }
    } catch (error) {
      console.error("Error creating note:", error);
      alert("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="create-note-container">
      <h1 className="title" onClick={() => navigate("/")}>Sweetnotes</h1>
      <form className="note-form" onSubmit={handleSubmit}>
        <label className="form-label">Sender</label>
        <input
          type="text"
          className="form-input"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          required
        />

        <label className="form-label">Receiver</label>
        <input
          type="text"
          className="form-input"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          required
        />

        <label className="form-label">Message</label>
        <textarea
          className="form-textarea"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        ></textarea>

        <label className="form-label">Reveal Date</label>
        <DatePicker
        
          selected={revealDate}
          onChange={(date) => setRevealDate(date)}
          // showTimeSelect
          // timeIntervals={1}

          timeInputLabel="Time:"
          showTimeInput

          dateFormat="dd/MM/yyyy h:mm aa"
          className="form-input"
          onFocus={(e) => e.target.readOnly = true}

          required
        />

        <button className="submit-button" type="submit">
          Create Note
        </button>
      </form>
    </div>
  );
}

export default CreateNote;
