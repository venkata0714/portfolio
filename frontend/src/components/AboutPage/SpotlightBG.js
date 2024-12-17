import React, { useEffect, useRef } from "react";

export const SpotlightBG = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: -100, y: -100 }); // Start with the mouse off-screen
  const paintedHexagons = useRef([]); // Array to store painted hexagons
  const breathingProgress = useRef(0); // Tracks the progress of the breathing animation (0 to 1)
  const direction = useRef(1); // 1 for expanding, -1 for contracting
  const breathingSpeed = 0.0015; // Very slow breathing animation speed

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId;

    const hexSize = 30; // Size of each hexagon
    const lightRadius = 100; // Radius of the area around the cursor that lights up
    const clickRadius = 50; // Smaller radius for the click effect

    // Resize canvas to fit the window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    // Create matte gradient
    const createMatteGradient = (opacity) => {
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, `rgba(255, 111, 97, ${opacity})`); // Coral
      gradient.addColorStop(0.2, `rgba(244, 208, 63, ${opacity})`); // Yellow
      gradient.addColorStop(0.4, `rgba(142, 68, 173, ${opacity})`); // Purple
      gradient.addColorStop(0.6, `rgba(26, 188, 156, ${opacity})`); // Aqua
      gradient.addColorStop(0.8, `rgba(52, 152, 219, ${opacity})`); // Blue
      gradient.addColorStop(1, `rgba(255, 111, 97, ${opacity})`); // Loop back to Coral
      return gradient;
    };

    const drawHexagon = (x, y, size, opacity, isPainted) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i;
        const xOffset = x + size * Math.cos(angle);
        const yOffset = y + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(xOffset, yOffset);
        else ctx.lineTo(xOffset, yOffset);
      }
      ctx.closePath();

      if (isPainted) {
        // Fill painted hexagons with matte gradient
        ctx.fillStyle = createMatteGradient(0.7); // Slightly opaque
        ctx.fill();
        ctx.strokeStyle = "#212529"; // Dark border for painted hexagons
      } else {
        // Use gradient for borders of non-painted hexagons
        ctx.strokeStyle = createMatteGradient(opacity);
        ctx.lineWidth = opacity > 0 ? 2 : 1;

        // Use faint opacity for the grid outside hover
      }
      ctx.stroke();
      ctx.globalAlpha = 1; // Reset opacity for other elements
    };

    const drawGrid = () => {
      const cols = Math.ceil(canvas.width / (hexSize * 1.5));
      const rows = Math.ceil(canvas.height / (hexSize * Math.sqrt(3)));
      paintedHexagons.current = paintedHexagons.current.filter(
        (hex) => Date.now() - hex.timestamp < 2000 // Keep painted hexagons for 2 seconds
      );

      const animationLine = canvas.height * breathingProgress.current;

      for (let row = 0; row <= rows; row++) {
        for (let col = 0; col <= cols; col++) {
          const x = col * hexSize * 1.5;
          const y =
            row * hexSize * Math.sqrt(3) +
            (col % 2 === 0 ? 0 : (hexSize * Math.sqrt(3)) / 2);

          const dx = x - mouse.current.x;
          const dy = y - mouse.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          // Determine base opacity for the hexagon
          let opacity =
            distance <= lightRadius ? 1 - distance / lightRadius : 0.05;

          // Add subtle breathing effect to opacity
          if (y <= animationLine) {
            opacity += 0.1; // Slight increase for breathing effect
          }

          // Check if the hexagon is painted
          const isPainted = paintedHexagons.current.some(
            (hex) => hex.x === x && hex.y === y
          );

          // Draw hexagon with proper opacity
          drawHexagon(x, y, hexSize, opacity, isPainted);
        }
      }
    };

    const drawBackground = () => {
      ctx.fillStyle = "#212529"; // Fixed dark background
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    };

    const render = () => {
      drawBackground();
      drawGrid();

      // Update breathing animation progress
      breathingProgress.current += breathingSpeed * direction.current;
      if (breathingProgress.current >= 1 || breathingProgress.current <= 0) {
        direction.current *= -1; // Reverse direction
      }

      animationFrameId = requestAnimationFrame(render);
    };

    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    const handleMouseClick = () => {
      const cols = Math.ceil(canvas.width / (hexSize * 1.5));
      const rows = Math.ceil(canvas.height / (hexSize * Math.sqrt(3)));

      for (let row = 0; row <= rows; row++) {
        for (let col = 0; col <= cols; col++) {
          const x = col * hexSize * 1.5;
          const y =
            row * hexSize * Math.sqrt(3) +
            (col % 2 === 0 ? 0 : (hexSize * Math.sqrt(3)) / 2);

          const dx = x - mouse.current.x;
          const dy = y - mouse.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance <= clickRadius) {
            // Paint hexagon on click
            paintedHexagons.current.push({ x, y, timestamp: Date.now() });
          }
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleMouseClick);

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleMouseClick);
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
        zIndex: -3,
      }}
    />
  );
};
