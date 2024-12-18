import React, { useRef, useEffect } from "react";

// Helper function to calculate a lighter/darker version of a color
const lightenColor = (rgb, factor, depth) => {
  const [r, g, b] = rgb.match(/\d+/g).map(Number);
  return `rgba(${Math.min(r + factor, 255)}, ${Math.min(
    g + factor,
    255
  )}, ${Math.min(b + factor, 255)}, ${depth})`;
};

// Helper function to calculate the blended color of overlapping circles
const blendColors = (color1, color2) => {
  const [r1, g1, b1] = color1.match(/\d+/g).map(Number);
  const [r2, g2, b2] = color2.match(/\d+/g).map(Number);
  const blendedR = Math.min((r1 + r2) / 2, 255);
  const blendedG = Math.min((g1 + g2) / 2, 255);
  const blendedB = Math.min((b1 + b2) / 2, 255);
  return `rgba(${blendedR}, ${blendedG}, ${blendedB}, 0.7)`;
};

// Perlin noise generator for smooth organic animations
// const perlin = (() => {
//   const perm = new Uint8Array(512);
//   for (let i = 0; i < 256; i++) perm[i] = perm[i + 256] = i;
//   for (let i = 255; i > 0; i--) {
//     const n = Math.floor(Math.random() * i);
//     [perm[i], perm[n]] = [perm[n], perm[i]];
//   }
//   const grad = (hash, x, y) => (hash & 1 ? x : -x) + (hash & 2 ? y : -y);
//   const fade = (t) => t * t * t * (t * (t * 6 - 15) + 10);
//   return (x, y) => {
//     const X = x & 255,
//       Y = y & 255,
//       xf = x - (x | 0),
//       yf = y - (y | 0),
//       u = fade(xf),
//       v = fade(yf),
//       aa = perm[X + perm[Y]],
//       ab = perm[X + perm[Y + 1]],
//       ba = perm[X + 1 + perm[Y]],
//       bb = perm[X + 1 + perm[Y + 1]];
//     return (
//       (1 - v) * ((1 - u) * grad(aa, xf, yf) + u * grad(ba, xf - 1, yf)) +
//       v * ((1 - u) * grad(ab, xf, yf - 1) + u * grad(bb, xf - 1, yf - 1))
//     );
//   };
// })();

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

    // Circle configuration with acceleration properties
    const balls = [
      {
        x: canvas.width / 2,
        y: (canvas.height - 52) / 2,
        radius: 300,
        color: "rgb(18, 113, 255)",
        animationType: "vertical",
        speed: 3000,
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
        speed: 4000,
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
        speed: 8000,
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
        speed: 8000,
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
        speed: 4000,
        currentSpeed: 4000,
        targetSpeed: 4000,
        transitionStartTime: 0,
        transitionDuration: 0,
      },
    ];

    // // Function to update ball speeds dynamically
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

    // Easing function for smooth transitions
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
      gradient.addColorStop(0, ball.color);
      gradient.addColorStop(0.1, lightenColor(ball.color, -10, 0.9));
      gradient.addColorStop(0.2, lightenColor(ball.color, -20, 0.8));
      gradient.addColorStop(0.3, lightenColor(ball.color, -30, 0.7));
      gradient.addColorStop(0.4, lightenColor(ball.color, -40, 0.6));
      gradient.addColorStop(0.5, lightenColor(ball.color, -50, 0.5));
      gradient.addColorStop(0.6, lightenColor(ball.color, -60, 0.4));
      gradient.addColorStop(0.7, lightenColor(ball.color, -70, 0.3));
      gradient.addColorStop(0.8, lightenColor(ball.color, -80, 0.2));
      gradient.addColorStop(0.9, lightenColor(ball.color, -90, 0.1));
      gradient.addColorStop(1, lightenColor(ball.color, -120, 0));

      // Draw the ball
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

      // Draw background gradient
      const backgroundGradient = ctx.createLinearGradient(
        0,
        0,
        canvas.width,
        canvas.height
      );
      backgroundGradient.addColorStop(0, "rgb(33, 37, 41)"); // #212529 (base dark color)
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

      // Add mouse interaction glow
      ctx.beginPath();
      const mouseGradient = ctx.createRadialGradient(
        mouse.current.x,
        mouse.current.y,
        0,
        mouse.current.x,
        mouse.current.y,
        150
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
