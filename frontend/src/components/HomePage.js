import React from 'react';
import '../styles/HomePage.css';
import ProfilePhoto from '../assets/img/Kartavya.jpg';

function HomePage() {
  return (
    <div className="homepage-container" id="home">
      <div className="container">
        <div className="profile-picture-container">
          <img id="profile-picture" src={ProfilePhoto} className="img-responsive img-circle" alt="Profile" />
        </div>
        <h1 className="name">Kartavya Singh</h1>
        <p className="subtitle">Software Engineer - Grad Student - AI/ML Researcher</p>
        <button className="enter-portfolio-btn">Enter Portfolio</button>
      </div>
    </div>
  );
}

export default HomePage;
