import React from "react";
import { motion } from "framer-motion";
import "../../styles/ProjectPage.css";
import GradientBG from "./GradientBG"; // Adjust the path as necessary
import ProjectsListView from "./ProjectsListView";

function ProjectPage() {
  return (
    <motion.section className="project-page-container" id="projects">
      <div className="gradient-bg-container">
        <GradientBG />
      </div>
      <div className="project-page-div">
        <h2 className="project-section-title">My Projects</h2>
        <ProjectsListView />
      </div>
    </motion.section>
  );
}

export default ProjectPage;