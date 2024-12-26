import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateNote.css';

const CreateNote = () => {
    const [formData, setFormData] = useState({
        sender: '',
        receiver: '',
        message: '',
        revealDate: '',
    });
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);

        try {
            const response = await axios.post('http://localhost:5000/api/notes', formData);
            const createdNoteId = response.data._id;
            navigate(`/notes/${createdNoteId}`);
        } catch (err) {
            setError('Failed to create the note. Please check the inputs.');
        }
    };

    return (
        <div className="create-note-container">
            <h2>Create a Note</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit} className="create-note-form">
                <label>
                    Sender Name
                    <input
                        type="text"
                        name="sender"
                        value={formData.sender}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Receiver Name
                    <input
                        type="text"
                        name="receiver"
                        value={formData.receiver}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Message
                    <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Reveal Date
                    <input
                        type="datetime-local"
                        name="revealDate"
                        value={formData.revealDate}
                        onChange={handleChange}
                        required
                    />
                </label>
                <button type="submit">Create Note</button>
            </form>
        </div>
    );
};

export default CreateNote;
