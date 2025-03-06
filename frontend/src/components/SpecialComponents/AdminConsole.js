import React, { useState, useEffect } from "react";
import { FaSignOutAlt, FaDatabase, FaArrowLeft } from "react-icons/fa";
import axios from "axios";
import "../../styles/AdminConsole.css";

const API_URL = process.env.REACT_APP_API_URI;

const tables = [
  { title: "Skills", key: "skillsCollection" },
  { title: "Skill Graph", key: "skillsTable" },
  { title: "Projects", key: "projectTable" },
  { title: "Experiences", key: "experienceTable" },
  { title: "Involvements", key: "involvementTable" },
  { title: "Honors", key: "honorsExperienceTable" },
  { title: "Year In Reviews", key: "yearInReviewTable" },
  { title: "User Management", key: "KartavyaPortfolio" },
];

const AdminConsole = ({ logout }) => {
  const [collectionCounts, setCollectionCounts] = useState({});
  const [selectedTable, setSelectedTable] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/collection-counts`).then((res) => {
      setCollectionCounts(res.data);
    });
  }, []);

  return (
    <div className="admin-console">
      <div className="admin-title-bar">
        {selectedTable && (
          <button className="back-btn" onClick={() => setSelectedTable(null)}>
            <FaArrowLeft />
          </button>
        )}
        <div className="admin-title">Admin Database Explorer</div>
        <div className="admin-btn-group">
          <button
            className="db-btn"
            onClick={() =>
              window.open(
                "https://cloud.mongodb.com/v2/672950dc517fd96235a1c212#/metrics/replicaSet/672951f5bf98b168a06dfdb4/explorer/KartavyaPortfolioDB",
                "_blank"
              )
            }
          >
            <FaDatabase />
          </button>
          <button
            className="logout-btn"
            onClick={() => window.confirm("Confirm logout?") && logout()}
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>

      {!selectedTable ? (
        <div className="admin-dashboard">
          {tables.map((table) => (
            <div
              key={table.key}
              className="dashboard-box"
              onClick={() => setSelectedTable(table)}
            >
              <h3>{table.title}</h3>
              <span className="count">
                {collectionCounts[table.key] || 0} Items
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="expanded-view">
          <h2>{selectedTable.title}</h2>
          <span className="count">
            Total Items: {collectionCounts[selectedTable.key]}
          </span>
          <p>Edit functionality will be added soon.</p>
        </div>
      )}
    </div>
  );
};

export default AdminConsole;
