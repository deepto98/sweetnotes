import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './ViewNote.css';

const ViewNote = () => {
    const { id } = useParams();
    const [note, setNote] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNote = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/notes/${id}`);
                setNote(response.data);
            } catch (err) {
                setError('Failed to fetch the note.');
            } finally {
                setLoading(false);
            }
        };

        fetchNote();
    }, [id]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="error">{error}</p>;

    return (
        <div className="view-note-container">
            <h2>Note Details</h2>
            <div className="note-box">
                <p><strong>Sender:</strong> {note.sender}</p>
                <p><strong>Receiver:</strong> {note.receiver}</p>
                <p><strong>Message:</strong> {note.message}</p>
                <p><strong>Reveal Date:</strong> {new Date(note.revealDate).toLocaleString()}</p>
            </div>
        </div>
    );
};

export default ViewNote;
