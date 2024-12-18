import React from "react";

const ProjectTab = ({ data }) => {
  return (
    <div style={{height: "100vh"}}>
      <h2 style={{height: "100vh"}}>{data.title}</h2>
      <p style={{height: "100vh"}}>{data.description}</p>
      <a href={data.link} target="_blank" rel="noopener noreferrer">
        Learn More
      </a>
    </div>
  );
};

export default ProjectTab;
