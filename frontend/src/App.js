import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import CreateNote from "./CreateNote";
import ViewNote from "./ViewNote";
import "./App.css";
import YourNotes from "./YourNotes";
import Header from "./Header";

function App() {
  return (
    <Router>
      <div className="view-note-container">
      <Header /> {/* This displays the logo and title on every page */}

        <nav className="navbar">
          <Link className="nav-link" to="/">
            Create Note
          </Link>
          <Link className="nav-link" to="/your-notes">
            Your Notes
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<CreateNote />} />
          <Route path="/notes/:id" element={<ViewNote />} />
          <Route path="/your-notes" element={<YourNotes />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
