import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Background from "./Background"
import ButtonShapeTabs from "./Buttons.tsx";
import "../../styles/ExperiencePage.css";
import { HandHeartIcon, Briefcase, Award, Scale } from "lucide-react";

const tabs = [
  { title: "Involvement", icon: <HandHeartIcon /> },
  { title: "Experience", icon: <Briefcase /> },
  { title: "Honors", icon: <Award /> },
];

const tabHighlightVariants = {
  initial: (currentIndex) => ({
    x: `${currentIndex * 120}px`,
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
      duration:0.3
    },
  }),
};

const ExperiencePage = () => {
  const [selectedTab, setSelectedTab] = useState(1); // Default tab is "Experience"

  return (
    <section className="experience-container" id="experience">
    <Background />
    <div className="experience-div">
    <div className="tabs-wrapper">
        {/* Highlight element */}
        <motion.div
          className="tab-highlight"
          custom={selectedTab}
          variants={tabHighlightVariants}
          animate="animate"
          initial="initial"
          
        ></motion.div>

        {tabs.map((tab, index) => (
          <motion.button
            key={tab.title}
            className={`tab-button ${selectedTab === index ? "active" : ""}`}
            onClick={() => setSelectedTab(index)}
          >
            <div className="tab-icon">{tab.icon}</div>
            <AnimatePresence>
              {selectedTab === index && (
                <motion.span
                  initial={{ width: 0, opacity: 0, scale: 0 }}
                  animate={{ width: "auto", opacity: 1, scale: 1 }}
                  whileHover={{width: "auto", opacity: 1, scale: 1 }}
                  exit={{ width: 0, opacity: 0, scale: 0 }}
                  transition={{ duration: 0.1 }}
                  className="tab-text"
                >
                  {tab.title}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        ))}
      </div>

      <ButtonShapeTabs />

      <div className="content-container">
        <p>Currently viewing: {tabs[selectedTab].title}</p>
      </div>
    </div>
    </section>
  );
};

export default ExperiencePage;
