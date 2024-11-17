import { React, useState, useEffect } from "react";
import "../styles/SkillPage.css";
import LeftArrow from "../assets/img/icons/arrow1.svg";
import RightArrow from "../assets/img/icons/arrow2.svg";
import { motion } from "framer-motion";
import { fadeIn, zoomIn } from "../variants";
import Carousel from "react-multi-carousel";
import { fetchSkills } from "../services/skillService"; // Import the fetchSkills function

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

const FloatingSpaceExplorer = ({ id }) => {
  const [position, setPosition] = useState({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
  });

  useEffect(() => {
    const updatePosition = () => {
      setPosition({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
      });
    };

    const interval = setInterval(updatePosition, 5000); // Update position every 5 seconds
    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <motion.img
      key={id}
      src={SpaceExplorer}
      alt="Space Explorer"
      className="floating-space-explorer"
      initial={{ x: position.x, y: position.y, opacity: 0 }}
      animate={{ x: position.x, y: position.y, opacity: 1 }}
      transition={{
        duration: 5, // Smooth movement over 5 seconds
        ease: "easeInOut",
        repeat: Infinity,
      }}
      style={{
        position: "absolute",
        width: "10vw",
        height: "auto",
        zIndex: 5,
      }}
    />
  );
};

const CustomLeftArrow = ({ onClick }) => {
  return (
    <button className="custom-arrow custom-left-arrow" onClick={onClick}>
      <img src={LeftArrow} alt="Left Arrow" />
    </button>
  );
};

const CustomRightArrow = ({ onClick }) => {
  return (
    <button className="custom-arrow custom-right-arrow" onClick={onClick}>
      <img src={RightArrow} alt="Right Arrow" />
    </button>
  );
};

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);
const SkillGraph = ({ givenData }) => {
  const averageScore =
    givenData.Scores.reduce((sum, score) => sum + score, 0) /
    givenData.Scores.length;

  const data = {
    labels: givenData.Labels, // Dynamically use labels from givenData
    datasets: [
      {
        label: givenData.skillTitle,
        data: givenData.Scores, // Dynamically use scores from givenData
        backgroundColor: "rgba(252, 188, 29, 0.2)",
        borderColor: "#6cbcfc",
        borderWidth: 2, // Slightly thicker border for better visibility
        pointBackgroundColor: "#6cbcfc",
        pointBorderColor: "#edeeef",
        pointHoverBackgroundColor: "#edeeef",
        pointHoverBorderColor: "#6cbcfc",
        pointRadius: 4, // Increase point size
        pointHoverRadius: 6, // Increase hover size
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 4, // Minimum value for the scale
        max: 5, // Maximum value for the scale
        ticks: {
          stepSize: 2, // Increment steps between the radius levels
          color: "#6cbcfc", // Tick color
          display: false, // Hide numbers on the grid
          backdropColor: "transparent", // No background for ticks
        },
        angleLines: {
          color: "#edeeef", // Lines radiating from the center
        },
        grid: {
          color: "rgba(237, 238, 239, 0.1)", // Subtle grid lines
        },
        pointLabels: {
          color: "#edeeef", // Aspect labels (e.g., Aspect 1)
          font: {
            weight: 100, // Reduced font weight for lighter text
            size: 8,
            family: "'Montserrat', sans-serif", // Sci-fi font
          },
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
      customAverage: {
        // Custom plugin for displaying average score
        id: "customAverage",
        beforeDraw(chart) {
          const { ctx, chartArea } = chart;
          const x = chartArea.right - 30; // Position near the top-right
          const y = chartArea.top + 10;

          ctx.save();
          ctx.font = "10px 'Montserrat', sans-serif"; // Set Montserrat font
          ctx.fillStyle = "#edeeef"; // Text color
          ctx.textAlign = "center"; // Center align the text
          ctx.fillText(`Avg. ${averageScore.toFixed(2)}`, x, y); // Display the average score
          ctx.restore();
        },
      },
    },
  };

  return (
    <div className="skill-image">
      <Radar
        data={data}
        options={options}
        plugins={[options.plugins.customAverage]}
      />
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
  const [skills, setSkills] = useState([]); // State to store fetched skills
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch skills on component load
    const loadSkills = async () => {
      try {
        const fetchedSkills = await fetchSkills();
        setSkills(fetchedSkills);
      } catch (error) {
        console.error("Error fetching skills:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, []);

  return (
    <section className="skill-container" id="skills">
      {/* Render multiple floating SpaceExplorers
      {[...Array(10)].map((_, index) => (
        <FloatingSpaceExplorer key={index} id={index} />
      ))} */}

      <div className="skill-div">
        <div className="skill-box">
          <motion.h2
            className="skill-heading"
            variants={fadeIn("right", 200, 1)}
            initial="hidden"
            animate="show"
            whileInView="show"
            transition={{
              duration: 0.5,
              ease: "easeInOut",
              delay: 0.5,
              repeat: true,
            }}
          >
            Skills
          </motion.h2>
          <motion.p
            className="skill-paragraph"
            variants={fadeIn("right", 200, 1)}
            initial="hidden"
            animate="show"
            whileInView="show"
            transition={{
              duration: 0.5,
              ease: "easeInOut",
              delay: 0.5,
              repeat: true,
            }}
          >
            Here are my Skills
          </motion.p>
          <Carousel
            responsive={responsive}
            autoPlaySpeed={3000}
            infinite={true}
            className="skill-slider"
            minimumTouchDrag={80}
            pauseOnHover
            customLeftArrow={<CustomLeftArrow />}
            customRightArrow={<CustomRightArrow />}
          >
            {skills.map((eachSkill, index) => (
              <motion.div
                className="item"
                key={index}
                variants={zoomIn(1)}
                initial="hidden"
                whileInView="show"
              >
                <motion.div
                  className="skill-graph"
                  initial={{ scale: 1 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <SkillGraph givenData={eachSkill} />
                </motion.div>
                <h5 className="skill-title">{eachSkill.skillTitle}</h5>
                <p className="skill-description">
                  {eachSkill.skillDescription}
                </p>
              </motion.div>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
}

export default SkillPage;
