import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function CreateNote() {
  const [sender, setSender] = useState("");
  const [receiver, setReceiver] = useState("");
  const [message, setMessage] = useState("");
  const [revealDate, setRevealDate] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:5000/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sender, receiver, message, revealDate }),
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
      <h1 className="title"  onClick={() => navigate("/")}>Sweetnotes</h1>
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
        <input
          type="datetime-local"
          className="form-input"
          value={revealDate}
          onChange={(e) => setRevealDate(e.target.value)}
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
