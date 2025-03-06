import { React, useState, useEffect } from "react";
import { zoomIn, fadeIn } from "../../services/variants";
import "../../styles/SkillPage.css";
import github from "../../assets/img/icons/github.png";
import SkillBG from "./SkillBG.js";
import SkillGraphCarousel from "./SkillGraph";
import SkillSection from "./SkillSection";
import { fetchSkills } from "../../services/skillService";
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

// Register necessary components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const BarChart = ({ topLangs, isBatterySavingOn }) => {
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
    labels: topLangs.labels,
    datasets: [
      {
        label: "Hours of Coding",
        data: topLangs.data,
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
        suggestedMax: 300,
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
        animation: {
          duration: 5000, // 2 seconds for the animation
          easing: "easeOutQuart", // Smooth easing for the animation
        },
      },
    },
  };

  return (
    <motion.div
      className="bar-chart-container"
      variants={isBatterySavingOn ? {} : zoomIn(0)}
      initial="hidden"
      whileInView="show"
      exit="hidden"
    >
      <Bar
        className="bar-chart"
        key={`bar-chart-${screenWidth}`}
        data={data}
        options={options}
        aria-label="Bar chart displaying coding hours by language"
      />
    </motion.div>
  );
};

function SkillPage({ isBatterySavingOn }) {
  const [skillScreenWidth, setSkillScreenWidth] = useState(window.innerWidth);
  const [topLangs, setTopLangs] = useState({ labels: [], data: [] });
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

  useEffect(() => {
    const fetchTopLangData = async () => {
      const url = `${process.env.REACT_APP_API_URI}/top-langs`;

      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const svgData = await response.text();

        // Parse the SVG data to extract lang-name innerHTML
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgData, "image/svg+xml");
        const langNames = svgDoc.querySelectorAll(".lang-name");

        const extractedLangNames = Array.from(langNames).map((el) =>
          el.innerHTML.trim()
        );

        // Process the first 5 elements to create the topLangs dictionary
        let processedData = extractedLangNames.slice(0, 5).reduce(
          (acc, lang) => {
            const parts = lang.split(" ");
            const name = parts.slice(0, -1).join(" "); // All but the last word
            const value =
              parseFloat(parts[parts.length - 1].replace("%", "")) * 7; // Convert percentage to float and multiply by 6

            acc.labels.push(name);
            acc.data.push(parseFloat(value.toFixed(2)));
            return acc;
          },
          { labels: [], data: [] }
        );

        // Calculate the total hours and assign remaining hours to C++
        const totalHours = processedData.data.reduce(
          (sum, hours) => sum + hours,
          0
        );
        const remainingHours = 900 - totalHours;
        const cppIndex = processedData.labels.indexOf("C++");

        if (cppIndex !== -1) {
          processedData.data[cppIndex] = parseFloat(remainingHours.toFixed(2));
        } else {
          processedData.labels.push("C++");
          processedData.data.push(parseFloat(remainingHours.toFixed(2)));
        }

        // Sort the processedData by data in descending order
        const sortedIndices = [...processedData.data.keys()].sort(
          (a, b) => processedData.data[b] - processedData.data[a]
        );

        processedData = {
          labels: sortedIndices.map((index) => processedData.labels[index]),
          data: sortedIndices.map((index) => processedData.data[index]),
        };

        setTopLangs(processedData);

        // console.log("Extracted Lang Names: ", extractedLangNames);
        // console.log("Top Langs Processed Data: ", processedData);
      } catch (error) {
        console.error("Error fetching TopLangData:", error);
      }
    };

    fetchTopLangData();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setSkillScreenWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return (
    <section
      className="skill-container"
      id="skills"
      style={{ overflow: "hidden" }}
    >
      <SkillBG />
      {/* <EnhancedHexagonalGrid /> */}
      {/* <SpotlightBG /> */}
      <motion.div
        className="skill-div"
        variants={isBatterySavingOn ? {} : zoomIn(0)}
        initial="hidden"
        whileInView="show"
        exit="hidden"
      >
        <div className="skill-box">
          <motion.h2
            className="skill-heading"
            variants={isBatterySavingOn ? {} : fadeIn("right", 200, 0)}
            initial="hidden"
            whileInView="show"
            exit="hidden"
          >
            Skills
          </motion.h2>
          <motion.div className="skill-section">
            <motion.p
              className="skill-paragraph"
              variants={isBatterySavingOn ? {} : fadeIn("right", 200, 0)}
              initial="hidden"
              whileInView="show"
              exit="hidden"
            >
              <strong>My TechStack</strong>
            </motion.p>
            <motion.div
              className="skill-carousel-container"
              key={`skill-carousel-${skillScreenWidth}`}
              variants={isBatterySavingOn ? {} : zoomIn(0)}
              initial="hidden"
              whileInView="show"
              exit="hidden"
            >
              <SkillSection isBatterySavingOn={isBatterySavingOn} />
            </motion.div>
            <motion.p
              className="skill-paragraph"
              variants={isBatterySavingOn ? {} : fadeIn("right", 200, 0)}
              initial="hidden"
              whileInView="show"
              exit="hidden"
            >
              <strong>My Workspace</strong>
            </motion.p>
            <motion.div className="last-skill-row">
              <motion.div className="last-skill-column column1">
                <a
                  href="https://github.com/Kartavya904/#topLang"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="github-icon"
                >
                  <img src={github} alt="GitHub" />
                </a>

                <BarChart
                  key={topLangs}
                  topLangs={topLangs}
                  isBatterySavingOn={isBatterySavingOn}
                />
              </motion.div>
              <motion.div className="last-skill-column column2">
                <motion.div
                  className="skill-graph-carousel"
                  variants={isBatterySavingOn ? {} : zoomIn(0)}
                  initial="hidden"
                  whileInView="show"
                  exit="hidden"
                >
                  <SkillGraphCarousel
                    skills={skills}
                    isBatterySavingOn={isBatterySavingOn}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

export default SkillPage;
