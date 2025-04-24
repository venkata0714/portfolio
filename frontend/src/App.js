import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { animated } from "@react-spring/web";
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
import PowerMode from "./components/SpecialComponents/PowerMode";
// import { cleanupEventListeners } from "./services/eventListenerRegistry";

function App({ isBatterySavingOn, setIsBatterySavingOn }) {
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [tabs, setTabs] = useState([]); // Tabs state for WindowModal
  const [isClosed, setIsClosed] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false); // Track if modal is minimized
  const [lastActiveIndex, setLastActiveIndex] = useState(0); // Track active tab index
  const [isWindowModalVisible, setIsWindowModalVisible] = useState(false);
  const [chatHistory, setChatHistory] = useState([]); // {id, sender, text}
  const [showChatTip, setShowChatTip] = useState(() => {
    // hide forever if user previously closed
    return localStorage.getItem("hideAIChatTip") !== "true";
  });

  const dismissChatTip = () => {
    setShowChatTip(false);
    localStorage.setItem("hideAIChatTip", "true");
  };

  // useEffect(() => {
  //   const cleanupInterval = setInterval(() => {
  //     // Clean up listeners that haven't been active for over 60 seconds
  //     const remainingListeners = cleanupEventListeners(1000);
  //     // Optionally, you can log or set state with the remaining listeners count
  //     console.log("Remaining listeners:", remainingListeners.length);
  //   }, 10000);

  //   return () => clearInterval(cleanupInterval);
  // }, []);

  const addTab = (type, data) => {
    if (!data || typeof data !== "object") {
      console.error("Invalid data passed to addTab:", data);
      return;
    }

    setTabs((prev) => {
      const existingTabIndex = prev.findIndex(
        (tab) =>
          tab.name ===
          (data.title ||
            data.projectTitle ||
            data.experienceTitle ||
            data.honorsExperienceTitle ||
            data.involvementTitle ||
            data.yearInReviewTitle ||
            data.adminTitle)
      );

      if (existingTabIndex !== -1) {
        // If the tab exists, set the active index and return the unchanged array
        setIsClosed(false); // Ensure the modal is visible
        setIsMinimized(false); // Ensure the modal is not minimized
        setLastActiveIndex(existingTabIndex);
        // console.log(
        //   "Tab already exists, switching to existing tab:",
        //   prev[existingTabIndex]
        // );
        return prev;
      }

      if (prev.length === 3) {
        // Shift all tabs forward
        const updatedTabs = prev
          .map((tab, idx) => {
            if (idx === 0) return null; // Drop the first tab
            return { ...tab, index: idx - 1 }; // Adjust the index of the rest
          })
          .filter(Boolean); // Remove the null first element

        const newTab = {
          index: updatedTabs.length,
          type,
          data,
          name:
            data.title ||
            data.projectTitle ||
            data.experienceTitle ||
            data.honorsExperienceTitle ||
            data.involvementTitle ||
            data.yearInReviewTitle ||
            data.adminTitle ||
            `Tab ${updatedTabs.length + 1}`,
        };

        const result = [...updatedTabs, newTab];
        setLastActiveIndex(result.length - 1); // Set the last active index to the new tab
        // console.log("Tabs after addition (3 tabs max):", result);
        return result;
      }

      const newTab = {
        index: prev.length,
        type,
        data,
        name:
          data.title ||
          data.projectTitle ||
          data.experienceTitle ||
          data.honorsExperienceTitle ||
          data.involvementTitle ||
          data.yearInReviewTitle ||
          data.adminTitle ||
          `Tab ${prev.length + 1}`,
      };
      const result = [...prev, newTab];
      setLastActiveIndex(result.length - 1); // Set the last active index to the new tab
      // console.log("Tabs after addition:", result);
      return result;
    });

    setIsClosed(false);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 100);
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
        <PowerMode
          isBatterySavingOn={isBatterySavingOn}
          setIsBatterySavingOn={setIsBatterySavingOn}
          scrolled={scrolled}
        />
        <NavBar isBatterySavingOn={isBatterySavingOn} addTab={addTab} />
        <HomePage isBatterySavingOn={isBatterySavingOn} scrolled={scrolled} />
        {/* {isWindowModalVisible && (
          <>
                  <AboutPage isBatterySavingOn={isBatterySavingOn} />
        <SkillPage isBatterySavingOn={isBatterySavingOn} />
        <ProjectPage addTab={addTab} isBatterySavingOn={isBatterySavingOn} />
        <ExperiencePage addTab={addTab} isBatterySavingOn={isBatterySavingOn} />
          </>
        )} */}
        <AboutPage
          isBatterySavingOn={isBatterySavingOn}
          isWindowModalVisible={isWindowModalVisible}
        />
        <SkillPage
          isBatterySavingOn={isBatterySavingOn}
          isWindowModalVisible={isWindowModalVisible}
        />
        <div
          style={{
            display: "sticky",
            top: 0,
            bottom: 0,
            width: "100%",
            // height: "calc(100vh - 52px)",
            height: "auto",
            overflow: "show",
          }}
        >
          <ProjectPage
            addTab={addTab}
            isBatterySavingOn={isBatterySavingOn}
            isWindowModalVisible={isWindowModalVisible}
          />
        </div>
        <ExperiencePage
          addTab={addTab}
          isBatterySavingOn={isBatterySavingOn}
          isWindowModalVisible={isWindowModalVisible}
        />
        <ContactPage isBatterySavingOn={isBatterySavingOn} addTab={addTab} />
        <Links
          isBatterySavingOn={isBatterySavingOn}
          isWindowModalVisible={isWindowModalVisible}
        />
        {/* <a
          className={`scroll-to-top ${scrolled ? "show" : ""}`}
          href="#page-top"
          onClick={scrollToTop}
        >
          <i className="fa fa-angle-up"></i>
        </a> */}
        {!isWindowModalVisible && (
          <div className="ai-chat-container">
            {/* Tooltip
            {showChatTip && (
              <div className="ai-chat-tooltip">
                <span
                  className="close-btn"
                  onClick={dismissChatTip}
                  aria-label="Close"
                >
                  x
                </span>
                Chat with my AI companion to explore my projects and
                experiences.
              </div>
            )} */}
            <motion.div
              className={`ai-chat-btn`}
              onClick={() => {
                addTab("AIChatTab", { title: "Kartavya's AI Chat" });
              }}
              title="Links"
              initial={isBatterySavingOn ? {} : { opacity: 0, scale: 0 }}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              dragElastic={0.3}
              dragTransition={{
                bounceStiffness: 250,
                bounceDamping: 15,
              }}
              whileInView={isBatterySavingOn ? {} : { opacity: 1, scale: 1 }}
              whileHover={isBatterySavingOn ? {} : { scale: 1.1 }}
              whileTap={isBatterySavingOn ? {} : { scale: 0.9 }}
              transition={isBatterySavingOn ? {} : { delay: 0, type: "spring" }}
            >
              <animated.img
                src={require("./assets/img/icons/aichat.png")}
                alt="AI Chat Bot"
                className="icon-img"
                draggable="false"
                loading="eager"
              />
            </motion.div>
          </div>
        )}
        <WindowModal
          tabs={tabs}
          addTab={addTab}
          setTabs={setTabs}
          isClosed={isClosed}
          setIsClosed={setIsClosed}
          isMinimized={isMinimized}
          setIsMinimized={setIsMinimized}
          lastActiveIndex={lastActiveIndex}
          setLastActiveIndex={setLastActiveIndex}
          scrolled={scrolled}
          isBatterySavingOn={isBatterySavingOn}
          loggedIn={loggedIn}
          setLoggedIn={setLoggedIn}
          isWindowModalVisible={isWindowModalVisible}
          setIsWindowModalVisible={setIsWindowModalVisible}
          chatHistory={chatHistory}
          setChatHistory={setChatHistory}
        />
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
