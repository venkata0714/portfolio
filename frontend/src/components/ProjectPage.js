import React, { useState, useEffect } from "react";
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

  const handleReadMore = (index) => {
    setSelectedProject(projects[index]);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProject(null);
  };

  return (
    <section className="project-container" id="projects">
      {projects.map((project, index) => (
        <div
          key={index}
          className="project-card"
          style={{ backgroundImage: `url(${project.projectImages[0]})` }}
        >
          <div className="project-overlay">
            <h3 className="project-title">{project.projectTitle}</h3>
            <p className="project-subtitle">{project.projectSubTitle}</p>
            <span className="project-date">{project.projectTimeline}</span>
            <button
              className="read-more-button"
              onClick={() => handleReadMore(index)}
            >
              Read More →
            </button>
          </div>
        </div>
      ))}

      {showModal && selectedProject && (
        <div className="project-modal">
          <div className="modal-content">
            <button className="close-button" onClick={closeModal}>
              &times;
            </button>
            <h2>{selectedProject.projectTitle}</h2>
            <p className="modal-date">{selectedProject.projectTimeline}</p>
            <p>{selectedProject.projectTagline}</p>
            {selectedProject.projectParagraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
            {selectedProject.projectURLs.map((url, i) => (
              <a key={i} href={url} target="_blank" rel="noopener noreferrer">
                {url}
              </a>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

export default ProjectPage;
