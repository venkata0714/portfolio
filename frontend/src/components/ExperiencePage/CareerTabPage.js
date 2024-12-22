import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { fetchExperiences } from "../../services/experienceService";
import "../../styles/CareerTabPage.css";

function CareerTabPage({ addTab }) {
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    const getExperiences = async () => {
      try {
        const data = await fetchExperiences();
        // setExperiences([
        //   ...data.reverse(),
        //   ...data.reverse(),
        //   ...data.reverse(),
        // ]);
        setExperiences(data.reverse());
      } catch (error) {
        console.error("Error fetching experiences:", error);
      }
    };
    getExperiences();
  }, []);

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <motion.div
      className="career-tab-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="career-tab-header">My Career</h1>
      <div className="career-grid-container">
        {experiences.map((experience, index) => (
          <motion.div
            className="career-card"
            key={index}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <div
              className="career-card-image"
              style={{
                backgroundImage: `url(${experience.experienceImages[0]})`,
              }}
            >
              <span className="experience-timeline">
                {experience.experienceTimeline}
              </span>
            </div>
            <div className="career-card-content">
              <h2 className="experience-title">{experience.experienceTitle}</h2>
              <h3 className="experience-subtitle">
                {experience.experienceSubTitle}
              </h3>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

export default CareerTabPage;
