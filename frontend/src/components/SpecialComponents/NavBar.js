import React, { useState, useEffect, useRef } from "react";
import Resume from "../../assets/Singh_Kartavya_Resume2025.pdf";
import { motion } from "framer-motion";
import { fadeIn } from "../../services/variants";
import "../../styles/NavBar.css";

const NavBar = ({ isBatterySavingOn }) => {
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
    const updateScale = () => {
      const homeRow = document.querySelector(".navbar-container");
      if (!homeRow) return;
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;
      let scaleValue = 1;
      if (screenHeight < 826 && screenWidth > 576) {
        scaleValue = screenHeight / 826;
      }
      homeRow.style.zoom = `${scaleValue}`;
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  useEffect(() => {
    // Query the sections and navLinks once the component mounts
    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(
      "nav .navbar-menu .navbar-links .navbar-link"
    );
    let scrollTimer = null; // Timer to detect scroll end

    // console.log("Sections:");
    // sections.forEach((section) => {
    //   // console.log("Class name:", section.className);
    // });

    // console.log("navLinks:");
    // navLinks.forEach((link) => {
    //   // console.log("Link:", link);
    // });

    const handleScroll = () => {
      // Clear any existing timer
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }

      // Update active links dynamically during scroll
      sections.forEach((section) => {
        let top = window.scrollY;
        let offset = section.offsetTop - 53; // Adjust for header height
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

      // Set a new timer to detect scroll end
      scrollTimer = setTimeout(() => {
        let nearestSection = null;
        let nearestDistance = Infinity;

        sections.forEach((section) => {
          const offset = section.offsetTop - 52; // Adjust for header height
          const height = section.offsetHeight;
          const sectionCenter = offset + height / 2;
          const viewportCenter = window.scrollY + window.innerHeight / 2;
          const distance = Math.abs(sectionCenter - viewportCenter);

          if (distance < nearestDistance) {
            nearestSection = section;
            nearestDistance = distance;
          }
        });

        // Snap to the nearest section if within snapping range
        if (nearestSection && nearestDistance <= 180) {
          const id = nearestSection.getAttribute("id");
          if (id && id !== "contact" && id !== "projects") {
            scrollToSection(id);
          }
        }
      }, 1000); // Adjust debounce delay as needed (100ms here)
    };

    // Add the scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Clean up event listener on component unmount
    return () => {
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }
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
          variants={fadeIn("right", 40, 0)}
          initial="hidden"
          animate="show"
          // drag
          // dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
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
          transition={{ duration: 1 }}
          drag
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.3}
          dragTransition={{
            bounceStiffness: 250,
            bounceDamping: 15,
          }}
          aria-expanded={menuOpen}
        >
          Menu <i id="menu-button" className="fa fa-bars"></i>
        </motion.button>

        {/* Conditionally rendered navbar menu */}
        <motion.div
          className={`navbar-menu ${menuOpen ? "open" : ""}`}
          variants={fadeIn("left", 40, 0)}
          initial="hidden"
          animate="show"
        >
          <motion.ul className="navbar-links">
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
                download="Kartavya-Singh-Resume-2025.pdf"
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
        </motion.div>
      </div>
    </motion.nav>
  );
};

export default NavBar;
