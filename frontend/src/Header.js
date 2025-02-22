// src/Header.js
import React from "react";
import { useNavigate } from "react-router-dom";
 
const Header = () => {
  const navigate = useNavigate();

  return (
    <div className="header-container" onClick={() => navigate("/")}>
      <img
        src="/sweetnotes-logo.png"
        alt="Sweetnotes Logo"
        className="logo"
      />
      <h1 className="title">Sweetnotes</h1>
    </div>
  );
};

export default Header;
