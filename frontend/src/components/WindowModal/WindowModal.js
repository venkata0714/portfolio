import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/WindowModal.css";
import windowIcon from "../../assets/img/icons/window.svg";
import ProjectTab from "./ProjectTab";
import ExperienceTab from "./ExperienceTab";
import InvolvementTab from "./InvolvementTab";
import HonorsTab from "./HonorsTab";

const WindowModal = ({ tabs, setTabs, isClosed, setIsClosed, scrolled }) => {
  const [lastActiveIndex, setLastActiveIndex] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false); // State for minimization
  const [currentTabContent, setCurrentTabContent] = useState(null); // State for current tab content
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsMinimized(true); // Minimize if clicking outside
      }
    };

    // Attach event listeners
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Cleanup event listeners
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef]);

  useEffect(() => {
    const modalElement = document.querySelector(".window-modal");
    const minimizedIcom = document.querySelector(".minimized-icon");
    // Disable/enable scrolling
    if (!isClosed && !isMinimized) {
      document.body.style.overflow = "hidden"; // Disable scrolling
    } else {
      document.body.style.overflow = ""; // Enable scrolling
    }
    if (!isMinimized) {
      if (modalElement) {
        if (scrolled) {
          modalElement.style.top = "52px";
          modalElement.style.height = "calc(100vh - 52px)";
        } else {
          modalElement.style.top = "65px";
          modalElement.style.height = "calc(100vh - 65px)";
        }
      }
    } else {
      if (minimizedIcom) {
        minimizedIcom.style.top = "";
        minimizedIcom.style.height = "50px";
        minimizedIcom.style.bottom = "20px";
      }
    }

    return () => {
      document.body.style.overflow = ""; // Cleanup on unmount
    };
  }, [isClosed, isMinimized, scrolled]);

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

  const updateCurrentTabContent = () => {
    if (tabs.length > 0 && tabs[lastActiveIndex]) {
      const activeTab = tabs[lastActiveIndex];
      setCurrentTabContent(renderTabContent(activeTab.type, activeTab.data));
    } else {
      setCurrentTabContent(null); // Clear content if no tabs are available
    }
  };

  useEffect(() => {
    updateCurrentTabContent();
  }, [lastActiveIndex, isClosed, isMinimized, tabs]);

  const closeTab = (index) => {
    const updatedTabs = tabs
      .filter((tab) => tab.index !== index)
      .map((tab) => ({
        ...tab,
        index: tab.index > index ? tab.index - 1 : tab.index,
      }));

    setTabs(updatedTabs);

    if (updatedTabs.length === 0) {
      setLastActiveIndex(0);
      setIsClosed(true);
      setIsMinimized(false); // Reset minimization
    } else if (lastActiveIndex >= index) {
      setLastActiveIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleCloseModal = () => {
    setTabs([]);
    setLastActiveIndex(0);
    setIsClosed(true);
    setIsMinimized(false); // Reset minimization
  };

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsClosed(false); // Ensure modal is not completely closed
  };

  const handleRestore = () => {
    setIsMinimized(false);
  };

  useEffect(() => {
    // Automatically restore the modal if it is minimized and a new tab is added
    if (isMinimized && tabs.length > 0) {
      setLastActiveIndex(tabs.length - 1);
      setIsMinimized(false);
      setIsClosed(false);
    }
  }, [tabs]);

  return (
    <AnimatePresence>
      {!isClosed ? (
        isMinimized ? (
          <motion.div
            className="minimized-icon"
            onClick={handleRestore}
            title="Click to maximize"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.3}
            dragTransition={{
              bounceStiffness: 250,
              bounceDamping: 15,
            }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9, rotate: 360 }}
            transition={{ duration: 0, delay: 0, type: "spring" }}
          >
            <motion.div className="minimized-icon-image">
              <img className="icon-image" src={windowIcon} alt="" />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className="window-modal"
            ref={modalRef}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              scale: [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0],
              opacity: [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0],
            }}
            transition={{ duration: 0.7, type: "spring", delay: 0 }}
            onLoad={handleRestore}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="window-content">
              <div className="title-bar">
                <div className="tabs">
                  {tabs.map((tab) => (
                    <div
                      key={`tab-${tab.index}`}
                      className={`tab ${
                        lastActiveIndex === tab.index ? "active" : ""
                      }`}
                      onClick={() => setLastActiveIndex(tab.index)}
                      style={{ width: "33%" }}
                    >
                      <div className="tab-title">{tab.name}</div>
                      <div
                        className="close-tab"
                        onClick={(e) => {
                          e.stopPropagation();
                          closeTab(tab.index);
                        }}
                      >
                        ✕
                      </div>
                    </div>
                  ))}
                </div>
                <div className="controls">
                  <button
                    className="control-btn minimize"
                    onClick={handleMinimize}
                  >
                    —
                  </button>
                  <button
                    className="control-btn close"
                    onClick={handleCloseModal}
                  >
                    ✕
                  </button>
                </div>
              </div>
              <motion.div
                className="content"
                // key={lastActiveIndex}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ duration: 0.4, type: "spring" }}
              >
                {tabs.length > 0 &&
                  renderTabContent(
                    tabs[lastActiveIndex]?.type,
                    tabs[lastActiveIndex]?.data
                  )}
              </motion.div>
            </div>
          </motion.div>
        )
      ) : null}
    </AnimatePresence>
  );
};

export default WindowModal;
