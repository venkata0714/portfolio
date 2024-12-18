import React from "react";

const HonorsTab = ({ data }) => {
  return (
    <div style={{height: "100vh"}}>
      <h2>{data.title}</h2>
      <p>{data.date}</p>
      <p>{data.description}</p>
    </div>
  );
};

export default HonorsTab;
