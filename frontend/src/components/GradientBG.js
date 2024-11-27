import React, { useRef, useEffect } from "react";

// Helper function to calculate a brighter, lighter version of the original color
const lightenColor = (rgb, factor) => {
  const [r, g, b] = rgb.match(/\d+/g).map(Number);
  return `rgba(${Math.min(r + factor, 255)}, ${Math.min(
    g + factor,
    255
  )}, ${Math.min(b + factor, 255)}, 0.5)`;
};

// Helper function to calculate the blended color of two overlapping circles
const blendColors = (color1, color2) => {
  const [r1, g1, b1] = color1.match(/\d+/g).map(Number);
  const [r2, g2, b2] = color2.match(/\d+/g).map(Number);
  const blendedR = Math.min((r1 + r2) / 2, 255);
  const blendedG = Math.min((g1 + g2) / 2, 255);
  const blendedB = Math.min((b1 + b2) / 2, 255);
  return `rgba(${blendedR}, ${blendedG}, ${blendedB}, 0.7)`;
};

const GradientBG = () => {
  const canvasRef = useRef(null);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    // Resize canvas dynamically
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

    // Circle configuration
    const balls = [
      {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 300,
        color: "rgb(18, 113, 255)",
        animationType: "vertical",
        speed: 3000,
      },
      {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 250,
        color: "rgb(221, 74, 255)",
        animationType: "circularReverse",
        speed: 2000,
      },
      {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 350,
        color: "rgb(100, 220, 255)",
        animationType: "circular",
        speed: 4000,
      },
      {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 280,
        color: "rgb(200, 50, 50)",
        animationType: "horizontal",
        speed: 4000,
      },
      {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: 240,
        color: "rgb(180, 180, 50)",
        animationType: "circular",
        speed: 2000,
      },
    ];

    let time = 0;

    // Trails for particles
    const trails = Array(balls.length)
      .fill([])
      .map(() => []);

    // Function to draw a ball
    const drawBall = (ball, index) => {
      ctx.beginPath();

      // Calculate position based on animation type
      switch (ball.animationType) {
        case "horizontal":
          ball.x =
            canvas.width / 2 +
            Math.sin((time / ball.speed) * Math.PI) * canvas.width * 0.3;
          break;
        case "vertical":
          ball.y =
            canvas.height / 2 +
            Math.sin((time / ball.speed) * Math.PI) * canvas.height * 0.3;
          break;
        case "circular":
          ball.x =
            canvas.width / 2 +
            Math.cos((time / ball.speed) * Math.PI * 2) * canvas.width * 0.25;
          ball.y =
            canvas.height / 2 +
            Math.sin((time / ball.speed) * Math.PI * 2) * canvas.height * 0.25;
          break;
        case "circularReverse":
          ball.x =
            canvas.width / 2 -
            Math.cos((time / ball.speed) * Math.PI * 2) * canvas.width * 0.25;
          ball.y =
            canvas.height / 2 -
            Math.sin((time / ball.speed) * Math.PI * 2) * canvas.height * 0.25;
          break;
        default:
          break;
      }

      // Add current position to trail
      trails[index].push({ x: ball.x, y: ball.y });
      if (trails[index].length > 50) trails[index].shift();

      // Draw the trail
      trails[index].forEach((trail, i) => {
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, ball.radius / 10, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${i * 5}, ${i * 5}, ${i * 5}, ${
          0.1 * (1 - i / trails[index].length)
        })`;
        ctx.fill();
      });

      // Create radial gradient for the ball
      const gradient = ctx.createRadialGradient(
        ball.x,
        ball.y,
        0,
        ball.x,
        ball.y,
        ball.radius
      );
      gradient.addColorStop(0, ball.color);
      gradient.addColorStop(0.5, lightenColor(ball.color, 50));
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
    };

    // Function to draw blended overlap between two circles
    const drawBlendedOverlap = (circle1, circle2) => {
      const dx = circle1.x - circle2.x;
      const dy = circle1.y - circle2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < circle1.radius + circle2.radius) {
        const overlapX = (circle1.x + circle2.x) / 2;
        const overlapY = (circle1.y + circle2.y) / 2;
        const overlapRadius = Math.min(circle1.radius, circle2.radius) + 2;
        const blendedColor = blendColors(circle1.color, circle2.color);

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          overlapX,
          overlapY,
          0,
          overlapX,
          overlapY,
          overlapRadius
        );
        gradient.addColorStop(0, blendedColor);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.arc(overlapX, overlapY, overlapRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw the background
      const gradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      gradient.addColorStop(0, "rgb(108, 0, 162)");
      gradient.addColorStop(1, "rgb(0, 17, 82)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw balls and their overlaps
      balls.forEach((ball, i) => {
        balls
          .slice(i + 1)
          .forEach((otherBall) => drawBlendedOverlap(ball, otherBall));
        drawBall(ball, i);
      });

      // Draw mouse glow
      ctx.beginPath();
      const mouseGradient = ctx.createRadialGradient(
        mouse.current.x,
        mouse.current.y,
        0,
        mouse.current.x,
        mouse.current.y,
        150
      );
      mouseGradient.addColorStop(0, "rgba(255, 255, 255, 0.5)");
      mouseGradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = mouseGradient;
      ctx.arc(mouse.current.x, mouse.current.y, 150, 0, Math.PI * 2);
      ctx.fill();

      time += 1;
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
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        width: "100%",
        height: "100%",
      }}
    />
  );
};

export default GradientBG;
