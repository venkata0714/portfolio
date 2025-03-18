import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { zoomIn } from "../../services/variants";
import LeftArrow from "../../assets/img/icons/arrow1.svg";
import RightArrow from "../../assets/img/icons/arrow2.svg";
import { fetchHonorsExperiences } from "../../services/honorsExperienceService";
import { fetchYearInReviews } from "../../services/yearInReviewService";
import { styled } from "@stitches/react";

const CustomArrow = ({ direction, onClick, imgSrc, label }) => {
  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 52; // Adjust based on your navbar height
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const handleClick = () => {
    if (onClick) onClick(); // Call the passed onClick function if it exists
    scrollToSection("experience"); // Correct capitalization here
  };

  return (
    <button
      className={`custom-arrow custom-${direction}-arrow`}
      onClick={handleClick}
      aria-label={label}
    >
      <img src={imgSrc} alt={`${label} Arrow`} />
    </button>
  );
};

const HonorsTabPage = ({ addTab, isBatterySavingOn }) => {
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
      variants={isBatterySavingOn ? {} : zoomIn(0)}
      initial="hidden"
      whileInView="show"
      exit="hidden"
      viewport={{ once: true }}
    >
      <h1 className="career-tab-header">My Honors Journey</h1>
      <div className="career-tabs-slider">
        <div className="slide-container">
          {Array.from({ length: combinedLength }).map((_, index) => {
            const { type, data } = getSlideData(index);
            return (
              <div
                key={`${type}-${index}`}
                className={`slide`}
                style={getStyles(index)}
              >
                <div className={`slider-content`}>
                  <div className="career-container">
                    <div className="career-image">
                      <img
                        src={
                          type === "honor"
                            ? data.honorsExperienceImages[0]
                            : data.yearInReviewImages[0]
                        }
                        alt=""
                        className="career-image-content"
                      />
                    </div>
                    <div className="career-details">
                      <h2 className="career-title">
                        {type === "honor"
                          ? data.honorsExperienceTitle
                          : data.yearInReviewTitle}
                      </h2>
                      <div className="career-subtitle-area">
                        <h4 className="career-subtitle">
                          {type === "honor"
                            ? data.honorsExperienceSubTitle
                            : data.yearInReviewSubTitle}
                        </h4>
                        <p className="career-timeline">
                          {type === "honor"
                            ? data.honorsExperienceTimeline
                            : data.yearInReviewTimeline}
                        </p>
                        <p className="career-tagline">
                          {type === "honor"
                            ? data.honorsExperienceTagline
                            : data.yearInReviewTagline}
                        </p>
                        <motion.div
                          className="career-learn-button-motioned"
                          onClick={() => {
                            if (type === "honor") {
                              addTab("Honors", data);
                            } else if (type === "review") {
                              addTab("YearInReview", data);
                            } else {
                              // Handle case when no career data is available for the review tab
                              console.error(
                                "No career data available for the review tab"
                              );
                            }
                          }}
                          variants={zoomIn(0)}
                          initial="hidden"
                          animate="show"
                          drag
                          dragConstraints={{
                            left: 0,
                            right: 0,
                            top: 0,
                            bottom: 0,
                          }}
                          dragElastic={0.3}
                          dragTransition={{
                            bounceStiffness: 250,
                            bounceDamping: 15,
                          }}
                        >
                          <StyledButton
                            onClick={(e) => {
                              e.preventDefault();
                            }}
                          >
                            <ButtonShadow />
                            <ButtonEdge />
                            <ButtonLabel>Learn More →</ButtonLabel>
                          </StyledButton>
                        </motion.div>
                      </div>
                    </div>
                  </div>
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

// Styled Components for Button
const ButtonPart = styled("span", {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  borderRadius: 8,
});

const ButtonShadow = styled(ButtonPart, {
  background: "hsl(0deg 0% 0% / 0.1)",
  transform: "translateY(2px)",
  transition: "transform 250ms ease-out",
});

const ButtonEdge = styled(ButtonPart, {
  background: `linear-gradient(
        to left,
        hsl(0deg 0% 69%) 0%,
        hsl(0deg 0% 85%) 8%,
        hsl(0deg 0% 85%) 92%,
        hsl(0deg 0% 69%) 100%
      )`,
});

const ButtonLabel = styled("span", {
  fontFamily: "Montserrat",
  fontSize: "14px",
  display: "block",
  position: "relative",
  borderRadius: 5,
  color: "#212529",
  padding: "1rem 1.5rem",
  background: "#f8f9fa",
  transform: "translateY(-4px)",
  width: "100%",
  userSelect: "none",
  transition:
    "transform 250ms ease-out, background-color 0.3s ease, color 0.3s ease",

  "&:hover": {
    backgroundColor: "#fcbc1d",
    color: "#212529",
    transform: "scale(1.05)",
  },
});

const StyledButton = styled("button", {
  border: "none",
  fontWeight: 600,
  width: "fit-content",
  cursor: "pointer",
  background: "transparent",
  position: "relative",
  padding: 0,
  transition: "filter 250ms ease-out",

  "&:hover": {
    filter: "brightness(110%)",

    [`& ${ButtonLabel}`]: {
      transform: "translateY(-8px)",
    },

    [`& ${ButtonShadow}`]: {
      transform: "translateY(6px)",
    },
  },

  "&:active": {
    [`& ${ButtonLabel}`]: {
      transform: "translateY(-2px)",
      transition: "transform 34ms",
    },

    [`& ${ButtonShadow}`]: {
      transform: "translateY(1px)",
      transition: "transform 34ms",
    },
  },
});
