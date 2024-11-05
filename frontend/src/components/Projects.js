import React, { useEffect, useState } from 'react';
import { fetchProjects } from '../services/projectService';

const Projects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const getProjects = async () => {
      const data = await fetchProjects();
      setProjects(data);
    };
    getProjects();
  }, []);

  return (
    <div>
      <h1>Projects</h1>
      <ul>
        {projects.map((project, index) => (
          <li key={index}>
            <h2>{project.projectTitle}</h2>
            <p>{project.projectTagline}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Projects;
