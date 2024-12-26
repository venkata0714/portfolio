import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../../styles/Loading.css";
import { pingBackend, pingDatabase } from "../../services/ping";

const greetings = ["Hello", "नमस्ते", "Bonjour", "こんにちは", "مرحبا"];

const Loading = ({ onComplete }) => {
  const [status, setStatus] = useState({
    backend: false,
    database: false,
  });
  const [loaded, setLoaded] = useState(false);
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
    const checkStatus = async () => {
      const backendStatus = await pingBackend();
      const databaseStatus = await pingDatabase();

      setStatus({
        backend: backendStatus,
        database: databaseStatus,
      });

      // Ensure all greetings are shown before transition
      if (greetings.every((_, index) => index <= currentGreetingIndex)) {
        setTimeout(() => {
          onComplete();
          setLoaded(true);
        }, 500); // Smooth transition after all greetings and status checks
      }
    };

    if (!loaded) {
      checkStatus();
    }
  }, [onComplete, currentGreetingIndex, loaded]);

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
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.8, opacity: 0 }}
          transition={{ duration: 0.4 }}
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
          transition={{ duration: 0.5, delay: 1.4 }}
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
