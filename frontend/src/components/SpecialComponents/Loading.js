import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import "../../styles/Loading.css";

const greetings = ["Hello", "नमस्ते", "Bonjour", "こんにちは", "مرحبا"];

const Loading = ({ onComplete }) => {
  const [status, setStatus] = useState({
    backend: false,
    database: false,
  });
  const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0);

  useEffect(() => {
    // Rotate greetings every 400ms
    const interval = setInterval(() => {
      setCurrentGreetingIndex(
        (prevIndex) => (prevIndex + 1) % greetings.length
      );
    }, 400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;

    const pingBackend = async () => {
      try {
        await axios.get("http://localhost:5000/api/ping");
        setStatus((prev) => ({ ...prev, backend: true }));
      } catch (error) {
        console.error("Backend check failed:", error);
      }
    };

    const pingDatabase = async () => {
      try {
        await axios.get("http://localhost:5000/api/db-ping");
        setStatus((prev) => ({ ...prev, database: true }));
      } catch (error) {
        console.error("Database check failed:", error);
      }
    };

    const checkStatus = async () => {
      await pingBackend();
      await pingDatabase();

      if (greetings.every((_, index) => index <= currentGreetingIndex)) {
        setTimeout(() => onComplete(), 500); // Smooth transition after all greetings and status checks
      }
    };

    checkStatus();
  }, [onComplete, currentGreetingIndex]);

  return (
    <motion.div
      className="loading-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="greeting">
        <motion.h1
          key={greetings[currentGreetingIndex]}
          initial={{ scale: [0, 0.1, 0.2, 0.8], opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.1, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {greetings[currentGreetingIndex]}
        </motion.h1>
      </div>
      <div className="status">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          Connecting to Backend {status.backend && <span>✅</span>}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Connecting to Database {status.database && <span>✅</span>}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          {"ontouchstart" in window || navigator.maxTouchPoints > 0
            ? "Reducing Animations for Touch Devices ✅"
            : "Amplifying Animations ✅"}
        </motion.p>
      </div>
    </motion.div>
  );
};

export default Loading;
