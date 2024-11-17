import { React, Container, Row, Col } from "react";
import "../styles/SkillPage.css";
import { motion, AnimatePresence } from "framer-motion";
import Carousel from "react-multi-carousel";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";
import { Radar } from "react-chartjs-2";
import SpaceExplorer from "../assets/img/media/header-img.svg";
import "react-multi-carousel/lib/styles.css";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);
const SkillGraph = ({ givenData }) => {
  const data = {
    labels: [
      "Comfortability",
      "Confidence",
      "Experience",
      "Fluency",
      "Adaptabilty",
    ],
    datasets: [
      {
        label: "Skill Scores",
        data: givenData,
        backgroundColor: "rgba(33, 37, 41, 0.7)", // Slight transparency for a sci-fi effect
        borderColor: "#6cbcfc",
        borderWidth: 1.5,
        pointBackgroundColor: "#6cbcfc",
        pointBorderColor: "#edeeef",
        pointHoverBackgroundColor: "#edeeef",
        pointHoverBorderColor: "#6cbcfc",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: {
          color: "#edeeef", // Lines radiating from the center
        },
        grid: {
          color: "rgba(237, 238, 239, 0.1)", // Subtle grid lines
        },
        pointLabels: {
          color: "#edeeef", // Aspect labels (e.g., Aspect 1)
          font: {
            size: 8,
            family: "'Orbitron', sans-serif", // Sci-fi font
          },
        },
        ticks: {
          display: false, // Hides the numbers on the grid
          backdropColor: "transparent", // Ensures no background color for ticks
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#edeeef",
          font: {
            family: "'Orbitron', sans-serif", // Sci-fi font
          },
        },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return `Score: ${context.raw}`; // Tooltip for values
          },
        },
        backgroundColor: "#212529",
        titleColor: "#6cbcfc",
        bodyColor: "#edeeef",
        borderColor: "#6cbcfc",
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="skill-image">
      <Radar data={data} options={options} />
    </div>
  );
};

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

function SkillPage({ givenData }) {
  return (
    <section className="skill-container" id="skills">
      <div className="skill-div">
        <div className="skill-box">
          {/* <motion.img
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
          /> */}
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
              <div className="skill-graph">
                <SkillGraph givenData={givenData} />
              </div>
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
