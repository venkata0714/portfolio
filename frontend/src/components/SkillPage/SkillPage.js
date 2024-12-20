import { React, useState, useEffect } from "react";
import { zoomIn } from "../../services/variants";
import Marquee from "react-fast-marquee";
import "../../styles/SkillPage.css";
import { SpotlightBG } from "../AboutPage/SpotlightBG";
import javascript from "../../assets/img/icons/javascript.svg";
import python from "../../assets/img/icons/python.svg";
import react from "../../assets/img/icons/react.svg";
import mongodb from "../../assets/img/icons/mongodb.svg";
import cpp from "../../assets/img/icons/c++.svg";
import c from "../../assets/img/icons/c.svg";
import html from "../../assets/img/icons/html.svg";
import css from "../../assets/img/icons/css.svg";
import flask from "../../assets/img/icons/flask.svg";
import d3 from "../../assets/img/icons/d3.svg";
import sql from "../../assets/img/icons/sql.svg";
import dsa from "../../assets/img/icons/dsa.svg";
import discord from "../../assets/img/icons/discord.svg";
import ml from "../../assets/img/icons/machinelearning.svg";
import dl from "../../assets/img/icons/deeplearning.svg";
import lr from "../../assets/img/icons/logisticregression.svg";
import macos from "../../assets/img/icons/macos.svg";
import windows from "../../assets/img/icons/windows.svg";
import assembly from "../../assets/img/icons/assembly.svg";
import selenium from "../../assets/img/icons/selenium.svg";
import typescript from "../../assets/img/icons/typescript.svg";
import tensorflow from "../../assets/img/icons/tensorflow.svg";
import pandas from "../../assets/img/icons/pandas.svg";
import numpy from "../../assets/img/icons/numpy.svg";
import tableau from "../../assets/img/icons/tableau.svg";
import django from "../../assets/img/icons/django.svg";
import net from "../../assets/img/icons/net.svg";
import unity from "../../assets/img/icons/unity.svg";
import hive from "../../assets/img/icons/pyhive.svg";
import neuralnetwork from "../../assets/img/icons/neuralnetwork.svg";
import xml from "../../assets/img/icons/xml.svg";
import vanillajs from "../../assets/img/icons/vanillajs.svg";
import pyspark from "../../assets/img/icons/pyspark.svg";
import swift from "../../assets/img/icons/swift.svg";
import java from "../../assets/img/icons/java.svg";
import english from "../../assets/img/icons/english.svg";
import hindi from "../../assets/img/icons/hindi.svg";
import french from "../../assets/img/icons/french.svg";
import arabic from "../../assets/img/icons/arabic.svg";
import japanese from "../../assets/img/icons/japanese.svg";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "../../services/variants";
import { BackgroundBeams } from "./BackgroundBeams";

import SkillGraphCarousel from "./SkillGraph";

const proficientSkills = [
  { logo: javascript, name: "JavaScript" },
  { logo: python, name: "Python" },
  { logo: react, name: "React" },
  { logo: mongodb, name: "MongoDB" },
  { logo: cpp, name: "C++" },
  { logo: c, name: "C" },
  { logo: html, name: "HTML" },
  { logo: css, name: "CSS" },
  { logo: flask, name: "Flask" },
  { logo: d3, name: "D3.js" },
  { logo: sql, name: "SQL" },
  { logo: dsa, name: "Data Structures & Algorithms" },
  { logo: discord, name: "Discord.js/.py" },
  { logo: ml, name: "Machine Learning Algorithms" },
  { logo: dl, name: "Deep Learning Algorithms" },
  { logo: lr, name: "Logistic Regression" },
  { logo: macos, name: "MacOS" },
  { logo: windows, name: "Windows" },
];

const intermediateSkills = [
  { logo: assembly, name: "Assembly" },
  { logo: selenium, name: "Selenium" },
  { logo: typescript, name: "TypeScript" },
  { logo: tensorflow, name: "TensorFlow" },
  { logo: pandas, name: "Pandas" },
  { logo: numpy, name: "NumPy" },
  { logo: tableau, name: "Tableau" },
  { logo: django, name: "Django" },
  { logo: net, name: ".NET Framework" },
  { logo: unity, name: "Unity" },
];

const beginnerSkills = [
  { logo: hive, name: "Hive" },
  { logo: neuralnetwork, name: "Neural Network Architecture" },
  { logo: xml, name: "XML" },
  { logo: vanillajs, name: "Vanilla JS" },
  { logo: neuralnetwork, name: "Recurrent Neural Network" },
  { logo: pyspark, name: "PySpark" },
  { logo: swift, name: "Swift" },
  { logo: java, name: "Java" },
];

const languageSkills = [
  { logo: english, name: "English" },
  { logo: hindi, name: "Hindi" },
  { logo: french, name: "French" },
  { logo: japanese, name: "Japanese" },
  { logo: arabic, name: "Arabic" },
];
const SkillRibbon = ({ givenSkills }) => {
  return (
    <motion.div
      className="ribbon-container"
      variants={fadeIn("left", 200, 0)}
      initial="hidden"
      whileInView="show"
      exit="hidden"
    >
      <Marquee
        autoFill
        direction="left"
        pauseOnClick
        loop={0}
        play={1}
        speed={15}
        style={{ maxWidth: "100%", overflow: "hidden" }}
      >
        {givenSkills.map((skill, index) => (
          <div key={index} className="ribbon-item">
            <img className="skill-icon" src={skill.logo} alt={skill.name} />
            <span className="skill-name">{skill.name}</span>
          </div>
        ))}
      </Marquee>
    </motion.div>
  );
};

function SkillSection({ title, skills }) {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 992);

  // Listen for screen resizing
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth > 992);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <motion.div className="skill-column">
      <motion.p
        className="skill-paragraph"
        variants={fadeIn("right", 200, 0)}
        initial="hidden"
        whileInView="show"
        exit="hidden"
      >
        {title}
      </motion.p>
      {isLargeScreen && skills.length > 6 ? (
        <>
          <SkillRibbon
            givenSkills={skills.slice(0, Math.floor(skills.length / 2))}
          />
          <SkillRibbon
            givenSkills={skills.slice(Math.floor(skills.length / 2))}
          />
        </>
      ) : (
        <SkillRibbon givenSkills={skills} />
      )}
    </motion.div>
  );
}

// Register necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  // Enhanced Data
  const data = {
    labels: ["JavaScript", "Python", "C++", "HTML", "CSS", "Flask", "SQL"],
    datasets: [
      {
        label: "Hours of Coding",
        data: [250, 200, 150, 100, 80, 50, 60],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 2,
        borderRadius: 6, // Rounded bars
      },
    ],
  };

  // Responsive Chart Options
  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow dynamic sizing
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        className: "skill-paragraph",
        text: "Coding Hours by Language",
        color: "#edeeef",
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#edeeef",
          font: {
            size: 12,
          },
        },
        grid: {
          display: true,
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: 250,
        ticks: {
          color: "#edeeef",
          stepSize: 50,
          font: {
            size: 12,
          },
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)",
        },
      },
    },
  };

  return (
    <motion.div
      className="bar-chart-container"
      variants={zoomIn(0)}
      initial="hidden"
      whileInView="show"
      exit="hidden"
    >
      <Bar
        className="bar-chart"
        key={screenWidth}
        data={data}
        options={options}
      />
    </motion.div>
  );
};

function SkillPage() {
  return (
    <section className="skill-container" id="skills">
      <AnimatePresence>
        {/* <BackgroundBeams /> */}
        <SpotlightBG />
        <motion.div
          className="skill-div"
          variants={zoomIn(0)}
          initial="hidden"
          whileInView="show"
          exit="hidden"
        >
          <div className="skill-box">
            <motion.h2
              className="skill-heading"
              variants={fadeIn("right", 200, 0)}
              initial="hidden"
              whileInView="show"
              exit="hidden"
            >
              Skills
            </motion.h2>
            <motion.div className="skill-section">
              <motion.p
                className="skill-paragraph"
                variants={fadeIn("right", 200, 0)}
                initial="hidden"
                whileInView="show"
                exit="hidden"
              >
                <strong>My TechStack</strong>
              </motion.p>
              <motion.div className="skill-row">
                <SkillSection
                  title="Proficient Skills"
                  skills={proficientSkills}
                />
                <SkillSection
                  title="Intermediate Skills"
                  skills={intermediateSkills}
                />
              </motion.div>
              <motion.div className="skill-row">
                <SkillSection
                  title="Beginners Skills"
                  skills={beginnerSkills}
                />
                <SkillSection title="My Languages" skills={languageSkills} />
              </motion.div>
              <motion.p
                className="skill-paragraph"
                variants={fadeIn("right", 200, 0)}
                initial="hidden"
                whileInView="show"
                exit="hidden"
              >
                <strong>My Workspace</strong>
              </motion.p>
              <motion.div className="last-skill-row">
                <motion.div className="last-skill-column column1">
                  <BarChart />
                </motion.div>
                <motion.div className="last-skill-column column2">
                  <motion.div
                    className="skill-graph-carousel"
                    variants={zoomIn(0)}
                    initial="hidden"
                    whileInView="show"
                    exit="hidden"
                  >
                    <SkillGraphCarousel />
                  </motion.div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}

export default SkillPage;
