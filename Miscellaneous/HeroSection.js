import React from 'react';

function HeroSection({ title, subtitle, buttonText, onButtonClick }) {
  return (
    <section className="hero-section">
      <div className="hero-text">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <button className="hero-button" onClick={onButtonClick}>{buttonText}</button>
      </div>
    </section>
  );
}

export default HeroSection;
