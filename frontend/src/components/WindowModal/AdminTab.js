import React, { useState } from "react";
import axios from "axios";
import "../../styles/AdminTab.css";

const AdminTab = ({ loggedIn, setLoggedIn }) => {
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [userVerified, setUserVerified] = useState(false);
  const [error, setError] = useState("");

  const API_URL = `${process.env.REACT_APP_API_URI}`;

  const verifyUsername = async () => {
    try {
      await axios.post(`${API_URL}/compareAdminName`, { userName });
      setUserVerified(true);
      setError("");
    } catch {
      setError("Invalid Username!");
    }
  };

  const verifyPassword = async () => {
    try {
      await axios.post(`${API_URL}/compareAdminPassword`, { password });
      setLoggedIn(true); // updates App.js state
      setError("");
    } catch {
      setError("Invalid Password!");
    }
  };

  return (
    <div className="admin-tab">
      {!loggedIn ? (
        <>
          {!userVerified ? (
            <div>
              <input
                type="text"
                placeholder="Admin Username"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
              <button onClick={verifyUsername}>Verify Username</button>
              {error && <p className="danger">{error}</p>}
            </div>
          ) : (
            <>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button onClick={verifyPassword}>Login</button>
              {error && <p className="danger">{error}</p>}
            </>
          )}
        </>
      ) : (
        <div>
          <h2>Admin Panel</h2>
          <p>You are logged in as Kartavya Singh</p>
        </div>
      )}
    </div>
  );
};

export default AdminTab;
