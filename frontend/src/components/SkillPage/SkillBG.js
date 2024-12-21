import React, { useRef, useEffect } from "react";
import icons from "../../services/icons"; // Ensure this path is correct

const skillImages = Object.values(icons); // Retrieve skill images from the imported icons object

const SkillBG = () => {
  const canvasRef = useRef(null);
  const iconSize = 100; // Adjustable icon size
  const animationDuration = 20; // Duration for the sliding animation in seconds

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let canvasWidth, canvasHeight, cols, rows;
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvasWidth = canvas.width;
      canvasHeight = canvas.height;
      cols = Math.ceil(canvasWidth / iconSize);
      rows = Math.ceil(canvasHeight / iconSize);
    };

    const drawIcons = () => {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      for (let row = 0; row < rows; row++) {
        const yOffset = row * iconSize;

        for (let col = 0; col < cols; col++) {
          const xOffset =
            (col * iconSize +
              ((Date.now() /
                (row % 2 === 0 ? animationDuration : -animationDuration)) %
                (cols * iconSize))) %
            canvasWidth;

          const icon = skillImages[(row * cols + col) % skillImages.length];
          if (icon) {
            const img = new Image();
            img.src = icon;
            img.onload = () => {
              ctx.drawImage(img, xOffset, yOffset, iconSize, iconSize);
            };
          }
        }
      }
    };

    const animate = () => {
      drawIcons();
      animationFrameId = requestAnimationFrame(animate);
    };

    // Initialize
    const init = () => {
      resizeCanvas();
      animate();
    };

    init();

    window.addEventListener("resize", resizeCanvas);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    />
  );
};

export default SkillBG;
