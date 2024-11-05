import React, { useEffect, useState } from 'react';
import { fetchProjects } from '../services/projectService';

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  if (loading) return <p>Loading projects...</p>;

  return (
    <div className="projects-container">
      <h2>Projects</h2>
      <ul className="projects-list">
        {projects.map((project) => (
          <li key={project._id} className="project-card">
            <h3>{project.projectTitle}</h3>
            <p><strong>Tagline:</strong> {project.projectTagline}</p>
            <p><strong>Timeline:</strong> {project.projectTimeline}</p>
            
            {/* Display project paragraphs */}
            {project.projectParagraphs && project.projectParagraphs.length > 0 && (
              <div className="project-paragraphs">
                {project.projectParagraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            )}

            {/* Display project images */}
            {project.projectImages && project.projectImages.length > 0 && (
              <div className="project-images">
                {project.projectImages.map((image, index) => (
                  <img key={index} src={image} alt={`${project.projectTitle} Image ${index + 1}`} />
                ))}
              </div>
            )}

            {/* Display project URLs */}
            {project.projectURLs && project.projectURLs.length > 0 && (
              <div className="project-links">
                <strong>Links:</strong>
                <ul>
                  {project.projectURLs.map((url, index) => (
                    <li key={index}>
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        Link {index + 1}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Projects;
