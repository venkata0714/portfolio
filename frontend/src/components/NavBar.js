import React, { useState, useEffect } from 'react';
import {Nav, Navbar, Container } from 'react-bootstrap';
import '../styles/NavBar.sass';
import ResumeLogo from '../assets/img/ResumeLogo.png'; // Adjust the path if necessary
import ProfilePicture from '../assets/img/Kartavya-Profile-Photo.jpg'
import navLinkedin from '../assets/img/linkedin.svg'
import navGitHub from '../assets/img/github.svg'
import navInstagram from '../assets/img/instagram.svg'

const NavBar = () => {
  const [activeLink, setActiveLink] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onUpdateActiveLink = (link) => {
    setActiveLink(link);
  };

  return (
    <Navbar expand="lg" className={scrolled ? "scrolled" : ""}>
      <Container>
        <Navbar.Brand href="#home">
          <img src={ProfilePicture} alt="Logo" className="brand-logo" /> Kartavya Singh
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav">
          <span className="navbar-toggler-icon"></span>
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link href="#about" className={activeLink === "home" ? "active navbar-link" : "navbar-link"} onCLick={() => onUpdateActiveLink("home")}>ABOUT</Nav.Link>
            <Nav.Link href="#skills" className={activeLink === "skills" ? "active navbar-link" : "navbar-link"} onCLick={() => onUpdateActiveLink("skills")}>SKILLS</Nav.Link>
            <Nav.Link href="#projects" className={activeLink === "projects" ? "active navbar-link" : "navbar-link"} onCLick={() => onUpdateActiveLink("projects")}>PROJECTS</Nav.Link>
            <Nav.Link href="#experience" className={activeLink === "experience" ? "active navbar-link" : "navbar-link"} onCLick={() => onUpdateActiveLink("experience")}>EXPERIENCE</Nav.Link>
            <Nav.Link href="#contact" className={activeLink === "contact" ? "active navbar-link" : "navbar-link"} onCLick={() => onUpdateActiveLink("contact")}>CONTACT</Nav.Link>
          </Nav>
          <span className="navbar-text">
            <div className="social-icon">
              <a href="https://www.linkedin.com/in/kartavya-singh-singhk6/" target="_blank" rel="noopener noreferrer"><img src={navLinkedin} alt="" /></a>
              <a href="https://github.com/Kartavya904" target="_blank" rel="noopener noreferrer"><img src={navGitHub} alt="" /></a>
              <a href="https://www.instagram.com/kartavya1710/" target="_blank" rel="noopener noreferrer"><img src={navInstagram} alt="" /></a>
            </div>
            <button className="btn btn-primary" onClick={() => console.log("Download Resume...")}><span>Download Resume</span></button>
          </span>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
};

export default NavBar;
