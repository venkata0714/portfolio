import React, { useRef, useEffect } from "react";

// Helper function to calculate a lighter/darker version of a color
const lightenColor = (rgb, factor, depth) => {
  const [r, g, b] = rgb.match(/\d+/g).map(Number);
  return `rgba(
    ${Math.min(r + factor, 255)},
    ${Math.min(g + factor, 255)},
    ${Math.min(b + factor, 255)},
    ${depth}
  )`;
};

const darkenColor = (rgb, factor, depth) => {
  const [r, g, b] = rgb.match(/\d+/g).map(Number);
  return `rgba(
    ${Math.max(r - factor, 0)},
    ${Math.max(g - factor, 0)},
    ${Math.max(b - factor, 0)},
    ${depth}
  )`;
};

// Helper function to calculate the blended color of overlapping circles
const blendColors = (color1, color2, depth) => {
  // Extract numeric channel values (ignoring alpha if present)
  const [r1, g1, b1] = color1.match(/\d+/g).map(Number);
  const [r2, g2, b2] = color2.match(/\d+/g).map(Number);

  // Average each RGB channel
  const blendedR = Math.round((r1 + r2) / 2);
  const blendedG = Math.round((g1 + g2) / 2);
  const blendedB = Math.round((b1 + b2) / 2);

  // Return the blended color; alpha defaults to 0.7 if depth not provided
  return `rgba(${blendedR}, ${blendedG}, ${blendedB}, ${depth ? depth : 0.7})`;
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

    function parseRGBA(colorString) {
      // Matches integers or floats in the color string (e.g., "rgba(123, 45, 67, 0.8)")
      const match = colorString.match(/\d+(\.\d+)?/g);
      if (!match) {
        // fallback if no match; alpha defaults to 1
        return [0, 0, 0, 1];
      }

      // Convert matched values to Numbers
      let [r, g, b, a] = match.map(Number);

      // If alpha wasn't provided, default to 1
      if (Number.isNaN(a)) {
        a = 1;
      }

      return [r, g, b, a];
    }

    // Circle configuration with acceleration properties
    const balls = [
      {
        x: canvas.width / 2,
        y: (canvas.height - 52) / 2,
        radius: 300,
        color: "rgb(18, 113, 255)",
        animationType: "vertical",
        speed: 3000 / 5,
        currentSpeed: 3000,
        targetSpeed: 3000,
        transitionStartTime: 0,
        transitionDuration: 0,
      },
      {
        x: canvas.width / 2,
        y: (canvas.height - 52) / 2,
        radius: 250,
        color: "rgb(221, 74, 255)",
        animationType: "circularReverse",
        speed: 4000 / 5,
        currentSpeed: 4000,
        targetSpeed: 4000,
        transitionStartTime: 0,
        transitionDuration: 0,
      },
      {
        x: canvas.width / 2,
        y: (canvas.height - 52) / 2,
        radius: 350,
        color: "rgb(100, 220, 255)",
        animationType: "circular",
        speed: 8000 / 5,
        currentSpeed: 8000,
        targetSpeed: 8000,
        transitionStartTime: 0,
        transitionDuration: 0,
      },
      {
        x: canvas.width / 2,
        y: (canvas.height - 52) / 2,
        radius: 280,
        color: "rgb(200, 50, 50)",
        animationType: "horizontal",
        speed: 8000 / 5,
        currentSpeed: 8000,
        targetSpeed: 8000,
        transitionStartTime: 0,
        transitionDuration: 0,
      },
      {
        x: canvas.width / 2,
        y: (canvas.height - 52) / 2,
        radius: 240,
        color: "rgb(180, 180, 50)",
        animationType: "circular",
        speed: 4000 / 5,
        currentSpeed: 4000,
        targetSpeed: 4000,
        transitionStartTime: 0,
        transitionDuration: 0,
      },
    ];

    // // Function to update ball speeds dynamically (commented out for now)
    // const updateSpeed = (ball, currentTime) => {
    //   if (currentTime > ball.transitionStartTime + ball.transitionDuration) {
    //     // Pick a new target speed (random between 0.7x and 1.3x)
    //     ball.targetSpeed = ball.speed * (Math.random() < 0.5 ? 0.7 : 1.3);
    //     ball.transitionDuration = 1000 + Math.random() * 1000; // 1–2 seconds
    //     ball.transitionStartTime = currentTime;
    //   }

    //   // Interpolate between currentSpeed and targetSpeed
    //   const elapsed = currentTime - ball.transitionStartTime;
    //   const t = Math.min(elapsed / ball.transitionDuration, 1); // Progress (0 to 1)
    //   ball.currentSpeed =
    //     ball.speed + (ball.targetSpeed - ball.speed) * easeInOutQuad(t);
    // };

    // Easing function (commented out for reference)
    // const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t);

    const trails = Array(balls.length)
      .fill(null)
      .map(() => []);

    let time = 0;

    // Function to draw a ball
    const drawBall = (ball, index) => {
      // Update position based on animation type
      switch (ball.animationType) {
        case "horizontal":
          ball.x =
            canvas.width / 2 +
            Math.sin((time / ball.speed) * Math.PI) * canvas.width * 0.3;
          break;
        case "vertical":
          ball.y =
            (canvas.height - 52) / 2 +
            Math.sin((time / ball.speed) * Math.PI) * canvas.height * 0.3;
          break;
        case "circular":
          ball.x =
            canvas.width / 2 +
            Math.cos((time / ball.speed) * Math.PI * 2) * canvas.width * 0.25;
          ball.y =
            (canvas.height - 52) / 2 +
            Math.sin((time / ball.speed) * Math.PI * 2) * canvas.height * 0.25;
          break;
        case "circularReverse":
          ball.x =
            canvas.width / 2 -
            Math.cos((time / ball.speed) * Math.PI * 2) * canvas.width * 0.25;
          ball.y =
            (canvas.height - 52) / 2 -
            Math.sin((time / ball.speed) * Math.PI * 2) * canvas.height * 0.25;
          break;
        default:
          break;
      }

      // Create a radial gradient for the ball
      const gradient = ctx.createRadialGradient(
        ball.x,
        ball.y,
        0,
        ball.x,
        ball.y,
        ball.radius
      );

      gradient.addColorStop(0, darkenColor(ball.color, 10, 0.8));
      gradient.addColorStop(0.1, darkenColor(ball.color, 12, 0.75));
      gradient.addColorStop(0.2, darkenColor(ball.color, 16, 0.7));
      gradient.addColorStop(0.3, darkenColor(ball.color, 19, 0.65));
      gradient.addColorStop(0.4, darkenColor(ball.color, 24, 0.61));
      gradient.addColorStop(0.5, darkenColor(ball.color, 30, 0.57));
      gradient.addColorStop(0.6, darkenColor(ball.color, 37, 0.53));
      gradient.addColorStop(0.7, darkenColor(ball.color, 47, 0.49));
      gradient.addColorStop(0.8, darkenColor(ball.color, 58, 0.46));
      gradient.addColorStop(0.9, darkenColor(ball.color, 72, 0.43));
      gradient.addColorStop(1, darkenColor(ball.color, 90, 0.4));

      // // NEW color stops for a smoother, darker, matte-like finish:
      // gradient.addColorStop(0, darkenColor(ball.color, 10, 0.8));
      // gradient.addColorStop(0.1, darkenColor(ball.color, 15, 0.75));
      // gradient.addColorStop(0.2, darkenColor(ball.color, 20, 0.7));
      // gradient.addColorStop(0.3, darkenColor(ball.color, 30, 0.6));
      // gradient.addColorStop(0.4, darkenColor(ball.color, 40, 0.5));
      // gradient.addColorStop(0.5, darkenColor(ball.color, 50, 0.4));
      // gradient.addColorStop(0.6, darkenColor(ball.color, 60, 0.3));
      // gradient.addColorStop(0.7, darkenColor(ball.color, 70, 0.25));
      // gradient.addColorStop(0.8, darkenColor(ball.color, 80, 0.2));
      // gradient.addColorStop(0.9, darkenColor(ball.color, 90, 0.15));
      // gradient.addColorStop(1, darkenColor(ball.color, 120, 0.1));

      // Draw the ball with the new gradient
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();

      // Add trails for motion effect
      trails[index].push({ x: ball.x, y: ball.y });
      if (trails[index].length > 20) trails[index].shift();
      trails[index].forEach((trail, i) => {
        ctx.beginPath();
        ctx.arc(trail.x, trail.y, ball.radius * (i / 20), 0, Math.PI * 2);
        // Using lightenColor with a negative factor for a fading effect
        ctx.fillStyle = lightenColor(ball.color, -40, 0.1 * (1 - i / 20));
        ctx.fill();
      });
    };

    // Function to draw blended overlaps
    const drawBlendedOverlap = (circle1, circle2) => {
      const dx = circle1.x - circle2.x;
      const dy = circle1.y - circle2.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < circle1.radius + circle2.radius) {
        const overlapX = (circle1.x + circle2.x) / 2;
        const overlapY = (circle1.y + circle2.y) / 2;
        const overlapRadius = Math.min(circle1.radius, circle2.radius) + 5;

        // Parse RGBA (including alpha) for both circles
        const [r1, g1, b1, a1] = parseRGBA(circle1.color);
        const [r2, g2, b2, a2] = parseRGBA(circle2.color);

        // Take average of the two alphas
        const averageAlpha = (a1 + a2) / 2;

        // Blend the two circle colors, using the average alpha
        const blendedColor = blendColors(
          circle1.color,
          circle2.color,
          averageAlpha < 1 ? averageAlpha + 0.1 : averageAlpha
        );

        ctx.beginPath();
        const gradient = ctx.createRadialGradient(
          overlapX,
          overlapY,
          0,
          overlapX,
          overlapY,
          overlapRadius
        );
        gradient.addColorStop(0, darkenColor(blendedColor, 10, 0.7));
        gradient.addColorStop(0.1, darkenColor(blendedColor, 12, 0.64));
        gradient.addColorStop(0.2, darkenColor(blendedColor, 14, 0.59));
        gradient.addColorStop(0.3, darkenColor(blendedColor, 17, 0.54));
        gradient.addColorStop(0.4, darkenColor(blendedColor, 20, 0.5));

        ctx.fillStyle = gradient;
        ctx.arc(overlapX, overlapY, overlapRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw background gradient
      const backgroundGradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      backgroundGradient.addColorStop(0, "rgb(33, 37, 41)"); // #212529
      backgroundGradient.addColorStop(0.3, "rgb(44, 49, 55)"); // Slightly lighter shade
      backgroundGradient.addColorStop(0.7, "rgb(28, 31, 35)"); // Slightly darker shade
      backgroundGradient.addColorStop(1, "rgb(15, 18, 20)"); // Even darker for depth
      ctx.fillStyle = backgroundGradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw balls and their overlaps
      balls.forEach((ball, i) => {
        balls
          .slice(i + 1)
          .forEach((otherBall) => drawBlendedOverlap(ball, otherBall));
        drawBall(ball, i);
      });

      // Add a mouse interaction glow
      ctx.beginPath();
      const mouseGradient = ctx.createRadialGradient(
        mouse.current.x,
        mouse.current.y,
        0,
        mouse.current.x,
        mouse.current.y,
        75
      );
      mouseGradient.addColorStop(0, "rgba(255, 255, 255, 0.3)");
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

export default GradientBG;
