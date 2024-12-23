import React from "react";
import { motion } from "framer-motion";
import "../../styles/Footer.css";

const Footer = () => {
  const linksData = [
    {
      href: "https://github.com/Kartavya904",
      icon: require("../../assets/img/icons/github.png"),
      label: "GitHub",
    },
    {
      href: "https://devpost.com/Kartavya904",
      icon: require("../../assets/img/icons/devpost.png"),
      label: "DevPost",
    },
    {
      href: "https://www.linkedin.com/in/kartavya-singh-singhk6",
      icon: require("../../assets/img/icons/linkedin.png"),
      label: "LinkedIn",
    },
    {
      href: "https://www.instagram.com/kartavya1710/",
      icon: require("../../assets/img/icons/instagram.png"),
      label: "Instagram",
    },
    {
      href: "https://discordapp.com/users/439541365580365835",
      icon: require("../../assets/img/icons/discord.png"),
      label: "Discord",
    },
    {
      href: "https://calendly.com/singhk6/book-time-with-kartavya",
      icon: require("../../assets/img/icons/calender.png"),
      label: "Book Time with Kartavya",
    },
    {
      href: "mailto:singhk6@mail.uc.edu",
      icon: require("../../assets/img/icons/email.png"),
      label: "Email",
    },
  ];

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

  return (
    <motion.footer
      className="footer"
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header Section */}
      <motion.div
        className="footer-header"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0, type: "spring" }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onTap={() => scrollToSection("home")}
      >
        <h2>Kartavya Singh</h2>
        <p>Creating Impactful Solutions Through Code</p>
      </motion.div>

      {/* Navigation Links */}
      <motion.ul
        className="footer-navlinks"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0, type: "spring" }}
      >
        {["about", "skills", "projects", "experience"].map((id, index) => (
          <li key={id}>
            <motion.button
              onClick={() => scrollToSection(id)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 * index, type: "ease" }}
            >
              {id.charAt(0).toUpperCase() + id.slice(1)}
            </motion.button>
          </li>
        ))}
      </motion.ul>

      {/* Social Links */}
      <motion.div
        className="footer-social"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0, type: "spring" }}
      >
        {linksData.map((link, index) => (
          <motion.a
            key={index}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            title={link.label}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.3}
            dragTransition={{
              bounceStiffness: 250,
              bounceDamping: 15,
            }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.01, rotate: 360 }}
            whileTap={{ scale: 0.99, rotate: 0 }}
            transition={{ delay: 0, type: "spring" }}
          >
            <motion.img
              src={link.icon}
              alt={link.label}
              className="footer-icon"
              drag="false"
            />
          </motion.a>
        ))}
      </motion.div>

      {/* Footer Bottom */}
      <motion.div
        className="footer-bottom"
        initial={{ opacity: 0, scale: 0 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0, type: "spring" }}
      >
        <p>
          &copy; {new Date().getFullYear()} Kartavya Singh. All rights reserved.
        </p>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;
