import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Slider from "react-slick";
import { zoomIn } from "../variants";
import { styled } from "@stitches/react";
import "../styles/ProjectPage.css";
import GradientBG from "./GradientBG"; // Adjust the path as necessary
import { fetchProjects } from "../services/projectService";

function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cardStates, setCardStates] = useState([]);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    const offset = 72; // Adjust based on your navbar height
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.scrollY - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    async function getProjects() {
      try {
        const data = await fetchProjects();
        setProjects(data);
        // Initialize card states for each project
        setCardStates(
          data.map(() => ({
            mousePosition: { x: 0, y: 0 },
            isHovering: false,
          }))
        );
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }
    getProjects();
  }, []);

  const handleMouseMove = (event, index) => {
    const { clientX, clientY } = event;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) / 20;
    const y = (clientY - (rect.top + rect.height / 2)) / 20;

    setCardStates((prevStates) =>
      prevStates.map((state, i) =>
        i === index
          ? {
              ...state,
              mousePosition: { x, y },
            }
          : state
      )
    );
  };

  const handleMouseEnter = (index) => {
    setCardStates((prevStates) =>
      prevStates.map((state, i) =>
        i === index
          ? {
              ...state,
              isHovering: true,
            }
          : state
      )
    );
  };

  const handleMouseLeave = (index) => {
    setCardStates((prevStates) =>
      prevStates.map((state, i) =>
        i === index
          ? {
              ...state,
              isHovering: false,
              mousePosition: { x: 0, y: 0 },
            }
          : state
      )
    );
  };

  const handleLearnMore = (index) => {
    setSelectedProject(projects[index]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
  };

  return (
    <motion.section className="project-page-container" id="projects">
      <GradientBG />
      <div className="project-page-div">
        <h2 className="section-title">My Projects</h2>
        <div className="project-container">
          {projects.map((project, index) => {
            const { mousePosition, isHovering } = cardStates[index] || {
              mousePosition: { x: 0, y: 0 },
              isHovering: false,
            };

            return (
              <motion.div
                key={index}
                className="project-card"
                onMouseMove={(event) => handleMouseMove(event, index)}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
                style={{
                  transform: isHovering
                    ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1, 1, 1)`
                    : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
                  transition: "transform 0.1s ease-out",
                }}
              >
                {/* Project Content */}
                <div className="project-info" id={project.projectLink}>
                  <div className="project-header">
                    {project.projectSubTitle && (
                      <span>{project.projectSubTitle} | </span>
                    )}
                    <span>{project.projectTimeline}</span>
                  </div>
                  <a
                    className="project-title"
                    href={`#${project.projectLink}`}
                    onClick={(e) => {
                      e.preventDefault(); // Prevent the default anchor tag behavior
                      scrollToSection(project.projectLink); // Call the function with the project's link ID
                    }}
                  >
                    {project.projectTitle}
                  </a>
                  <hr />
                  <p className="project-tagline">{project.projectTagline}</p>
                  <motion.div
                    className="learn-button-motioned"
                    variants={zoomIn(1)}
                    initial="hidden"
                    animate="show"
                    drag
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    dragElastic={0.3}
                    dragTransition={{
                      bounceStiffness: 250,
                      bounceDamping: 15,
                    }}
                  >
                    <StyledButton
                      onClick={(e) => {
                        e.preventDefault();
                        handleLearnMore(index);
                      }}
                    >
                      <ButtonShadow />
                      <ButtonEdge />
                      <ButtonLabel>Learn More →</ButtonLabel>
                    </StyledButton>
                  </motion.div>
                </div>

                {/* Project Image */}
                <div
                  className="project-image"
                  style={{
                    backgroundImage: `url(${project.projectImages[0]})`,
                  }}
                ></div>
              </motion.div>
            );
          })}

          {showModal && selectedProject && (
            <motion.div
              className="project-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="modal-content">
                <button className="close-button" onClick={closeModal}>
                  &times;
                </button>
                <h2>{selectedProject.projectTitle}</h2>
                <p className="modal-date">{selectedProject.projectTimeline}</p>
                <p className="modal-tagline">
                  {selectedProject.projectTagline}
                </p>
                <Slider {...sliderSettings}>
                  {selectedProject.projectImages.map((image, i) => (
                    <img key={i} src={image} alt={`Project ${i + 1}`} />
                  ))}
                </Slider>
                {selectedProject.projectParagraphs.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.section>
  );
}

export default ProjectPage;

// Styled Components for Button
const ButtonPart = styled("span", {
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  borderRadius: 8,
});

const ButtonShadow = styled(ButtonPart, {
  background: "hsl(0deg 0% 0% / 0.1)",
  transform: "translateY(2px)",
  transition: "transform 250ms ease-out",
});

const ButtonEdge = styled(ButtonPart, {
  background: `linear-gradient(
      to left,
      hsl(0deg 0% 69%) 0%,
      hsl(0deg 0% 85%) 8%,
      hsl(0deg 0% 85%) 92%,
      hsl(0deg 0% 69%) 100%
    )`,
});

const ButtonLabel = styled("span", {
  fontFamily: "Montserrat",
  fontSize: "14px",
  display: "block",
  position: "relative",
  borderRadius: 5,
  color: "#212529",
  padding: "1rem 1.5rem",
  background: "#f8f9fa",
  transform: "translateY(-4px)",
  width: "100%",
  userSelect: "none",
  transition:
    "transform 250ms ease-out, background-color 0.3s ease, color 0.3s ease",

  "&:hover": {
    backgroundColor: "#fcbc1d",
    color: "#212529",
    transform: "scale(1.05)",
  },
});

const StyledButton = styled("button", {
  border: "none",
  fontWeight: 600,
  width: "fit-content",
  cursor: "pointer",
  background: "transparent",
  position: "relative",
  padding: 0,
  transition: "filter 250ms ease-out",

  "&:hover": {
    filter: "brightness(110%)",

    [`& ${ButtonLabel}`]: {
      transform: "translateY(-8px)",
    },

    [`& ${ButtonShadow}`]: {
      transform: "translateY(6px)",
    },
  },

  "&:active": {
    [`& ${ButtonLabel}`]: {
      transform: "translateY(-2px)",
      transition: "transform 34ms",
    },

    [`& ${ButtonShadow}`]: {
      transform: "translateY(1px)",
      transition: "transform 34ms",
    },
  },
});
