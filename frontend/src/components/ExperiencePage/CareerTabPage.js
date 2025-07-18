import React from "react";
import { motion } from "framer-motion";
import { zoomIn } from "../../services/variants";
import "../../styles/CareerTabPage.css";

const educationData = [
  {
    title: "Master of Science, Information Technology",
    subtitle: "Kennesaw State University",
    timeline: "Jan 2024 - May 2025 | Kennesaw, GA, USA",
    description:
      "Focused on Cloud Computing with a STEM-designated curriculum, maintaining a CGPA of 3.1/4.0 while mastering advanced IT concepts and practical cloud solutions.",
    image:
      "https://images.pexels.com/photos/3183171/pexels-photo-3183171.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
  {
    title: "Bachelor of Technology, Information Technology",
    subtitle: "Vasireddy Venkatadri Institute of Technology",
    timeline: "Aug 2019 - May 2023 | Guntur, India",
    description:
      "Completed B.Tech with a CGPA of 7.12/10, building a strong foundation in computer science, programming, and information technology principles.",
    image:
      "https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800",
  },
];

const CareerTabPage = ({ isBatterySavingOn }) => {
  return (
    <div className="career-tab-page">
      <motion.h2
        variants={zoomIn(0.2, 1)}
        initial="hidden"
        whileInView="show"
        className="career-tab-header"
      >
        Education
      </motion.h2>
      
      <div className="career-section">
        {educationData.map((edu, index) => (
          <motion.div
            key={index}
            variants={zoomIn(0.4 + index * 0.2, 1)}
            initial="hidden"
            whileInView="show"
            className="education-entry"
          >
            <div className="education-content">
              <div className="education-image">
                <img 
                  src={edu.image} 
                  alt={edu.title}
                  className="career-image"
                />
              </div>
              
              <div className="education-details">
                <h3 className="career-title">{edu.title}</h3>
                <div className="career-subtitle-area">
                  <div className="career-subtitle">{edu.subtitle}</div>
                  <div className="career-timeline">{edu.timeline}</div>
                </div>
                <p className="career-tagline">{edu.description}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CareerTabPage;