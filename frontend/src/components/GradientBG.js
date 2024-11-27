import React, { useRef, useEffect } from "react";

const GradientBG = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Resize canvas to fit the window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Gradient animation variables
    let gradientOffset = 0;

    const renderGradient = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Create gradient
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "rgb(108, 0, 162)");
      gradient.addColorStop(0.25, "rgb(0, 17, 82)");
      gradient.addColorStop(0.5, `rgb(18, 113, 255)`);
      gradient.addColorStop(0.75, `rgb(221, 74, 255)`);
      gradient.addColorStop(1, "rgb(100, 220, 255)");

      // Draw background
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Create and render moving gradient shapes
      const shapeGradient = ctx.createRadialGradient(
        width / 2 + gradientOffset,
        height / 2 - gradientOffset,
        100,
        width / 2,
        height / 2,
        Math.max(width, height) / 2
      );
      shapeGradient.addColorStop(0, "rgba(200, 50, 50, 0.7)");
      shapeGradient.addColorStop(1, "rgba(180, 180, 50, 0.1)");

      ctx.globalCompositeOperation = "overlay";
      ctx.fillStyle = shapeGradient;
      ctx.fillRect(0, 0, width, height);

      // Update animation offset
      gradientOffset = (gradientOffset + 1) % width;
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      renderGradient();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Cleanup on component unmount
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas className="gradient-canvas" ref={canvasRef} />;
};

export default GradientBG;
