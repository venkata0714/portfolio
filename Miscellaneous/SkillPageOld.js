import { React, useState, useEffect } from "react";
import { zoomIn } from "../../services/variants";
import Marquee from "react-fast-marquee";
import "../../styles/SkillPage.css";
import { BackgroundBeams } from "./BackgroundBeams";

// ✅ Imports using only existing icons you listed:
import javascript from "../../assets/img/icons/javascript.svg";
import python from "../../assets/img/icons/python.svg";
import java from "../../assets/img/icons/java.svg";
import c from "../../assets/img/icons/c.svg";
import sql from "../../assets/img/icons/sql.svg";
import dsa from "../../assets/img/icons/dsa.svg";
import mongodb from "../../assets/img/icons/mongodb.svg";
import linux from "../../assets/img/icons/linux.svg";
import net from "../../assets/img/icons/net.svg";
import github from "../../assets/img/icons/github.svg";
import opencv from "../../assets/img/icons/opencv.svg";
import neuralnetwork from "../../assets/img/icons/neuralnetwork.svg";
import english from "../../assets/img/icons/english.svg";

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
import SkillGraphCarousel from "./SkillGraph";

// ✅ Your updated skill arrays:
const programmingSkills = [
  { logo: c, name: "C" },
  { logo: python, name: "Python" },
  { logo: javascript, name: "JavaScript" },
  { logo: java, name: "Java" },
  { logo: dsa, name: "OOPS" },
];

const databaseSkills = [
  { logo: sql, name: "MySQL" },
  { logo: mongodb, name: "MongoDB" },
  { logo: sql, name: "PostgreSQL" },
];

const cloudSkills = [
  { logo: linux, name: "AWS (ECS, Fargate, ECR, CloudFormation, EC2, RDS, EFS, Lambda, SES, SNS, S3)" },
];

const devopsSkills = [
  { logo: linux, name: "Docker" },
  { logo: linux, name: "Kubernetes" },
  { logo: net, name: "CI/CD" },
  { logo: github, name: "Git/GitHub" },
  { logo: linux, name: "Linux" },
];

const toolsSkills = [
  { logo: neuralnetwork, name: "Redis" },
  { logo: neuralnetwork, name: "pfSense" },
  { logo: opencv, name: "OpenCV" },
  { logo: neuralnetwork, name: "Q-learning" },
  { logo: neuralnetwork, name: "PID control" },
  { logo: neuralnetwork, name: "Deep RL" },
];

const softSkills = [
  { logo: english, name: "Agile" },
  { logo: english, name: "Analytical" },
  { logo: english, name: "Collaboration" },
  { logo: english, name: "Problem Solving" },
  { logo: english, name: "Critical Thinking" },
  { logo: english, name: "Organization" },
  { logo: english, name: "Communication" },
];

const SkillRibbon = ({ givenSkills }) => (
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

function SkillSection({ title, skills }) {
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth > 992);

  useEffect(() => {
    const handleResize = () => setIsLargeScreen(window.innerWidth > 992);
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
          <SkillRibbon givenSkills={skills.slice(0, Math.floor(skills.length / 2))} />
          <SkillRibbon givenSkills={skills.slice(Math.floor(skills.length / 2))} />
        </>
      ) : (
        <SkillRibbon givenSkills={skills} />
      )}
    </motion.div>
  );
}

// Register chart components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = () => {
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const data = {
    labels: ["C", "Python", "JavaScript", "Java", "OOPS"],
    datasets: [
      {
        label: "Hours of Coding",
        data: [300, 250, 200, 180, 160],
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
      title: {
        display: true,
        text: "Coding Hours by Language",
        color: "#edeeef",
      },
    },
    scales: {
      x: {
        ticks: { color: "#edeeef", font: { size: 12 } },
        grid: { display: true },
      },
      y: {
        beginAtZero: true,
        suggestedMax: 300,
        ticks: { color: "#edeeef", stepSize: 50, font: { size: 12 } },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
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
      <Bar className="bar-chart" key={screenWidth} data={data} options={options} />
    </motion.div>
  );
};

function SkillPage() {
  return (
    <section className="skill-container" id="skills">
      <AnimatePresence>
        <BackgroundBeams />
        <motion.div className="skill-div" variants={zoomIn(0)} initial="hidden" whileInView="show" exit="hidden">
          <div className="skill-box">
            <motion.h2 className="skill-heading" variants={fadeIn("right", 200, 0)} initial="hidden" whileInView="show" exit="hidden">
              Skills
            </motion.h2>
            <motion.div className="skill-section">
              <motion.p className="skill-paragraph" variants={fadeIn("right", 200, 0)} initial="hidden" whileInView="show" exit="hidden">
                <strong>My TechStack</strong>
              </motion.p>
              <motion.div className="skill-row">
                <SkillSection title="Programming Languages" skills={programmingSkills} />
                <SkillSection title="Database Systems" skills={databaseSkills} />
              </motion.div>
              <motion.div className="skill-row">
                <SkillSection title="Cloud Technologies" skills={cloudSkills} />
                <SkillSection title="DevOps & Version Control" skills={devopsSkills} />
              </motion.div>
              <motion.div className="skill-row">
                <SkillSection title="Other Tools & Technologies" skills={toolsSkills} />
                <SkillSection title="Soft Skills" skills={softSkills} />
              </motion.div>
              <motion.p className="skill-paragraph" variants={fadeIn("right", 200, 0)} initial="hidden" whileInView="show" exit="hidden">
                <strong>My Workspace</strong>
              </motion.p>
              <motion.div className="last-skill-row">
                <motion.div className="last-skill-column column1">
                  <BarChart />
                </motion.div>
                <motion.div className="last-skill-column column2">
                  <motion.div className="skill-graph-carousel" variants={zoomIn(0)} initial="hidden" whileInView="show" exit="hidden">
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
