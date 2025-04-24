import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "../../styles/WindowModal.css";
import windowIcon from "../../assets/img/icons/window.svg";
import AdminTab from "./AdminTab"; // Add this import
import ProjectTab from "./ProjectTab";
import ExperienceTab from "./ExperienceTab";
import InvolvementTab from "./InvolvementTab";
import HonorsTab from "./HonorsTab";
import YearInReviewTab from "./YearInReviewTab";
import ProjectsListView from "../ProjectPage/ProjectsListView";
import FeedTab from "./FeedTab";
import AIChatTab from "./AIChatTab";

const WindowModal = ({
  tabs,
  addTab,
  setTabs,
  isClosed,
  setIsClosed,
  isMinimized,
  setIsMinimized,
  lastActiveIndex,
  setLastActiveIndex,
  scrolled,
  isBatterySavingOn,
  loggedIn,
  setLoggedIn,
  isWindowModalVisible,
  setIsWindowModalVisible,
  chatHistory,
  setChatHistory,
}) => {
  const modalRef = useRef(null);
  const [totalTabs, setTotalTabs] = useState(0);

  useEffect(() => {
    setTotalTabs(tabs.length);
  }, [tabs]);

  useEffect(() => {
    if (tabs.length > 0 && !isClosed && !isMinimized) {
      setIsWindowModalVisible(true);
      // console.log("WindowModal is visible");
    } else {
      setIsWindowModalVisible(false);
      // console.log("WindowModal is hidden");
    }
  }, [tabs, setIsWindowModalVisible, isClosed, isMinimized]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        if (
          event.target.closest(".feed-nav") ||
          event.target.closest(".ai-chat-nav") ||
          event.target.closest(".navbar-toggler")
        )
          return;
        setIsMinimized(true); // Minimize if clicking outside
      }
    };

    // Attach event listeners
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      // Cleanup event listeners
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [modalRef, setIsMinimized]);

  useEffect(() => {
    const modalElement = document.querySelector(".window-modal");
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
          modalElement.style.height = "calc(100dvh - 52px)";
        } else {
          modalElement.style.top = "65px";
          modalElement.style.height = "calc(100dvh - 65px)";
        }
      }
    }

    return () => {
      if (!isClosed && !isMinimized) {
        document.body.style.overflow = "hidden"; // Disable scrolling
      } else {
        document.body.style.overflow = ""; // Enable scrolling
      }
    };
  }, [isClosed, isMinimized, scrolled]);

  const renderTabContent = (type, data) => {
    switch (type) {
      case "Project":
        return <ProjectTab data={data} isBatterySavingOn={isBatterySavingOn} />;
      case "Experience":
        return (
          <ExperienceTab data={data} isBatterySavingOn={isBatterySavingOn} />
        );
      case "Involvement":
        return (
          <InvolvementTab data={data} isBatterySavingOn={isBatterySavingOn} />
        );
      case "Honors":
        return <HonorsTab data={data} isBatterySavingOn={isBatterySavingOn} />;
      case "YearInReview":
        return (
          <YearInReviewTab data={data} isBatterySavingOn={isBatterySavingOn} />
        );
      case "ProjectsListView":
        return (
          <ProjectsListView
            addTab={addTab}
            isBatterySavingOn={isBatterySavingOn}
            showStarred={false}
          />
        );
      case "Admin": // Add this new case
        return (
          <AdminTab
            data={data}
            isBatterySavingOn={isBatterySavingOn}
            loggedIn={loggedIn}
            setLoggedIn={setLoggedIn}
          />
        );
      case "FeedTab":
        return <FeedTab isBatterySavingOn={isBatterySavingOn} />;
      case "AIChatTab":
        return (
          <AIChatTab
            chatHistory={chatHistory}
            setChatHistory={setChatHistory}
            scrolled={scrolled}
          />
        );
      default:
        return null;
    }
  };

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

  useEffect(() => {
    const updateScale = () => {
      const windowContent = document.querySelector(".window-content");
      const minimizedIcon = document.querySelector(".minimized-icon");
      if (!windowContent && !minimizedIcon) return;
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;
      let scaleValue = 1;
      if (screenHeight < 826 && screenWidth > 576) {
        scaleValue = screenHeight / 826;
      }
      if (windowContent) {
        windowContent.style.zoom = `${scaleValue}`;
      }
      if (minimizedIcon) {
        minimizedIcon.style.height = `${scaleValue}`;
      }
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [tabs, isMinimized, isClosed]);

  return (
    <AnimatePresence>
      {!isClosed ? (
        isMinimized ? (
          <motion.div
            className="minimized-icon"
            onClick={handleRestore}
            title="Click to maximize"
            initial={isBatterySavingOn ? {} : { opacity: 0, scale: 0 }}
            animate={isBatterySavingOn ? {} : { opacity: 1, scale: 1 }}
            exit={isBatterySavingOn ? {} : { opacity: 0, scale: 0 }}
            drag
            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
            dragElastic={0.3}
            dragTransition={{
              bounceStiffness: 250,
              bounceDamping: 15,
            }}
            // whileInView={{ opacity: 1, scale: 1 }}
            whileHover={isBatterySavingOn ? {} : { scale: 1.1 }}
            whileTap={isBatterySavingOn ? {} : { scale: 0.9, rotate: 360 }}
            transition={
              isBatterySavingOn ? {} : { duration: 0, delay: 0, type: "spring" }
            }
          >
            <motion.div className="minimized-icon-image">
              <motion.img
                className="icon-image"
                initial={
                  isBatterySavingOn ? {} : { opacity: 0, scale: 0, rotate: 0 }
                }
                animate={
                  isBatterySavingOn ? {} : { opacity: 1, scale: 1, rotate: 360 }
                }
                exit={
                  isBatterySavingOn ? {} : { opacity: 0, scale: 0, rotate: 0 }
                }
                transition={
                  isBatterySavingOn
                    ? {}
                    : { duration: 0.5, delay: 0, type: "spring" }
                }
                src={windowIcon}
                drag="false"
                alt=""
              />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            className="window-modal"
            ref={modalRef}
            initial={
              isBatterySavingOn
                ? {}
                : {
                    scale: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
                    opacity: [
                      0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,
                    ],
                  }
            }
            animate={
              isBatterySavingOn
                ? {}
                : {
                    scale: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1],
                    opacity: [
                      0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1,
                    ],
                  }
            }
            exit={
              isBatterySavingOn
                ? {}
                : {
                    scale: [1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0],
                    opacity: [
                      1, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1, 0,
                    ],
                  }
            }
            transition={
              isBatterySavingOn ? {} : { type: "ease", delay: 0, duration: 0.5 }
            }
            onLoad={handleRestore}
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => e.stopPropagation()}
          >
            <div className="window-content">
              <motion.div className="header-bar">
                <div className="header-text">
                  Portfolio Explorer | Items: {totalTabs}/3
                </div>
              </motion.div>
              <motion.div className="title-bar">
                <div className="tabs">
                  {tabs.map((tab) => (
                    <div
                      key={`tab-${tab.index}`}
                      className={`tab ${
                        lastActiveIndex === tab.index ? "active" : ""
                      }`}
                      onClick={() => setLastActiveIndex(tab.index)}
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
              </motion.div>
              <motion.div
                className="content"
                // key={lastActiveIndex}
                initial={isBatterySavingOn ? {} : { scale: 0, opacity: 0 }}
                whileInView={isBatterySavingOn ? {} : { scale: 1, opacity: 1 }}
                exit={isBatterySavingOn ? {} : { scale: 0, opacity: 0 }}
                transition={isBatterySavingOn ? {} : { type: "ease" }}
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
