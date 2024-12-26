import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateNote from './CreateNote';
import ViewNote from './ViewNote';
import './App.css';

const App = () => {
    return (
        <Router>
            <div className="app-container">
                <header className="app-header">
                    <img
                        src="/sweetnotes-logo.png"
                        alt="Sweetnotes Logo"
                        className="logo"
                    />
                    <h1>Sweetnotes</h1>
                </header>
                <Routes>
                    <Route path="/" element={<CreateNote />} />
                    <Route path="/notes/:id" element={<ViewNote />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
