import React from "react";
import { motion } from "framer-motion";
// import { styled } from "@stitches/react";
import { fadeIn, zoomIn } from "../../services/variants";
import "../../styles/ProjectTab.css";

const ProjectTab = ({ data }) => {
  return (
    <motion.div
      className="project-tab-container"
      variants={zoomIn(0.2)}
      initial="hidden"
      animate="show"
    >
      <motion.h1 className="project-title" variants={fadeIn("up", 20, 0.3)}>
        {data.projectTitle}
      </motion.h1>
      <motion.h3 className="project-subtitle" variants={fadeIn("up", 20, 0.4)}>
        {data.projectSubTitle} | {data.projectTimeline}
      </motion.h3>
      <motion.p
        className="project-description"
        variants={fadeIn("up", 20, 0.5)}
      >
        {data.projectTagline}
      </motion.p>
      <motion.div className="project-details" variants={fadeIn("up", 20, 0.6)}>
        {Object.keys(data).map((key, index) => {
          if (key === "projectLink") {
            return (
              <div key={index} className="project-detail">
                <span className="detail-key">Project Link: </span>
                <a
                  href={data[key]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="detail-value"
                >
                  {data[key]}
                </a>
              </div>
            );
          } else if (key === "projectImages") {
            return (
              <div key={index} className="project-images">
                {data[key].map((img, imgIndex) => (
                  <motion.img
                    key={imgIndex}
                    src={img}
                    alt={`Project Image ${imgIndex + 1}`}
                    className="project-image2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  />
                ))}
              </div>
            );
          } else {
            return (
              <div key={index} className="project-detail">
                <span className="detail-key">{key}: </span>
                <span className="detail-value">{data[key]}</span>
              </div>
            );
          }
        })}
      </motion.div>
    </motion.div>
  );
};

export default ProjectTab;
