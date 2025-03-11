import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import "../../styles/Loading.css";
import { pingBackend, pingDatabase } from "../../services/ping";

const greetings = ["Hello", "नमस्ते", "Bonjour", "こんにちは", "مرحبا"];

const Loading = ({ isBatterySavingOn, setIsBatterySavingOn, onComplete }) => {
  const [status, setStatus] = useState({ backend: false, database: false });
  const [loaded, setLoaded] = useState(false);
  const [currentGreetingIndex, setCurrentGreetingIndex] = useState(0);
  const [allGreetingsShown, setAllGreetingsShown] = useState(false);
  const [stats, setStats] = useState({
    prefersReducedMotion: false,
    isLowBattery: false,
    lowPerformanceDevice: false,
    lowMemoryDevice: false,
    isCpuThrottled: false,
    isTouchDevice: false,
    cpuTestDuration: null,
  });

  // Rotate greetings every 400ms and track when all greetings are shown
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentGreetingIndex((prevIndex) => {
        if (prevIndex + 1 === greetings.length) {
          setAllGreetingsShown(true);
        }
        return (prevIndex + 1) % greetings.length;
      });
    }, 400);

    return () => clearInterval(interval);
  }, []);

  // Check backend and database status
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const backendStatus = await pingBackend();
        const databaseStatus = await pingDatabase();

        setStatus({
          backend: backendStatus,
          database: databaseStatus,
        });

        // Transition to "loaded" state after checks are complete
        if (backendStatus && databaseStatus) {
          setLoaded(true);
        }
      } catch (error) {
        console.error("Error checking backend or database status:", error);
      }
    };

    if (!loaded) {
      checkStatus();
    }
  }, [loaded]);

  useEffect(() => {
    const checkPerformanceAndCapabilities = async () => {
      // Check for prefers-reduced-motion
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // Check battery status if available
      const isLowBattery = navigator.getBattery
        ? await navigator
            .getBattery()
            .then((battery) => {
              return battery.level < 0.2;
            })
            .catch(() => false)
        : false;

      // Check hardware concurrency (number of CPU cores)
      const hardwareConcurrency = navigator.hardwareConcurrency || 0;
      const lowPerformanceDevice = hardwareConcurrency < 4;

      // Check for CPU throttling
      const testCpuPerformance = () => {
        const start = performance.now();
        for (let i = 0; i < 1e7; i++) Math.sqrt(i);
        const duration = performance.now() - start;
        return duration;
      };
      const cpuTestDuration = testCpuPerformance();
      const isCpuThrottled = cpuTestDuration > 20; // Threshold for CPU throttling

      // Check for device memory (if supported)
      const deviceMemory = navigator.deviceMemory || "Unknown";
      const lowMemoryDevice = deviceMemory !== "Unknown" && deviceMemory < 4;

      // Check for touch device
      const isTouchDevice =
        "ontouchstart" in window || navigator.maxTouchPoints > 0;

      // Combine all checks
      const isSavingMode =
        prefersReducedMotion ||
        isLowBattery ||
        lowPerformanceDevice ||
        isCpuThrottled ||
        // isTouchDevice ||
        lowMemoryDevice;
      // console.log("Prefers Reduced Motion:", prefersReducedMotion);
      // console.log("Low Battery:", isLowBattery);
      // console.log("Low Performance Device:", lowPerformanceDevice);
      // console.log("Low Memory Device:", lowMemoryDevice);
      // console.log("CPU Throttled:", isCpuThrottled);
      // console.log("CPU Test Duration:", cpuTestDuration);
      // console.log("Overall Saving Mode:", isSavingMode);

      setStats({
        prefersReducedMotion,
        isLowBattery,
        lowPerformanceDevice,
        lowMemoryDevice,
        isCpuThrottled,
        isTouchDevice,
        cpuTestDuration: cpuTestDuration.toFixed(2),
      });

      setIsBatterySavingOn(isSavingMode);
    };

    checkPerformanceAndCapabilities();

    // Listen to changes in prefers-reduced-motion
    const reducedMotionMediaQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    reducedMotionMediaQuery.addEventListener(
      "change",
      checkPerformanceAndCapabilities
    );

    return () => {
      reducedMotionMediaQuery.removeEventListener(
        "change",
        checkPerformanceAndCapabilities
      );
    };
  }, [setIsBatterySavingOn]);

  // Trigger onComplete when loading is done and all greetings are shown
  useEffect(() => {
    if (loaded && allGreetingsShown && onComplete) {
      onComplete();
    }
  }, [loaded, allGreetingsShown, onComplete]);

  useEffect(() => {
    const updateScale = () => {
      const loadingContainer = document.querySelector(".loading-content");
      if (!loadingContainer) return;
      const screenHeight = window.innerHeight;
      const screenWidth = window.innerWidth;
      let scaleValue = 1;
      if (screenHeight < 826 && screenWidth > 576) {
        scaleValue = screenHeight / 826;
      }
      loadingContainer.style.zoom = `${scaleValue}`;
    };

    updateScale();
    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, []);

  return !loaded || !allGreetingsShown ? (
    <motion.div
      className="loading-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="loading-content">
        <div
          className="current-mode"
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            backgroundColor: isBatterySavingOn ? "red" : "green",
          }}
        ></div>
        <div
          className="stats-box"
          style={{
            position: "absolute",
            top: "40px",
            right: "10px",
            padding: "10px",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            color: "white",
            borderRadius: "5px",
            fontSize: "12px",
            lineHeight: "1.5",
          }}
        >
          <div>Reduced Motion: {stats.prefersReducedMotion ? "Yes" : "No"}</div>
          <div>Low Battery: {stats.isLowBattery ? "Yes" : "No"}</div>
          <div>
            Low Performance: {stats.lowPerformanceDevice ? "Yes" : "No"}
          </div>
          <div>Low Memory: {stats.lowMemoryDevice ? "Yes" : "No"}</div>
          <div>CPU Throttled: {stats.isCpuThrottled ? "Yes" : "No"}</div>
          <div>CPU Test Duration: {stats.cpuTestDuration} ms</div>
          <div>Touch Device: {stats.isTouchDevice ? "Yes" : "No"}</div>
        </div>
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
            {isBatterySavingOn
              ? "Reducing Animations Due to Weak Device ❌"
              : "ontouchstart" in window || navigator.maxTouchPoints > 0
              ? "Reducing Animations for Touch Devices ✅"
              : "Amplifying Animations ✅"}
          </motion.p>
        </div>
      </div>
    </motion.div>
  ) : null;
};

export default Loading;
