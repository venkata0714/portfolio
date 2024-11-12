import React, { useState, useEffect } from 'react';
import '../styles/NavBar.css';

const NavBar = () => {
  const [activeLink, setActiveLink] = useState("home");
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 100) {
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
    <div id="mainNav" className={scrolled ? "navbar scrolled fixed-top" : "navbar fixed-top"}>
      <div className="navbar-container">
        {/*Name On the Left */}
        <a href="#home" className={scrolled ? "scrolled-navbar-brand" : "navbar-brand"} onClick={() => onUpdateActiveLink("home")}><b>Kartavya Singh</b></a>
        {/* Collapsible Navbar Links In the Right, With Space Between */}
        <div className="navbar-menu">
          <ul className="navbar-links">
            <li className='nav-item'><a href="#about" className={activeLink === "about" ? "active navbar-link" : "navbar-link"} onClick={() => onUpdateActiveLink("about")}>ABOUT</a></li>
            <li className='nav-item'><a href="#skills" className={activeLink === "skills" ? "active navbar-link" : "navbar-link"} onClick={() => onUpdateActiveLink("skills")}>SKILLS</a></li>
            <li className='nav-item'><a href="#projects" className={activeLink === "projects" ? "active navbar-link" : "navbar-link"} onClick={() => onUpdateActiveLink("projects")}>PROJECTS</a></li>
            <li className='nav-item'><a href="#experience" className={activeLink === "experience" ? "active navbar-link" : "navbar-link"} onClick={() => onUpdateActiveLink("experience")}>EXPERIENCE</a></li>
            <li className='nav-item'><a href="#contact" className={activeLink === "contact" ? "active navbar-link" : "navbar-link"} onClick={() => onUpdateActiveLink("contact")}>CONTACT</a></li>
            <li className='nav-item'><a href="https://mailuc-my.sharepoint.com/:b:/g/personal/singhk6_mail_uc_edu/Efzdo8ozdSpInJYqJzLLqkcBW7n1fw4DKwYT2GdOkuByVg" className="resume-link" target="_blank" rel="noopener noreferrer"><i class="fa fa-file-pdf-o"></i><span className='navbar-link'>RESUME</span></a></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
