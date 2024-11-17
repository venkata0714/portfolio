import React, { useState, useEffect, useRef } from "react";
import Resume from "../assets/Singh_Kartavya_Resume2024.pdf";
import { motion } from "framer-motion";
import { fadeIn, zoomIn } from "../variants";
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
      transitionDuration: "5s",
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
    <motion.nav
      ref={menuRef}
      id="mainNav"
      className={scrolled ? "navbar scrolled fixed-top" : "navbar fixed-top"}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="navbar-container">
        <motion.a
          href="#home"
          className={scrolled ? "scrolled-navbar-brand" : "navbar-brand"}
          variants={fadeIn("right", 40, 1)}
          initial="hidden"
          animate="show"
          onClick={() => {
            onUpdateActiveLink("home");
            if (window.innerWidth >= 992) {
              setScrolled(false);
            }
          }}
        >
          <b>Kartavya Singh</b>
        </motion.a>

        {/* Toggle button for menu */}
        <motion.button
          className="navbar-toggler"
          onClick={() => setMenuOpen(!menuOpen)}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ delay: 1 }}
          aria-expanded={menuOpen}
        >
          Menu <i id="menu-button" className="fa fa-bars"></i>
        </motion.button>

        {/* Conditionally rendered navbar menu */}
        <div className={`navbar-menu ${menuOpen ? "open" : ""}`}>
          <motion.ul
            className="navbar-links"
            variants={fadeIn("left", 40, 1)}
            initial="hidden"
            animate="show"
          >
            <li
              className={
                activeLink === "about" ? "active nav-item" : "nav-item"
              }
            >
              <motion.a
                href="#about"
                className={
                  activeLink === "about" ? "active navbar-link" : "navbar-link"
                }
                whileHover={{ scale: 4 }}
                whileTap={{ scale: 0.9 }}
                transition={{ duration: 0.5, type: "transition" }}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection("about");
                  onUpdateActiveLink("about");
                  setScrolled(true);
                }}
              >
                <span className="navbar-text">ABOUT</span>
              </motion.a>
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
          </motion.ul>
        </div>
      </div>
    </motion.nav>
  );
};

export default NavBar;
