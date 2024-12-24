import React, { useRef, useEffect } from "react";

// Helper: convert string "rgba(0,0,0,0.5)" or "rgb(0,0,0)" into [r,g,b,a]
const parseRGBA = (colorString) => {
  const match = colorString.match(/\d+(\.\d+)?/g);
  if (!match) {
    // fallback if no match; alpha defaults to 1
    return [0, 0, 0, 1];
  }
  let [r, g, b, a] = match.map(Number);
  if (Number.isNaN(a)) {
    a = 1;
  }
  return [r, g, b, a];
};

// Helper: darken a color by factor, with a given alpha depth
const darkenColor = (rgb, factor, depth) => {
  const [r, g, b] = rgb.match(/\d+/g).map(Number);
  return `rgba(
    ${Math.max(r - factor, 0)},
    ${Math.max(g - factor, 0)},
    ${Math.max(b - factor, 0)},
    ${depth}
  )`;
};

// Helper: lighten or fade color by factor (can accept negative factor)
const lightenColor = (rgb, factor, depth) => {
  const [r, g, b] = rgb.match(/\d+/g).map(Number);
  return `rgba(
    ${Math.min(r + factor, 255)},
    ${Math.min(g + factor, 255)},
    ${Math.min(b + factor, 255)},
    ${depth}
  )`;
};

// Helper: blend two colors
const blendColors = (color1, color2, alpha = 0.7) => {
  const [r1, g1, b1] = parseRGBA(color1);
  const [r2, g2, b2] = parseRGBA(color2);
  const blendedR = Math.round((r1 + r2) / 2);
  const blendedG = Math.round((g1 + g2) / 2);
  const blendedB = Math.round((b1 + b2) / 2);
  return `rgba(${blendedR}, ${blendedG}, ${blendedB}, ${alpha})`;
};

// Generate an offscreen noise canvas to overlay subtle grain
const createNoiseCanvas = (width, height) => {
  const noiseCanvas = document.createElement("canvas");
  noiseCanvas.width = width;
  noiseCanvas.height = height;
  const noiseCtx = noiseCanvas.getContext("2d");

  // Create noise
  const noiseData = noiseCtx.createImageData(width, height);
  for (let i = 0; i < noiseData.data.length; i += 4) {
    const val = (Math.random() * 255) | 0;
    noiseData.data[i] = val;
    noiseData.data[i + 1] = val;
    noiseData.data[i + 2] = val;
    noiseData.data[i + 3] = 20; // Adjust alpha for subtlety
  }
  noiseCtx.putImageData(noiseData, 0, 0);
  return noiseCanvas;
};

const GradientBG = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });
  const noiseCanvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Ensure the canvas always fits the window
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      // Recreate noise canvas to match new size
      noiseCanvasRef.current = createNoiseCanvas(canvas.width, canvas.height);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Track mouse position for parallax
    const handleMouseMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Circle configuration (balls)
    const balls = [
      {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 300,
        color: "rgb(18, 113, 255)",
        animationType: "vertical",
        speed: 600,
      },
      {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 250,
        color: "rgb(221, 74, 255)",
        animationType: "circularReverse",
        speed: 800,
      },
      {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 350,
        color: "rgb(100, 220, 255)",
        animationType: "circular",
        speed: 1600,
      },
      {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 280,
        color: "rgb(200, 50, 50)",
        animationType: "horizontal",
        speed: 1600,
      },
      {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 240,
        color: "rgb(180, 180, 50)",
        animationType: "circular",
        speed: 800,
      },
    ];

    // For trailing effect
    const trails = Array(balls.length)
      .fill(null)
      .map(() => []);

    let time = 0;

    // Draw each ball (with additional realism in gradients)
    const drawBall = (ball, index) => {
      // Parallax offsets based on mouse position (small shift)
      const parallaxFactor = 0.03; // Lower => more subtle
      const offsetX =
        ((mouse.current.x - canvas.width / 2) * parallaxFactor) / 2;
      const offsetY =
        ((mouse.current.y - canvas.height / 2) * parallaxFactor) / 2;

      // Update position based on animation type
      switch (ball.animationType) {
        case "horizontal":
          ball.x =
            canvas.width / 2 +
            offsetX +
            Math.sin((time / ball.speed) * Math.PI) * (canvas.width * 0.3);
          break;
        case "vertical":
          ball.y =
            canvas.height / 2 +
            offsetY +
            Math.sin((time / ball.speed) * Math.PI) * (canvas.height * 0.3);
          break;
        case "circular":
          ball.x =
            canvas.width / 2 +
            offsetX +
            Math.cos((time / ball.speed) * Math.PI * 2) * (canvas.width * 0.25);
          ball.y =
            canvas.height / 2 +
            offsetY +
            Math.sin((time / ball.speed) * Math.PI * 2) *
              (canvas.height * 0.25);
          break;
        case "circularReverse":
          ball.x =
            canvas.width / 2 +
            offsetX -
            Math.cos((time / ball.speed) * Math.PI * 2) * (canvas.width * 0.25);
          ball.y =
            canvas.height / 2 +
            offsetY -
            Math.sin((time / ball.speed) * Math.PI * 2) *
              (canvas.height * 0.25);
          break;
        default:
          // Just in case
          break;
      }

      // Create a multi-stop radial gradient
      // to achieve a darker, matte-like finish
      const gradient = ctx.createRadialGradient(
        ball.x,
        ball.y,
        0,
        ball.x,
        ball.y,
        ball.radius
      );

      // A series of stops from lighter in the center to darker on edges
      // Adjust factors to tweak the matte look
      gradient.addColorStop(0, darkenColor(ball.color, 10, 0.7));
      gradient.addColorStop(0.1, darkenColor(ball.color, 13, 0.66));
      gradient.addColorStop(0.2, darkenColor(ball.color, 16, 0.63));
      gradient.addColorStop(0.3, darkenColor(ball.color, 21, 0.59));
      gradient.addColorStop(0.4, darkenColor(ball.color, 27, 0.56));
      gradient.addColorStop(0.5, darkenColor(ball.color, 35, 0.53));
      gradient.addColorStop(0.6, darkenColor(ball.color, 44, 0.5));
      gradient.addColorStop(0.7, darkenColor(ball.color, 57, 0.47));
      gradient.addColorStop(0.8, darkenColor(ball.color, 73, 0.45));
      gradient.addColorStop(0.9, darkenColor(ball.color, 94, 0.42));
      gradient.addColorStop(1, darkenColor(ball.color, 120, 0.4));

      // Fill the ball with the color gradient
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // ----
      // (1) Overlay the noise *inside* this ball shape
      // ----
      if (noiseCanvasRef.current) {
        // Save context state
        ctx.save();
        // Clip to the ball shape
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();

        // Option A) Use the entire noise canvas
        // so each ball sees a different part of the noise
        // but they have the *same* noise pattern overall:
        ctx.globalAlpha = 0.15; // Adjust to taste
        ctx.drawImage(
          noiseCanvasRef.current,
          0,
          0,
          canvas.width,
          canvas.height
        );

        // Option B) If you want to repeat the same exact chunk
        // for each ball, use a pattern fill:
        //
        // const pattern = ctx.createPattern(noiseCanvasRef.current, "repeat");
        // ctx.globalAlpha = 0.15; // Adjust to taste
        // ctx.fillStyle = pattern;
        // ctx.fillRect(ball.x - ball.radius, ball.y - ball.radius, ball.radius * 2, ball.radius * 2);

        ctx.restore();
      }

      // Add "trails" for motion effect
      trails[index].push({ x: ball.x, y: ball.y });
      if (trails[index].length > 20) trails[index].shift();
      trails[index].forEach((trail, i) => {
        ctx.beginPath();
        ctx.arc(
          trail.x,
          trail.y,
          ball.radius * (i / 20), // radius shrinks in the trail
          0,
          Math.PI * 2
        );
        // Use lightenColor with negative factor to slightly fade
        ctx.fillStyle = lightenColor(ball.color, -50, 0.1 * (1 - i / 20));
        ctx.fill();
      });
    };

    // Draw overlaps with a blended color
    const drawBlendedOverlap = (circle1, circle2) => {
      const dx = circle1.x - circle2.x;
      const dy = circle1.y - circle2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // If circles overlap
      if (distance < circle1.radius + circle2.radius) {
        const overlapX = (circle1.x + circle2.x) / 2;
        const overlapY = (circle1.y + circle2.y) / 2;
        const overlapRadius = Math.min(circle1.radius, circle2.radius);

        // Parse RGBA
        const [r1, g1, b1, a1] = parseRGBA(circle1.color);
        const [r2, g2, b2, a2] = parseRGBA(circle2.color);
        // Blend alpha
        const blendedAlpha = Math.min((a1 + a2) / 2 + 0.1, 1);
        // Blend color
        const blendedColor = blendColors(
          circle1.color,
          circle2.color,
          blendedAlpha
        );

        ctx.beginPath();
        const overlapGradient = ctx.createRadialGradient(
          overlapX,
          overlapY,
          0,
          overlapX,
          overlapY,
          overlapRadius
        );
        overlapGradient.addColorStop(0, darkenColor(blendedColor, 10, 0.7));
        overlapGradient.addColorStop(0.5, darkenColor(blendedColor, 50, 0.4));
        overlapGradient.addColorStop(1, darkenColor(blendedColor, 80, 0.2));

        ctx.fillStyle = overlapGradient;
        ctx.arc(overlapX, overlapY, overlapRadius + 20, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Main render loop
    const render = () => {
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Dark-themed background gradient
      const backgroundGradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      backgroundGradient.addColorStop(0, "#212529");
      backgroundGradient.addColorStop(0.5, "#1e1e1e");
      backgroundGradient.addColorStop(1, "#151718");
      ctx.fillStyle = backgroundGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw subtle noise overlay on the entire background (optional)
      // This ensures the background itself has noise
      if (noiseCanvasRef.current) {
        ctx.globalAlpha = 0.1;
        ctx.drawImage(noiseCanvasRef.current, 0, 0);
        ctx.globalAlpha = 1.0;
      }

      // Draw overlaps first
      balls.forEach((ball, i) => {
        for (let j = i + 1; j < balls.length; j++) {
          drawBlendedOverlap(ball, balls[j]);
        }
      });

      // Then draw balls
      balls.forEach((ball, i) => {
        drawBall(ball, i);
      });

      // Add a subtle mouse glow
      ctx.beginPath();
      const mouseGlowRadius = 120;
      const mouseGradient = ctx.createRadialGradient(
        mouse.current.x,
        mouse.current.y,
        0,
        mouse.current.x,
        mouse.current.y,
        mouseGlowRadius
      );
      mouseGradient.addColorStop(0, "rgba(255, 255, 255, 0.1)");
      mouseGradient.addColorStop(1, "rgba(255, 255, 255, 0.001)");
      ctx.fillStyle = mouseGradient;
      ctx.arc(
        mouse.current.x,
        mouse.current.y,
        mouseGlowRadius,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Increment time
      time += 1;

      // Request next frame
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="gradient-container"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
        filter: "blur(10px)",
      }}
    />
  );
};

export default GradientBG;
