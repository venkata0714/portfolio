import React from "react";
import { motion } from "framer-motion";
import { zoomIn } from "../../services/variants";
import "../../styles/ProjectPage.css";
import GradientBG from "./GradientBG"; // Adjust the path as necessary
import ProjectsListView from "./ProjectsListView";

function ProjectPage({ addTab, isBatterySavingOn, isWindowModalVisible }) {
  return (
    <motion.section className="project-page-container" id="projects">
      <div className="gradient-bg-container">
        <GradientBG />
      </div>
      <motion.div
        className="project-page-div"
        style={
          isWindowModalVisible
            ? { opacity: 0, transition: "opacity 0.5s ease-in-out" }
            : { opacity: 1, transition: "opacity 0.5s ease-in-out" }
        }
        variants={isBatterySavingOn ? {} : zoomIn(0)}
        initial={{ opacity: 0 }}
        whileInView="show"
        exit="hidden"
      >
        <h2 className="project-section-title">My Projects</h2>
        <ProjectsListView
          addTab={addTab}
          isBatterySavingOn={isBatterySavingOn}
        />
      </motion.div>
    </motion.section>
  );
}

export default ProjectPage;
