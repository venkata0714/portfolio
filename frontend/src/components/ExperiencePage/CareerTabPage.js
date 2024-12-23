import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import LeftArrow from "../../assets/img/icons/arrow1.svg";
import RightArrow from "../../assets/img/icons/arrow2.svg";
import { fetchExperiences } from "../../services/experienceService";
import "../../styles/CareerTabPage.css";

const CustomArrow = ({ direction, onClick, imgSrc, label }) => (
  <button
    className={`custom-arrow custom-${direction}-arrow`}
    onClick={onClick}
    aria-label={label}
  >
    <img src={imgSrc} alt={`${label} Arrow`} />
  </button>
);

const CareerTabPage = ({ addTab }) => {
  const [experiences, setExperiences] = useState([]);
  const [activeSlide, setActiveSlide] = useState(1);

  useEffect(() => {
    const getExperiences = async () => {
      try {
        const data = await fetchExperiences();
        setExperiences([...data.reverse()]);
      } catch (error) {
        console.error("Error fetching experiences:", error);
      }
    };
    getExperiences();
  }, []);

  const nextSlide = () =>
    setActiveSlide((prev) => (prev + 1) % experiences.length);

  const prevSlide = () =>
    setActiveSlide(
      (prev) => (prev - 1 + experiences.length) % experiences.length
    );

  const getStyles = (index) => {
    const isActive = index === activeSlide;
    const isPrevious =
      index === (activeSlide - 1 + experiences.length) % experiences.length;
    const isNext = index === (activeSlide + 1) % experiences.length;

    // Common transition style for smooth animation
    const transitionStyle = {
      transition: "transform 0.8s ease, opacity 0.8s ease, z-index 0s linear",
    };

    if (isActive) {
      return {
        ...transitionStyle,
        opacity: 1,
        transform: "scale(1) translateX(0px) translateZ(0px) rotateY(0deg)",
        zIndex: 10,
      };
    } else if (isPrevious) {
      return {
        ...transitionStyle,
        opacity: 0.8,
        transform:
          "scale(0.8) translateX(-240px) translateZ(-200px) rotateY(15deg)",
        zIndex: 9,
      };
    } else if (isNext) {
      return {
        ...transitionStyle,
        opacity: 0.8,
        transform:
          "scale(0.8) translateX(240px) translateZ(-200px) rotateY(-15deg)",
        zIndex: 9,
      };
    } else {
      // Cards that are neither active nor adjacent get a more distant look
      return {
        ...transitionStyle,
        opacity: 0,
        transform: "scale(0.6) translateZ(-400px)",
        zIndex: 7,
      };
    }
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
      <div className="career-tabs-slider">
        <div className="slide-container">
          {experiences.map((experience, index) => (
            <div
              key={index}
              className="slide"
              style={{
                ...getStyles(index),
              }}
            >
              <div className="slider-content">
                <h2 className="experience-title">
                  {experience.experienceTitle}
                </h2>
                <h3 className="experience-subtitle">
                  {experience.experienceSubTitle}
                </h3>
              </div>
            </div>
          ))}
        </div>
        <div className="btns">
          <CustomArrow
            direction="left"
            onClick={prevSlide}
            imgSrc={LeftArrow}
            label="Previous"
          />
          <CustomArrow
            direction="right"
            onClick={nextSlide}
            imgSrc={RightArrow}
            label="Next"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default CareerTabPage;
