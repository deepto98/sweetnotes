import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CreateNote from "./CreateNote";
import ViewNote from "./ViewNote";
import "./App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CreateNote />} />
        <Route path="/notes/:id" element={<ViewNote />} />
      </Routes>
    </Router>
  );
}

export default App;
