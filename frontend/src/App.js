import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  NavLink,
} from "react-router-dom";
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
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Create Note
          </NavLink>
          <NavLink
            to="/your-notes"
            className={({ isActive }) =>
              isActive ? "nav-link active" : "nav-link"
            }
          >
            Your Notes
          </NavLink>
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
