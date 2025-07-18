import React from "react";
import { zoomIn, fadeIn } from "../../services/variants";
import "../../styles/SkillPage.css";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { motion } from "framer-motion";

// Programming Languages icons
import c from "../../assets/img/icons/c.svg";
import python from "../../assets/img/icons/python.svg";
import javascript from "../../assets/img/icons/javascript.svg";
import java from "../../assets/img/icons/java.svg";
import dsa from "../../assets/img/icons/dsa.svg"; // OOPS placeholder

// Database Systems icons
import sql from "../../assets/img/icons/sql.svg";
import mongodb from "../../assets/img/icons/mongodb.svg";
import hive from "../../assets/img/icons/hive.svg"; // PostgreSQL placeholder

// Cloud & DevOps icons
import linux from "../../assets/img/icons/linux.svg";          // AWS + Linux
import kubernetes from "../../assets/img/icons/window.svg"; // Docker placeholder
import nodejs from "../../assets/img/icons/nodejs.svg";       // Kubernetes placeholder
import github from "../../assets/img/icons/github.svg";       // Git/GitHub + CI/CD

// Other Tools & Technologies icons
import matplotlib from "../../assets/img/icons/matplotlib.svg"; // Redis placeholder
import selenium from "../../assets/img/icons/selenium.svg";     // pfSense placeholder
import deeplearning from "../../assets/img/icons/deeplearning.svg"; // OpenCV/Q-learning fallback
import machinelearning from "../../assets/img/icons/machinelearning.svg"; // PID control
import neuralnetwork from "../../assets/img/icons/neuralnetwork.svg"; // Deep RL

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const skillCategories = [
  {
    title: "Programming Languages",
    subtitle: "Proficient in versatile languages for modern development.",
    skills: [
      { logo: c, name: "C" },
      { logo: python, name: "Python" },
      { logo: javascript, name: "JavaScript" },
      { logo: java, name: "Java" },
      { logo: dsa, name: "OOPS" },
    ],
  },
  {
    title: "Database Systems",
    subtitle: "Reliable relational & NoSQL database solutions.",
    skills: [
      { logo: sql, name: "MySQL" },
      { logo: mongodb, name: "MongoDB" },
      { logo: hive, name: "Postgres" },
    ],
  },
  {
    title: "Cloud & DevOps",
    subtitle: "Deploying scalable systems and automating delivery.",
    skills: [
      { logo: linux, name: "AWS" },
      { logo: kubernetes, name: "Docker" },
      { logo: nodejs, name: "Containers" },
      { logo: dsa, name: "CI/CD" },
      { logo: github, name: "Github" },
    ],
  },
  {
    title: "Other Tools & Technologies",
    subtitle: "Specialized tools and technologies used in projects.",
    skills: [
      { logo: matplotlib, name: "Redis" },
      { logo: selenium, name: "pfSense" },
      { logo: deeplearning, name: "OpenCV" },
      { logo: deeplearning, name: "Q-learning" },
      { logo: machinelearning, name: "PID control" },
      { logo: neuralnetwork, name: "Deep RL" },
    ],
  },
];

const BarChart = () => {
  const data = {
    labels: ["C", "Python", "JavaScript", "Java"],
    datasets: [
      {
        label: "Hours of Coding",
        data: [300, 250, 200, 175],
        backgroundColor: [
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
        ],
        borderColor: [
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
        ],
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Coding Hours by Language", color: "#edeeef" },
    },
    scales: {
      x: { ticks: { color: "#edeeef" }, grid: { display: true } },
      y: {
        beginAtZero: true,
        suggestedMax: 350,
        ticks: { color: "#edeeef", stepSize: 50 },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  };

  return (
    <motion.div className="bar-chart-container" variants={zoomIn(0)} initial="hidden" whileInView="show">
      <Bar className="bar-chart" data={data} options={options} />
    </motion.div>
  );
};

const SkillSection = ({ title, subtitle, skills }) => (
  <motion.div className="skill-column" variants={zoomIn(0.1)} initial="hidden" whileInView="show">
    <h3 className="skill-paragraph">{title}</h3>
    <p className="skill-subtitle">{subtitle}</p>
    <div className="skill-items">
      {skills.map((skill, idx) => (
        <div key={idx} className="skill-item">
          <img src={skill.logo} alt={skill.name} className="skill-icon" />
          <span className="skill-name">{skill.name}</span>
        </div>
      ))}
    </div>
  </motion.div>
);

function SkillPage() {
  return (
    <section className="skill-container" id="skills">
      <motion.div className="skill-div" variants={zoomIn(0)} initial="show" whileInView="show">
        <div className="skill-box">
          <motion.h2 className="skill-heading" variants={fadeIn("right", 200, 0)} initial="hidden" animate="show">
            Skills
          </motion.h2>
          <div className="grid-layout">
            <div className="grid-item">
              <SkillSection {...skillCategories[0]} />
            </div>
            <div className="grid-item">
              <SkillSection {...skillCategories[1]} />
            </div>
            <div className="grid-item">
              <SkillSection {...skillCategories[2]} />
            </div>
            <div className="grid-item">
              <BarChart />
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default SkillPage;
