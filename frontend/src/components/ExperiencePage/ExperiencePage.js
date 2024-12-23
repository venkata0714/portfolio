import React, { useState } from "react";
import { motion } from "framer-motion";
import Background from "./Background";
import InvolvementTabPage from "./InvolvementTabPage";
import CareerTabPage from "./CareerTabPage";
import HonorsTabPage from "./HonorsTabPage";
import "../../styles/ExperiencePage.css";

const tabs = [
  {
    title: "Involvement",
    icon: <i className="tab-icon fa-solid fa-handshake"></i>,
    component: InvolvementTabPage,
  },
  {
    title: "Career",
    icon: <i className="tab-icon fa-solid fa-briefcase"></i>,
    component: CareerTabPage,
  },
  {
    title: "Honors",
    icon: <i className="tab-icon fa-solid fa-trophy"></i>,
    component: HonorsTabPage,
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

const tabHighlightVariants = {
  initial: (currentIndex) => ({
    x: `${currentIndex * 12}px`,
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

const ExperiencePage = ({ addTab }) => {
  const [selectedTab, setSelectedTab] = useState(tabs[1]); // Default tab is "Career"
  const [ActiveComponent, setActiveComponent] = useState(
    () => selectedTab.component
  );

  return (
    <section className="experience-container" id="experience">
      <Background />
      <div className="experience-div">
        <motion.div className="tabs-wrapper">
          <motion.div
            className="tab-highlight"
            key={`tab-${selectedTab}`}
            custom={tabs.indexOf(selectedTab)}
            variants={tabHighlightVariants}
            animate="animate"
            initial="initial"
          />
          {tabs.map((tab) => (
            <motion.button
              key={tab.title}
              className={`tab-button ${
                selectedTab.title === tab.title ? "active" : ""
              }`}
              onClick={() => {
                setSelectedTab(tab);
                setActiveComponent(() => tab.component);
                scrollToSection("experience");
              }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.3}
              dragTransition={{
                bounceStiffness: 250,
                bounceDamping: 17,
              }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ delay: 0, type: "spring" }}
            >
              {tab.icon}
              {selectedTab.title === tab.title && (
                <span className="tab-text">{tab.title}</span>
              )}
            </motion.button>
          ))}
        </motion.div>
        <div className="content-container">
          <ActiveComponent addTab={addTab} />
        </div>
      </div>
    </section>
  );
};

export default ExperiencePage;
