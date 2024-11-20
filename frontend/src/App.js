import { React, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AppLoad } from "./variants";
import "./App.css";
import Links from "./components/Links";
import NavBar from "./components/NavBar";
import HomePage from "./components/HomePage";
import AboutPage from "./components/AboutPage";
import SkillPage from "./components/SkillPage";
import ExperiencePage from "./components/ExperiencePage";
import ProjectPage from "./components/ProjectPage";
import ContactPage from "./components/ContactPage";
import Footer from "./components/Footer";

function App() {
  const [scrolled, setScrolled] = useState(false);
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <motion.div
      className="App"
      variants={AppLoad("down")}
      initial="initial"
      animate={"show"}
    >
      <NavBar />
      <HomePage />
      <AboutPage />
      <SkillPage />
      <ProjectPage />
      <ExperiencePage />
      <ContactPage />
      <Footer />
      <Links />
      <a
        className={`scroll-to-top ${scrolled ? "show" : ""}`}
        href="#page-top"
        onClick={scrollToTop}
      >
        <i className="fa fa-angle-up"></i>
      </a>
    </motion.div>
  );
}

export default App;
