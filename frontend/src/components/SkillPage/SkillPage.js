import React from "react";
import "../../styles/SkillPage.css";
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
// import french from "../../assets/img/icons/french.svg";
// import arabic from "../../assets/img/icons/arabic.svg";
// import japanese from "../../assets/img/icons/japanese.svg";
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
import { motion } from "framer-motion";
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
  // { logo: french, name: "French" },
  // { logo: japanese, name: "Japanese" },
  // { logo: arabic, name: "Arabic" },
];
const SkillRibbon = ({ givenSkills }) => {
  return (
    <div className="ribbon-container">
      <div className="ribbon-track">
        {givenSkills.map((skill, index) => (
          <div key={index} className="ribbon-item">
            <img className="skill-icon" src={skill.logo} alt="" />
            <span className="skill-name">{skill.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Register the required components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = () => {
  // Placeholder Data
  const data = {
    labels: ["JavaScript", "Python", "C++", "HTML", "CSS", "Flask", "SQL"],
    datasets: [
      {
        label: "Hours of Coding",
        data: [250, 200, 150, 100, 80, 50, 60], // Hours for each language
        backgroundColor: [
          "rgba(75, 192, 192, 0.2)", // JavaScript
          "rgba(153, 102, 255, 0.2)", // Python
          "rgba(255, 159, 64, 0.2)", // C++
          "rgba(255, 99, 132, 0.2)", // HTML
          "rgba(54, 162, 235, 0.2)", // CSS
          "rgba(255, 206, 86, 0.2)", // Flask
          "rgba(75, 192, 192, 0.2)", // SQL
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)", // JavaScript
          "rgba(153, 102, 255, 1)", // Python
          "rgba(255, 159, 64, 1)", // C++
          "rgba(255, 99, 132, 1)", // HTML
          "rgba(54, 162, 235, 1)", // CSS
          "rgba(255, 206, 86, 1)", // Flask
          "rgba(75, 192, 192, 1)", // SQL
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart Options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#edeeef", // White labels for legend
        },
      },
      title: {
        display: true,
        text: "Coding Hours by Language",
        color: "#edeeef", // White title
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: "#edeeef", // White X-axis labels
        },
        grid: {
          display: false, // Hide grid lines on X-axis
        },
      },
      y: {
        ticks: {
          color: "#edeeef", // White Y-axis labels
          callback: function (value) {
            // Custom Y-axis scale
            const customTicks = [25, 50, 100, 250, 500];
            return customTicks.includes(value) ? value : "";
          },
        },
        beginAtZero: true,
        grid: {
          color: "rgba(255, 255, 255, 0.1)", // Subtle grid lines
        },
        suggestedMax: 500, // Max value on Y-axis
      },
    },
  };

  return (
    <div className="bar-chart-container">
      <Bar data={data} options={options} />
    </div>
  );
};

function SkillPage() {
  return (
    <section className="skill-container" id="skills">
      <BackgroundBeams />
      <motion.div className="skill-div" drag="false">
        <div className="skill-box">
          <motion.h2
            className="skill-heading"
            variants={fadeIn("right", 200, 1)}
            initial="hidden"
            whileInView="show"
            exit="hidden"
          >
            Skills
          </motion.h2>
          <motion.div className="skill-section">
            <motion.p
              className="skill-paragraph"
              variants={fadeIn("right", 200, 1)}
              initial="hidden"
              whileInView="show"
              exit="hidden"
            >
              My TechStack
            </motion.p>
            <motion.div className="skill-row">
              <motion.div className="skill-column">
                <motion.p
                  className="skill-paragraph"
                  variants={fadeIn("right", 200, 1)}
                  initial="hidden"
                  whileInView="show"
                  exit="hidden"
                >
                  Proficient Skills
                </motion.p>
                <SkillRibbon
                  givenSkills={proficientSkills.slice(
                    0,
                    Math.floor(proficientSkills.length / 2)
                  )}
                />
                <SkillRibbon
                  givenSkills={proficientSkills.slice(
                    Math.floor(proficientSkills.length / 2)
                  )}
                />
              </motion.div>
              <motion.div className="skill-column">
                <motion.p
                  className="skill-paragraph"
                  variants={fadeIn("right", 200, 1)}
                  initial="hidden"
                  whileInView="show"
                  exit="hidden"
                >
                  Intermediate Skills
                </motion.p>
                <SkillRibbon givenSkills={intermediateSkills} />
              </motion.div>
            </motion.div>
            <motion.div className="skill-row">
              <motion.div className="skill-column">
                <motion.p
                  className="skill-paragraph"
                  variants={fadeIn("right", 200, 1)}
                  initial="hidden"
                  whileInView="show"
                  exit="hidden"
                >
                  Beginners Skills
                </motion.p>
                <SkillRibbon givenSkills={beginnerSkills} />
              </motion.div>
              <motion.div className="skill-column">
                <motion.p
                  className="skill-paragraph"
                  variants={fadeIn("right", 200, 1)}
                  initial="hidden"
                  whileInView="show"
                  exit="hidden"
                >
                  My Languages
                </motion.p>
                <SkillRibbon givenSkills={languageSkills} />
              </motion.div>
            </motion.div>
            <motion.p
              className="skill-paragraph"
              variants={fadeIn("right", 200, 1)}
              initial="hidden"
              whileInView="show"
              exit="hidden"
            >
              My Workspace
            </motion.p>
            <motion.div className="skill-row">
              <motion.div className="skill-column">
                <BarChart />
              </motion.div>
              <motion.div className="skill-column">
                <SkillGraphCarousel />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default SkillPage;
