import { React, Container, Row, Col } from "react";
import "../styles/SkillPage.css";
import { motion, AnimatePresence } from "framer-motion";
import Carousel from "react-multi-carousel";
import SpaceExplorer from "../assets/img/media/header-img.svg";
import "react-multi-carousel/lib/styles.css";

const responsive = {
  superLargeDesktop: {
    // the naming can be any, depends on you.
    breakpoint: { max: 4000, min: 992 },
    items: 4,
  },
  desktop: {
    breakpoint: { max: 992, min: 768 },
    items: 3,
  },
  tablet: {
    breakpoint: { max: 768, min: 576 },
    items: 2,
  },
  mobile: {
    breakpoint: { max: 576, min: 0 },
    items: 1,
  },
};

function SkillPage() {
  return (
    <section className="skill-container" id="skills">
      <div className="skill-div">
        <div className="skill-box">
          <motion.img
            src={SpaceExplorer}
            alt="Space Explorer"
            className="space-explorer"
            initial={{ opacity: 0 }}
            animate={{
              scale: [1, 1.02, 1.05, 1.02, 1], // Subtle pulsating effect
              rotate: [0, 15, 0, -15, 0], // Gently rotate back and forth
              translateX: [0, 20, -20, 10, -10, 0], // Smooth drift horizontally
              translateY: [0, -15, 15, -10, 10, 0], // Smooth drift vertically
            }}
            transition={{
              duration: 8, // Smooth and slow overall animation
              ease: "easeInOut", // Natural easing for realistic motion
              repeat: Infinity, // Loop infinitely
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
              transition: {
                duration: 0.8,
                ease: "easeInOut",
              },
            }}
          />
          <h2 className="skill-heading">Skills</h2>
          <p className="skill-paragraph">Here are my Skills</p>
          <Carousel
            responsive={responsive}
            infinite={true}
            className="skill-slider"
          >
            <div className="item">
              <img
                className="skill-image"
                src="https://via.placeholder.com/150"
                alt="Skill"
              />
              <h5 className="skill-title">Skill 1</h5>
              <p className="skill-description">
                This is a Skill Description for a Skilll
              </p>
            </div>
            <div className="item">
              <img
                className="skill-image"
                src="https://via.placeholder.com/150"
                alt="Skill"
              />
              <h5 className="skill-title">Skill 2</h5>
              <p className="skill-description">
                This is a Skill Description for a Skilll
              </p>
            </div>
            <div className="item">
              <img
                className="skill-image"
                src="https://via.placeholder.com/150"
                alt="Skill"
              />
              <h5 className="skill-title">Skill 3</h5>
              <p className="skill-description">
                This is a Skill Description for a Skilll
              </p>
            </div>
            <div className="item">
              <img
                className="skill-image"
                src="https://via.placeholder.com/150"
                alt="Skill"
              />
              <h5 className="skill-title">Skill 4</h5>
              <p className="skill-description">
                This is a Skill Description for a Skilll
              </p>
            </div>
            <div className="item">
              <img
                className="skill-image"
                src="https://via.placeholder.com/150"
                alt="Skill"
              />
              <h5 className="skill-title">Skill 5</h5>
              <p className="skill-description">
                This is a Skill Description for a Skilll
              </p>
            </div>
            <div className="item">
              <img
                className="skill-image"
                src="https://via.placeholder.com/150"
                alt="Skill"
              />
              <h5 className="skill-title">Skill 6</h5>
              <p className="skill-description">
                This is a Skill Description for a Skilll
              </p>
            </div>
          </Carousel>
        </div>
      </div>
    </section>
  );
}

export default SkillPage;
