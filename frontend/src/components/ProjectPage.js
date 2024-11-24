import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Slider from "react-slick";
import "../styles/ProjectPage.css";
import { fetchProjects } from "../services/projectService";

function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [cardStates, setCardStates] = useState([]);

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
    <motion.section className="project-container" id="projects">
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
              <a className="project-title" href={`#${project.projectLink}`}>
                {project.projectTitle}
              </a>
              <hr />
              <p className="project-tagline">{project.projectTagline}</p>
              <button
                className="learn-more-button"
                onClick={() => handleLearnMore(index)}
              >
                Learn More →
              </button>
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
            <p className="modal-tagline">{selectedProject.projectTagline}</p>
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
    </motion.section>
  );
}

export default ProjectPage;
