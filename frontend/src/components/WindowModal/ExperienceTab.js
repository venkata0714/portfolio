import React from "react";

const ExperienceTab = ({ data }) => {
  return (
    <div style={{height: "100vh"}}>
      <h2>{data.company}</h2>
      <p>{data.role}</p>
      <p>{data.duration}</p>
    </div>
  );
};

export default ExperienceTab;
