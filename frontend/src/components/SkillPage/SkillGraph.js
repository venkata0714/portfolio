import React, { useState, useEffect } from "react";
import Carousel from "react-multi-carousel";
import "../../styles/SkilllGraph.css";
import { motion } from "framer-motion";
import LeftArrow from "../../assets/img/icons/arrow1.svg";
import RightArrow from "../../assets/img/icons/arrow2.svg";
import { zoomIn } from "../../services/variants";
import { fetchSkills } from "../../services/skillService";
import { Radar } from "react-chartjs-2";
import "react-multi-carousel/lib/styles.css";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const CustomLeftArrow = ({ onClick }) => (
  <button className="custom-arrow custom-left-arrow" onClick={onClick}>
    <img src={LeftArrow} alt="Left Arrow" />
  </button>
);

const CustomRightArrow = ({ onClick }) => (
  <button className="custom-arrow custom-right-arrow" onClick={onClick}>
    <img src={RightArrow} alt="Right Arrow" />
  </button>
);

const responsive = {
  superLargeDesktop: { breakpoint: { max: 4000, min: 992 }, items: 1 },
  desktop: { breakpoint: { max: 992, min: 768 }, items: 1 },
  tablet: { breakpoint: { max: 768, min: 576 }, items: 1 },
  mobile: { breakpoint: { max: 576, min: 0 }, items: 1 },
};

const SkillGraph = ({ givenData }) => {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const fetchedSkills = await fetchSkills();
        setSkills(fetchedSkills);
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };

    loadSkills();
  }, []);

  const averageScore =
    givenData.Scores.reduce((sum, score) => sum + score, 0) /
    givenData.Scores.length;

  const data = {
    labels: givenData.Labels,
    datasets: [
      {
        label: givenData.skillTitle,
        data: givenData.Scores,
        backgroundColor: "rgba(252, 188, 29, 0.2)",
        borderColor: "#6cbcfc",
        borderWidth: 2,
        pointBackgroundColor: "#6cbcfc",
        pointBorderColor: "#edeeef",
        pointHoverBackgroundColor: "#edeeef",
        pointHoverBorderColor: "#6cbcfc",
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        min: 4,
        max: 5,
        ticks: { stepSize: 2, color: "#6cbcfc", display: false },
        angleLines: { color: "#edeeef" },
        grid: { color: "rgba(237, 238, 239, 0.1)" },
        pointLabels: {
          color: "#edeeef",
          font: {
            weight: 400,
            size: 8,
            family: "'Montserrat', sans-serif",
          },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `Score: ${context.raw}`,
        },
        backgroundColor: "#212529",
        titleColor: "#6cbcfc",
        bodyColor: "#edeeef",
        borderColor: "#6cbcfc",
        borderWidth: 3,
      },
      customAverage: {
        id: "customAverage",
        beforeDraw(chart) {
          const { ctx, chartArea } = chart;
          const x = chartArea.right - 30;
          const y = chartArea.top + 10;

          ctx.save();
          ctx.font = "10px 'Montserrat', sans-serif";
          ctx.fillStyle = "#edeeef";
          ctx.textAlign = "center";
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

const SkillGraphCarousel = () => {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        const fetchedSkills = await fetchSkills();
        console.log("Fetched Skills:", fetchedSkills);
        setSkills(fetchedSkills);
      } catch (error) {
        console.error("Error fetching skills:", error);
      }
    };

    loadSkills();
  }, []);

  return (
    <Carousel
      responsive={responsive}
      autoPlaySpeed={3000}
      infinite
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
            whileHover={{ scale: 1.001 }}
          >
            <SkillGraph givenData={eachSkill} />
          </motion.div>
          <h5 className="skill-title">{eachSkill.skillTitle}</h5>
          <p className="skill-description">{eachSkill.skillDescription}</p>
        </motion.div>
      ))}
    </Carousel>
  );
};

export default SkillGraphCarousel;
