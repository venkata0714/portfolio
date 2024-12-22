import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Background from "./Background";
import InvolvementTabPage from "./InvolvementTabPage";
import CareerTabPage from "./CareerTabPage";
import HonorsTabPage from "./HonorsTabPage";
import "../../styles/ExperiencePage.css";

const tabs = [
  {
    title: "Involvement",
    icon: <i className="tab-icon fa-solid fa-handshake"></i>,
  },
  { title: "Career", icon: <i className="tab-icon fa-solid fa-briefcase"></i> },
  { title: "Honors", icon: <i className="tab-icon fa-solid fa-trophy"></i> },
];

const tabComponents = {
  Involvement: InvolvementTabPage,
  Career: CareerTabPage,
  Honors: HonorsTabPage,
};

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

const tabHighlightVariants = {
  initial: (currentIndex) => ({
    x: `${currentIndex * 120}px`,
    width: 0,
    opacity: 0,
    scale: 0,
    transition: { duration: 0.3 },
  }),
  animate: (targetIndex) => ({
    x: `${targetIndex * 120}px`,
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 40,
      duration: 0.3,
    },
  }),
};

const ExperiencePage = () => {
  const [selectedTab, setSelectedTab] = useState(1); // Default tab is "Involvement"
  const ActiveTabComponent = tabComponents[tabs[selectedTab].title];
  return (
    <section className="experience-container" id="experience">
      <Background />
      <div className="experience-div">
        <div className="tabs-wrapper">
          <motion.div
            className="tab-highlight"
            custom={selectedTab}
            variants={tabHighlightVariants}
            animate="animate"
            initial="initial"
          />
          {tabs.map((tab, index) => (
            <motion.button
              key={tab.title}
              className={`tab-button ${selectedTab === index ? "active" : ""}`}
              onClick={() => {
                setSelectedTab(index);
                scrollToSection("experience");
              }}
            >
              {tab.icon}
              <AnimatePresence>
                {selectedTab === index && (
                  <motion.span
                    initial={{ width: 0, opacity: 0, scale: 0 }}
                    animate={{ width: "auto", opacity: 1, scale: 1 }}
                    whileHover={{ width: "auto", opacity: 1, scale: 1 }}
                    exit={{ width: 0, opacity: 0, scale: 0 }}
                    transition={{ duration: 0.3 }}
                    className="tab-text"
                  >
                    {tab.title}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </div>
        <div className="content-container">
          <motion.div
            key={selectedTab}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 0.5 }}
          >
            <ActiveTabComponent />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ExperiencePage;
