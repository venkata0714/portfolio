import { React, useState, useEffect } from "react";
import "../styles/SkillPage.css";
// import { motion, AnimatePresence } from "framer-motion";
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
// import SpaceExplorer from "../assets/img/media/header-img.svg";
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
          stepSize: 1, // Increment steps between the radius levels
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
            size: 8,
            family: "'Orbitron', sans-serif", // Sci-fi font
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
          const x = chartArea.right - 10; // Position near the top-right
          const y = chartArea.top + 10;

          ctx.save();
          ctx.font = "12px Orbitron";
          ctx.fillStyle = "#edeeef";
          ctx.textAlign = "right";
          ctx.fillText(`Avg. ${averageScore.toFixed(2)}`, x, y);
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

  if (loading) {
    return <div className="loading">Loading Skills...</div>;
  }
  return (
    <section className="skill-container" id="skills">
      <div className="skill-div">
        <div className="skill-box">
          <h2 className="skill-heading">Skills</h2>
          <p className="skill-paragraph">Here are my Skills</p>
          <Carousel
            responsive={responsive}
            infinite={true}
            className="skill-slider"
          >
            {skills.map((eachSkill, index) => (
              <div className="item" key={index}>
                <div className="skill-graph">
                  <SkillGraph givenData={eachSkill} />
                </div>
                <h5 className="skill-title">{eachSkill.skillTitle}</h5>
                <p className="skill-description">
                  {eachSkill.skillDescription}
                </p>
              </div>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
}

export default SkillPage;
