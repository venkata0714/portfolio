import React from "react";

const InvolvementTab = ({ data }) => {
  return (
    <div style={{height: "100vh"}}>
      <h2>{data.organization}</h2>
      <p>{data.position}</p>
      <p>{data.description}</p>
    </div>
  );
};

export default InvolvementTab;
