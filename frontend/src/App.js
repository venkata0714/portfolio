import { React, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AppLoad } from "./services/variants";
import "./App.css";
import Links from "./components/SpecialComponents/Links";
import NavBar from "./components/SpecialComponents/NavBar";
import HomePage from "./components/HomePage/HomePage";
import AboutPage from "./components/AboutPage/AboutPage";
import SkillPage from "./components/SkillPage/SkillPage";
import ExperiencePage from "./components/ExperiencePage/ExperiencePage";
import ProjectPage from "./components/ProjectPage/ProjectPage";
import ContactPage from "./components/ContactPage/ContactPage";
import WindowModal from "./components/WindowModal/WindowModal";

const sampleTabsData = [
  { type: "Project", label: "Project 1", data: { title: "My Project", description: "A sample project.", link: "#" } },
  { type: "Experience", label: "Experience 1", data: { company: "My Company", role: "Developer", duration: "2021-2023" } },
  
];

function App() {
  const [scrolled, setScrolled] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
    <AnimatePresence>
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
        <Links />
        <a
          className={`scroll-to-top ${scrolled ? "show" : ""}`}
          href="#page-top"
          onClick={scrollToTop}
        >
          <i className="fa fa-angle-up"></i>
        </a>
        <button className="open-modal-btn" onClick={() => setShowModal(true)}>
          Open WindowModal
        </button>
        {showModal && (
          <WindowModal
            tabsData={sampleTabsData}
            onClose={() => setShowModal(false)}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
