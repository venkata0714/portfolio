import React, { useState } from 'react';
import '../styles/HomePage.css';
import ProfilePhoto from '../assets/img/Kartavya.jpg';
import { TypeAnimation } from 'react-type-animation';

function HomePage() {
  const [key, setKey] = useState(0); // State to reset the animation on click

  const keywords = [
    "Developing with Curiosity and Expertise |\n Always Learning & Innovating",
    "Innovating AI-Powered Solutions |\n Experienced Full Stack Developer"
  ];

  return (
    <section className="homepage-container" id="home">
      <div className="container">
        <div className="profile-picture-container">
          <img id="profile-picture" src={ProfilePhoto} className="img-responsive img-circle" alt="Profile" />
        </div>
        <h1 className="name">Kartavya Singh</h1>
        <div
          className="changing-text-container"
          onClick={() => setKey(prevKey => prevKey + 1)} // Increment key to restart animation
        >
        <em>
          <span className="changing-text">
            <TypeAnimation
                key={key} // This forces the component to re-render on click
                className="changing-text-animation"
                sequence={[
                  ...keywords.map((text) => [text, 4000]), // Typing each keyword with a 2-second pause
                  keywords[keywords.length - 1], // Ensures the last phrase displays permanently
                ].flat()}
                speed={50} // Typing speed for smooth effect
                deletionSpeed={50} // Faster deletion for a smoother experience
                repeat={0} // No repeat
                cursor={true}
              />
          </span>
        </em>
        </div>
        <button
          onClick={() => { document.getElementById("about").scrollIntoView({ behavior: "smooth" }); }}
          className="enter-portfolio-btn"
        >
          Enter Portfolio
        </button>
      </div>
    </section>
  );
}

export default HomePage;
