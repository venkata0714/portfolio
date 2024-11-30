import React, { useEffect, useRef } from "react";

const spotlightColors = ["#fcbc1d", "#fcca3d", "#fcb80d", "#fcd42d"]; // Variants of the spotlight color
export const SpotlightBG = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Resize the canvas dynamically
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track mouse position
    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Create the noise texture
    const createNoise = () => {
      const noiseCanvas = document.createElement("canvas");
      const noiseCtx = noiseCanvas.getContext("2d");
      noiseCanvas.width = canvas.width;
      noiseCanvas.height = canvas.height;

      const imageData = noiseCtx.createImageData(
        noiseCanvas.width,
        noiseCanvas.height
      );
      const data = imageData.data;

      for (let i = 0; i < data.length; i += 4) {
        const value = Math.random() * 255;
        data[i] = value; // Red
        data[i + 1] = value; // Green
        data[i + 2] = value; // Blue
        data[i + 3] = Math.random() * 50; // Alpha for subtle effect
      }
      noiseCtx.putImageData(imageData, 0, 0);
      return noiseCanvas;
    };

    const noiseCanvas = createNoise();

    // Spotlight animation properties
    const spotlights = Array.from({ length: 5 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 200 + 100,
      color:
        spotlightColors[Math.floor(Math.random() * spotlightColors.length)],
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 2 + 1,
    }));

    // Function to update spotlight positions
    const updateSpotlights = () => {
      spotlights.forEach((light) => {
        light.x += Math.cos(light.angle) * light.speed;
        light.y += Math.sin(light.angle) * light.speed;

        // Bounce the spotlight off the edges
        if (light.x < 0 || light.x > canvas.width)
          light.angle = Math.PI - light.angle;
        if (light.y < 0 || light.y > canvas.height) light.angle = -light.angle;

        // Slightly randomize movement to avoid robotic patterns
        light.angle += (Math.random() - 0.5) * 0.1;
      });
    };

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the matte 3D gradient background
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, "#212529");
      gradient.addColorStop(1, "#343a40");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw noise texture
      ctx.globalAlpha = 0.05;
      ctx.drawImage(noiseCanvas, 0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;

      // Draw each spotlight
      spotlights.forEach((light) => {
        const gradient = ctx.createRadialGradient(
          light.x,
          light.y,
          0,
          light.x,
          light.y,
          light.radius
        );
        gradient.addColorStop(0, `${light.color}ff`);
        gradient.addColorStop(0.5, `${light.color}cc`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(light.x, light.y, light.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Add spotlight following the mouse
      if (mouse.current.x && mouse.current.y) {
        const mouseGradient = ctx.createRadialGradient(
          mouse.current.x,
          mouse.current.y,
          0,
          mouse.current.x,
          mouse.current.y,
          300
        );
        mouseGradient.addColorStop(0, "rgba(252, 188, 29, 0.8)");
        mouseGradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = mouseGradient;
        ctx.beginPath();
        ctx.arc(mouse.current.x, mouse.current.y, 300, 0, Math.PI * 2);
        ctx.fill();
      }

      // Update spotlight positions
      updateSpotlights();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Cleanup on unmount
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
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
