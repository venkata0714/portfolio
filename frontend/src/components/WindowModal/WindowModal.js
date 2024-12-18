import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/WindowModal.css";
import ProjectTab from "./ProjectTab";
import ExperienceTab from "./ExperienceTab";
import InvolvementTab from "./InvolvementTab";
import HonorsTab from "./HonorsTab";

const WindowModal = ({ tabsData, onClose }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState(tabsData[0]?.type || "");
  const modalRef = useRef(null);

  const renderTabContent = (type, data) => {
    switch (type) {
      case "Project":
        return <ProjectTab data={data} />;
      case "Experience":
        return <ExperienceTab data={data} />;
      case "Involvement":
        return <InvolvementTab data={data} />;
      case "Honors":
        return <HonorsTab data={data} />;
      default:
        return null;
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsMinimized(true);
      }
    };

    const handleScrollOutside = () => {
      setIsMinimized(true);
    };

    if (!isMinimized) {
      document.body.style.overflow = "hidden";
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScrollOutside);
    }

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScrollOutside);
    };
  }, [isMinimized]);

  return (
    <AnimatePresence>
      {isMinimized ? (
        <motion.div
          className="minimized-icon"
          onClick={() => setIsMinimized(false)}
          title="Click to maximize"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          🪟
        </motion.div>
      ) : (
        <motion.div
          className="window-modal"
          ref={modalRef}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="title-bar">
            <div className="tabs">
              {tabsData.map((tab, index) => (
                <motion.div
                  key={index}
                  className={`tab ${activeTab === tab.type ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.type)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {tab.label}
                </motion.div>
              ))}
            </div>
            <div className="controls">
              <motion.button
                className="control-btn"
                onClick={() => setIsMinimized(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                —
              </motion.button>
              <motion.button
                className="control-btn"
                onClick={onClose}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                ✕
              </motion.button>
            </div>
          </div>
          <motion.div
            className="content"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 30, opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {renderTabContent(
              activeTab,
              tabsData.find((tab) => tab.type === activeTab)
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WindowModal;
