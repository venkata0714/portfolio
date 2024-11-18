import React from "react";
import { motion } from "framer-motion";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <motion.footer
      className="footer"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div class="waves">
        <div class="wave" id="wave1"></div>
        <div class="wave" id="wave2"></div>
        <div class="wave" id="wave3"></div>
        <div class="wave" id="wave4"></div>
      </div>
      <div className="footer-container">
        {/* Animated Logo */}
        <motion.div
          className="footer-logo"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3 }}
        >
          <h2>Kartavya Singh</h2>
          <p>Creating impactful solutions through code.</p>
        </motion.div>

        {/* Animated Links */}
        <motion.ul
          className="footer-links"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <li>
            <a href="#about">About</a>
          </li>
          <li>
            <a href="#projects">Projects</a>
          </li>
          <li>
            <a href="#contact">Contact</a>
          </li>
        </motion.ul>

        {/* Animated Social Links */}
        <div className="footer-social">
          <motion.a
            href="https://linkedin.com/in/kartavyasingh"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <i className="fab fa-linkedin"></i>
          </motion.a>
          <motion.a
            href="https://github.com/kartavyasingh"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.2, rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <i className="fab fa-github"></i>
          </motion.a>
          <motion.a
            href="mailto:singhk6@mail.uc.edu"
            whileHover={{ scale: 1.2, rotate: 360 }}
            transition={{ duration: 0.5 }}
          >
            <i className="fas fa-envelope"></i>
          </motion.a>
        </div>
      </div>

      {/* Footer Bottom Text */}
      <motion.div
        className="footer-bottom"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
      >
        <p>
          &copy; {new Date().getFullYear()} Kartavya Singh. All rights reserved.
        </p>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;
