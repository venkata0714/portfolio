import React from "react";

const ProjectTab = ({ data }) => {
  return (
    <div style={{ fontSize: "0.5rem", minHeight: "100vh" }}>
      {Object.keys(data).map((key) => (
        <div key={key}>
          <h4 style={{ marginBottom: "5px", color: "#555" }}>{key}</h4>
          <div>
            {key === "link" ? (
              <a href={data[key]} target="_blank" rel="noopener noreferrer">
                {data[key]}
              </a>
            ) : (
              data[key]
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectTab;
