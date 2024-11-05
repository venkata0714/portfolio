// HomePage.js
import React from 'react';
// import './HomePage.css';
import './HomePage.scss';
function HomePage() {
  return (
    <div className="homepage-container">
      {/* Hero Section */}
      <section className="hero-section" id="home">
        <nav className="navbar navbar-expand-lg navbar-dark fixed-top" id="mainNav">
          <div className="container">
            <a
              className="navbar-brand js-scroll-trigger"
              href="#home"
              style={{ fontFamily: 'Montserrat, Helvetica Neue, Helvetica, Arial, sans-serif' }}
            >
              <b>Kartavya Singh</b>
            </a>
            <button
              className="navbar-toggler navbar-toggler-right"
              type="button"
              data-toggle="collapse"
              data-target="#navbarResponsive"
              aria-controls="navbarResponsive"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              Menu
              <i className="fa fa-bars"></i>
            </button>
            <div className="collapse navbar-collapse" id="navbarResponsive">
              <ul className="navbar-nav text-uppercase ml-auto">
                <li className="nav-item">
                  <a className="nav-link js-scroll-trigger" href="#about">About</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link js-scroll-trigger" href="#skills">Skills</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link js-scroll-trigger" href="#experiences">Experience</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link js-scroll-trigger" href="#projects">Projects</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link js-scroll-trigger" href="#involvements">Involvements</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link js-scroll-trigger" href="#honors">Honors</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link js-scroll-trigger" href="#contact">Contact</a>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="/path/to/resume.pdf" target="_blank" rel="noopener noreferrer">
                    <b><i className="fa fa-file-pdf-o"></i> Resume</b>
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <header className="masthead d-flex" style={{ paddingBottom: '100px' }}>
          <div className="container text-center my-auto">
            <div style={{ paddingBottom: '32px' }}>
              <img
                id="profile_pic"
                src="https://i.ibb.co/N2B7MHS/Kartavya-Profile-Photo.jpg"
                width="250"
                className="img-responsive img-circle"
                style={{ border: '8px solid white' }}
                alt="Kartavya Singh"
              />
            </div>
            <h1 className="mb-1">Kartavya Singh</h1>
            <h3 className="mb-5">
              Full Stack Development | AI Applications | Data Science
            </h3>
            <a className="btn btn-xl btn-light js-scroll-trigger" href="#about">Enter Portfolio</a>
          </div>
          <div className="overlay"></div>
        </header>
      </section>

      {/* Sections */}
      <section id="about" className="content-section">
        <h2>About</h2>
        <p>Brief introduction about yourself and your professional background.</p>
      </section>

      <section id="skills" className="content-section">
        <h2>Skills</h2>
        <p>Highlight your core skills and technologies you work with.</p>
      </section>

      <section id="experiences" className="content-section">
        <h2>Experience</h2>
        <p>List your professional experience with job titles, companies, and dates.</p>
      </section>

      <section id="projects" className="content-section">
        <h2>Projects</h2>
        <p>Showcase some of your best projects with links and descriptions.</p>
      </section>

      <section id="involvements" className="content-section">
        <h2>Involvements</h2>
        <p>List any extracurricular activities, volunteer work, or community involvement.</p>
      </section>

      <section id="honors" className="content-section">
        <h2>Honors & Awards</h2>
        <p>Display your achievements, awards, and recognitions.</p>
      </section>

      <section id="contact" className="content-section">
        <h2>Contact</h2>
        <p>Provide contact information or a form for reaching out.</p>
      </section>
    </div>
  );
}

export default HomePage;
