import React from 'react';
 
const Footer = () => {
  // Replace these URLs with your repository and GitHub profile URLs
  const repoUrl = 'https://github.com/deepto98/sweetnotes';
  const profileUrl = 'https://github.com/deepto98';

  return (
    <footer className="footer">
      <div className="links-container">
        {/* GitHub Star Button Badge */}
        <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="link">
          <img
            src="https://img.shields.io/github/stars/deepto98/sweetnotes?style=social"
            alt="GitHub stars"
            className="icon"
          />
        </a>
        {/* Created by Link */}
        <span className="created-by">
          Created by{' '}
          <a href={profileUrl} target="_blank" rel="noopener noreferrer" className="profile-link">
            Deepto
          </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
