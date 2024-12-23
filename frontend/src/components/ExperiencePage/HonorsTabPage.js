import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import LeftArrow from "../../assets/img/icons/arrow1.svg";
import RightArrow from "../../assets/img/icons/arrow2.svg";
import { fetchHonorsExperiences } from "../../services/honorsExperienceService";
import { fetchYearInReviews } from "../../services/yearInReviewService";
import "../../styles/HonorsTabPage.css";

const CustomArrow = ({ direction, onClick, imgSrc, label }) => (
  <button
    className={`custom-arrow custom-${direction}-arrow`}
    onClick={onClick}
    aria-label={label}
  >
    <img src={imgSrc} alt={`${label} Arrow`} />
  </button>
);

const HonorsTabPage = () => {
  const [honors, setHonors] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const honorsData = await fetchHonorsExperiences();
        const reviewsData = await fetchYearInReviews();
        setHonors(honorsData);
        setReviews(reviewsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const combinedLength = honors.length + reviews.length;

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % combinedLength);

  const prevSlide = () =>
    setActiveSlide((prev) => (prev - 1 + combinedLength) % combinedLength);

  const getSlideData = (index) => {
    if (index < honors.length) {
      return { type: "honor", data: honors[index] };
    } else {
      return { type: "review", data: reviews[index - honors.length] };
    }
  };

  const getStyles = (index) => {
    const isActive = index === activeSlide;
    const isPrevious =
      index === (activeSlide - 1 + combinedLength) % combinedLength;
    const isNext = index === (activeSlide + 1) % combinedLength;

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
      className="honors-tab-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <h1 className="honors-tab-header">My Honors Journey</h1>
      <div className="honors-tabs-slider">
        <div className="slide-container">
          {Array.from({ length: combinedLength }).map((_, index) => {
            const { type, data } = getSlideData(index);
            return (
              <div
                key={`${type}-${index}`}
                className={`slide`}
                style={getStyles(index)}
              >
                <div className={`slider-content ${type}-content`}>
                  <h2>
                    {data.honorsExperienceTitle || data.yearInReviewTitle}
                  </h2>
                  <p>
                    {data.honorsExperienceTagline || data.yearInReviewTagline}
                  </p>
                </div>
              </div>
            );
          })}
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

export default HonorsTabPage;
