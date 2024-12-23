import React from "react";
import { motion } from "framer-motion";
import { fadeIn, zoomIn, staggerContainer } from "../../services/variants";
import "../../styles/ProjectTab.css";
import github from "../../assets/img/icons/github.svg";
import youtube from "../../assets/img/icons/youtube.svg";
import devpost from "../../assets/img/icons/devpost.png";
import web from "../../assets/img/icons/web.svg";

const ProjectTab = ({ data }) => {
  const getIconForLink = (link) => {
    if (link.includes("github")) return github;
    if (link.includes("youtube")) return youtube;
    if (link.includes("devpost")) return devpost;
    return web;
  };

  const renderLogos = (urls) =>
    Object.entries(urls).map(([key, value]) => {
      const iconName = getIconForLink(value);
      return (
        <a key={key} href={value} target="_blank" rel="noopener noreferrer">
          <img
            src={`${iconName}`}
            alt={`${iconName} logo`}
            className="project-window-logo"
          />
        </a>
      );
    });

  return (
    <motion.div
      className="project-window-tab-container"
      variants={staggerContainer(0.2, 0.1)}
      initial="hidden"
      animate="show"
    >
      {/* Images Section */}
      <motion.div
        className="project-window-images"
        variants={zoomIn(0.3)}
        style={{ height: "40vh", overflow: "hidden" }}
      >
        {data.projectImages.map((img, index) => (
          <img
            key={index}
            src={img}
            alt={`Project ${index + 1}`}
            className="project-window-image"
          />
        ))}
      </motion.div>

      {/* Title and Subtitle */}
      <motion.h1
        className="project-window-title"
        variants={fadeIn("up", 20, 0.3)}
      >
        {data.projectTitle}
      </motion.h1>
      {data.projectSubTitle && (
        <motion.h3
          className="project-window-subtitle"
          variants={fadeIn("up", 20, 0.4)}
        >
          {data.projectSubTitle}
        </motion.h3>
      )}
      <motion.h4
        className="project-window-timeline"
        variants={fadeIn("up", 20, 0.5)}
      >
        {data.projectTimeline}
      </motion.h4>

      {/* URLs Section */}
      <motion.div
        className="project-window-urls"
        variants={fadeIn("up", 20, 0.6)}
      >
        {renderLogos(data.projectURLs)}
      </motion.div>

      {/* Paragraphs Section */}
      <motion.div
        className="project-window-paragraphs"
        variants={fadeIn("up", 20, 0.7)}
      >
        {data.projectParagraphs.map((para, index) => (
          <p key={index} className="project-window-paragraph">
            {para}
          </p>
        ))}
      </motion.div>
    </motion.div>
  );
};

export default ProjectTab;
