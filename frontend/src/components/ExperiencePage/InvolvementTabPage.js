import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import LeftArrow from "../../assets/img/icons/arrow1.svg";
import RightArrow from "../../assets/img/icons/arrow2.svg";
import { fetchInvolvements } from "../../services/involvementService";
const CustomArrow = ({ direction, onClick, imgSrc, label }) => (
  <button
    className={`custom-arrow custom-${direction}-arrow`}
    onClick={onClick}
    aria-label={label}
  >
    <img src={imgSrc} alt={`${label} Arrow`} />
  </button>
);

const InvolvementTabPage = ({ addTab }) => {
  const [involvements, setInvolvements] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const getInvolvements = async () => {
      try {
        const data = await fetchInvolvements();
        setInvolvements([...data.reverse()]);
      } catch (error) {
        console.error("Error fetching involvements:", error);
      }
    };
    getInvolvements();
  }, []);

  const nextSlide = () =>
    setActiveSlide((prev) => (prev + 1) % involvements.length);

  const prevSlide = () =>
    setActiveSlide(
      (prev) => (prev - 1 + involvements.length) % involvements.length
    );

  const getStyles = (index) => {
    const isActive = index === activeSlide;
    const isPrevious =
      index === (activeSlide - 1 + involvements.length) % involvements.length;
    const isNext = index === (activeSlide + 1) % involvements.length;

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
      className="involvement-tab-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="involvement-tab-header">My Involvements</h1>
      <div className="involvement-tabs-slider">
        <div className="slide-container">
          {involvements.map((involvement, index) => (
            <div
              key={index}
              className="slide"
              style={{
                ...getStyles(index),
              }}
            >
              <div className="slider-content">
                <h2 className="involvement-title">
                  {involvement.involvementTitle}
                </h2>
                <h3 className="involvement-subtitle">
                  {involvement.involvementSubTitle}
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

export default InvolvementTabPage;
