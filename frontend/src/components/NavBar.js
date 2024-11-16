import React, { useState, useEffect, useRef } from "react";
import Resume from "../assets/Singh_Kartavya_Resume2024.pdf";
import "../styles/NavBar.css";

const NavBar = () => {
  const [activeLink, setActiveLink] = useState("home");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null); // Reference to the navbar menu

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    const offset = 52; // Adjust based on your navbar height
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    // Query the sections and navLinks once the component mounts
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(
      "nav .navbar-menu .navbar-links .navbar-link"
    );

    console.log("Sections:");
    sections.forEach((section) => {
      console.log("Class name:", section.className);
    });

    console.log("navLinks:");
    navLinks.forEach((link) => {
      console.log("Link:", link);
    });

    // Active link on scroll
    const handleScroll = () => {
      sections.forEach((section) => {
        let top = window.scrollY;
        let offset = section.offsetTop - 100; // Adjust for header height if needed
        let height = section.offsetHeight;
        let id = section.getAttribute("id");

        if (top >= offset && top < offset + height) {
          navLinks.forEach((link) => {
            link.classList.remove("active");
            if (link.getAttribute("href") === `#${id}`) {
              link.classList.add("active");
            }
          });
        }
      });
    };

    // Initial check to set the active link based on the current scroll position
    handleScroll();

    // Add the scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    // Initial check on load for screen size
    const initialCheck = () => {
      if (window.scrollY > 100 || window.innerWidth < 992) {
        setScrolled(true);
      }
    };

    initialCheck();

    const onScroll = () => {
      if (window.scrollY > 100 || window.innerWidth < 992) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const onUpdateActiveLink = (link) => {
    setActiveLink(link);
    setMenuOpen(false); // Close menu when a link is clicked
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <nav
      ref={menuRef}
      id="mainNav"
      className={scrolled ? "navbar scrolled fixed-top" : "navbar fixed-top"}
    >
      <div className="navbar-container">
        <a
          href="#home"
          className={scrolled ? "scrolled-navbar-brand" : "navbar-brand"}
          onClick={() => {
            onUpdateActiveLink("home");
            if (window.innerWidth >= 992) {
              setScrolled(false);
            }
          }}
        >
          <b>Kartavya Singh</b>
        </a>

        {/* Toggle button for menu */}
        <button
          className="navbar-toggler"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
        >
          Menu <i id="menu-button" className="fa fa-bars"></i>
        </button>

        {/* Conditionally rendered navbar menu */}
        <div className={`navbar-menu ${menuOpen ? "open" : ""}`}>
          <ul className="navbar-links">
            <li
              className={
                activeLink === "about" ? "active nav-item" : "nav-item"
              }
            >
              <a
                href="#about"
                className={
                  activeLink === "about" ? "active navbar-link" : "navbar-link"
                }
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("about");
                  onUpdateActiveLink("about");
                  setScrolled(true);
                }}
              >
                <span className="navbar-text">ABOUT</span>
              </a>
            </li>
            <li
              className={
                activeLink === "skills" ? "active nav-item" : "nav-item"
              }
            >
              <a
                href="#skills"
                className={
                  activeLink === "skills" ? "active navbar-link" : "navbar-link"
                }
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("skills");
                  onUpdateActiveLink("skills");
                  setScrolled(true);
                }}
              >
                <span className="navbar-text">SKILLS</span>
              </a>
            </li>
            <li
              className={
                activeLink === "projects" ? "active nav-item" : "nav-item"
              }
            >
              <a
                href="#projects"
                className={
                  activeLink === "projects"
                    ? "active navbar-link"
                    : "navbar-link"
                }
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("projects");
                  onUpdateActiveLink("projects");
                  setScrolled(true);
                }}
              >
                <span className="navbar-text">PROJECTS</span>
              </a>
            </li>
            <li
              className={
                activeLink === "experience" ? "active nav-item" : "nav-item"
              }
            >
              <a
                href="#experience"
                className={
                  activeLink === "experience"
                    ? "active navbar-link"
                    : "navbar-link"
                }
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("experience");
                  onUpdateActiveLink("experience");
                  setScrolled(true);
                }}
              >
                <span className="navbar-text">EXPERIENCE</span>
              </a>
            </li>
            <li
              className={
                activeLink === "contact" ? "active nav-item" : "nav-item"
              }
            >
              <a
                href="#contact"
                className={
                  activeLink === "contact"
                    ? "active navbar-link"
                    : "navbar-link"
                }
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("contact");
                  onUpdateActiveLink("contact");
                  setScrolled(true);
                }}
              >
                <span className="navbar-text">CONTACT</span>
              </a>
            </li>
            <li className="nav-item">
              <a
                download="Kartavya-Singh-Resume-2024.pdf"
                href={Resume}
                className="navbar-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="navbar-text">
                  <i className="fa fa-file-pdf-o"></i> RESUME
                </span>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
