import React from 'react';
import HeroSection from './HeroSection';
import '../styles.css';

function Home() {
  const features = [
    { title: "Portfolio Showcase", description: "Highlight your best projects with an interactive layout." },
    { title: "Experience Timeline", description: "View a timeline of your professional experiences." },
    { title: "Involvements & Activities", description: "Display your extracurricular and volunteer work." },
    { title: "Honors & Awards", description: "Showcase your achievements and recognitions." },
    { title: "Dynamic Animations", description: "Add animations and transitions to engage users." },
    { title: "Responsive Design", description: "Optimized for both mobile and desktop." }
  ];

  return (
    <div className="home-container">
      <HeroSection 
        title="Welcome to Kartavya Portfolio"
        subtitle="Explore the projects, experiences, and accomplishments of Kartavya in an immersive, interactive format."
        buttonText="Get Started"
        onButtonClick={() => alert("Explore the portfolio!")}
      />

      {/* Features Section */}
      <section className="features">
        {features.map((feature, index) => (
          <div key={index} className="feature-card">
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Home;
