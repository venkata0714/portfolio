import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Slider from "react-slick";
import "../styles/ProjectPage.css";
import { fetchProjects } from "../services/projectService";

function ProjectPage() {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function getProjects() {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }
    getProjects();
  }, []);

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
    <section className="project-container" id="projects">
      {projects.map((project, index) => (
        <motion.div
          key={index}
          className="project-card"
          initial={{ opacity: 0, y: 100 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          whileHover={{ scale: 1.02 }}
        >
          {/* Left: Project Info */}
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

          {/* Right: Project Image */}
          <div
            className="project-image"
            style={{
              backgroundImage: `url(${project.projectImages[0]})`,
            }}
          ></div>
        </motion.div>
      ))}

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
    </section>
  );
}

export default ProjectPage;
