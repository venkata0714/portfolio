import React, { useState, useEffect } from "react";
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

function App({ isBatterySavingOn, setIsBatterySavingOn }) {
  const [scrolled, setScrolled] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [tabs, setTabs] = useState([]); // Tabs state for WindowModal
  const [isClosed, setIsClosed] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false); // Track if modal is minimized
  const [lastActiveIndex, setLastActiveIndex] = useState(0); // Track active tab index
  const [isWindowModalVisible, setIsWindowModalVisible] = useState(false);

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
        <NavBar isBatterySavingOn={isBatterySavingOn} />
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
        <Links isBatterySavingOn={isBatterySavingOn} />
        <a
          className={`scroll-to-top ${scrolled ? "show" : ""}`}
          href="#page-top"
          onClick={scrollToTop}
        >
          <i className="fa fa-angle-up"></i>
        </a>
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
        />
      </motion.div>
    </AnimatePresence>
  );
}

export default App;
