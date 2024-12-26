import React, { useRef, useEffect, useState } from "react";

/**
 * Helper to parse "r, g, b" or "r, g, b, a" strings into numeric array [r,g,b,a].
 * The user might pass "18, 113, 255" or "0, 17, 82", etc.
 */
function parseColorString(colorString) {
  const parts = colorString.split(",").map((val) => parseFloat(val.trim()));
  // Ensure we have at least RGB
  const [r, g, b, a = 1] = parts;
  return { r, g, b, a };
}

/**
 * Convert the color object {r,g,b,a} to a string "rgba(r, g, b, a)".
 */
function toRgbaString({ r, g, b, a }) {
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * The main GradientBG component replicating the five moving radial gradients
 * and an optional pointer circle, all drawn onto a <canvas>.
 */
export default function GradientBG({
  gradientBackgroundStart = "rgb(108, 0, 162)",
  gradientBackgroundEnd = "rgb(0, 17, 82)",
  firstColor = "18, 113, 255",
  secondColor = "221, 74, 255",
  thirdColor = "100, 220, 255",
  fourthColor = "200, 50, 50",
  fifthColor = "180, 180, 50",
  pointerColor = "140, 100, 255",
  // Increase from "80%" → "120%"
  size = "120%",
  blendingValue = "hard-light",
  // Force interactive = true, as requested
  interactive = false,
  containerClassName = "",
  className = "",
}) {
  const canvasRef = useRef(null);

  // Mouse position for interactive pointer effect
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Convert "80%" to a fraction for usage in canvas
  const fractionSize = (() => {
    if (typeof size === "string" && size.includes("%")) {
      const val = parseFloat(size);
      if (!isNaN(val)) {
        return val / 100;
      }
      return 0.8;
    }
    // If user used px or something else, just default to 0.8
    return 0.8;
  })();

  // ---- Circle definitions (similar to the DOM-based radial gradients) ----
  // We'll define each circle's color, animation style, and period
  // so it exactly matches the original:
  //   "first" moves vertical with a 30s period
  //   "second" moves in a circle with a 20s period, reversed
  //   "third" moves in a circle with a 40s period, normal
  //   "fourth" moves horizontal with a 40s period
  //   "fifth" moves in a circle with a 20s period, normal
  // Circles: durations scaled to 3/4 previous. e.g. 30s -> 22500 ms, etc.
  const circles = [
    // first: 30s → 22.5s
    { color: firstColor, anim: "vertical", durationMs: 22500 },
    // second: 20s → 15s
    { color: secondColor, anim: "circularReverse", durationMs: 15000 },
    // third: 40s → 30s
    { color: thirdColor, anim: "circular", durationMs: 30000 },
    // fourth: 40s → 30s
    { color: fourthColor, anim: "horizontal", durationMs: 30000 },
    // fifth: 20s → 15s
    { color: fifthColor, anim: "circular", durationMs: 15000 },
  ];

  const isPointerInsideCanvas = (x, y, canvas) => {
    const rect = canvas.getBoundingClientRect();
    return (
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
    );
  };

  // Update mouse and touch event handlers
  useEffect(() => {
    const handleMouse = (ev) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      if (isPointerInsideCanvas(ev.clientX, ev.clientY, canvas)) {
        setMousePos({ x: ev.clientX, y: ev.clientY });
      }
    };

    if (interactive) {
      window.addEventListener("mousemove", handleMouse);
    }

    return () => {
      if (interactive) {
        window.removeEventListener("mousemove", handleMouse);
      }
    };
  }, [interactive]);

  // Additional “cool” enhancements:
  // 1) Parallax shift on background gradient
  // 2) Random “twinkle” particles
  // 3) Chromatic glow effect for circle edges
  const [twinkles] = useState(() => {
    // Pre-generate some random star-like positions
    // We'll keep them static, but fade in/out over time
    const numStars = 50;
    const arr = [];
    for (let i = 0; i < numStars; i++) {
      arr.push({
        x: Math.random(),
        y: Math.random(),
        speed: 0.002 + Math.random() * 0.003, // fade speed
      });
    }
    return arr;
  });

  // The main animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;
    let startTime = null;

    // Resize canvas to fill screen
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Each “twinkle” has a random “phase” for alpha oscillation
    twinkles.forEach((tw) => {
      tw.phase = Math.random() * Math.PI * 2;
    });

    // Draw function
    const draw = (time) => {
      // Convert time to ms from start
      const now = time || 0;
      if (!startTime) startTime = now;
      const elapsed = now - startTime; // ms since start

      // 1) Parallax factor based on mouse
      const parallaxX = (mousePos.x / window.innerWidth - 0.5) * 0.2;
      const parallaxY = (mousePos.y / window.innerHeight - 0.5) * 0.2;

      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 3) Draw background gradient with parallax shift
      const shiftX = canvas.width * 0.5 * parallaxX;
      const shiftY = canvas.height * 0.5 * parallaxY;
      const bgGrad = ctx.createLinearGradient(
        0 - shiftX,
        0 - shiftY,
        canvas.width + shiftX,
        canvas.height + shiftY
      );
      // Slightly darker, more matte-like
      // (You can also apply multi-stop gradient for a pseudo 3D effect)
      bgGrad.addColorStop(0, darkenColor(gradientBackgroundStart, 20));
      bgGrad.addColorStop(1, darkenColor(gradientBackgroundEnd, 20));
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 4) Draw twinkle stars
      twinkles.forEach((star) => {
        star.phase += star.speed;
        const alpha = Math.abs(Math.sin(star.phase)); // 0 -> 1
        const tx = star.x * canvas.width;
        const ty = star.y * canvas.height;
        ctx.save();
        ctx.globalAlpha = alpha * 0.7; // fade
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(tx, ty, 1.2, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      });

      ctx.save();
      ctx.globalCompositeOperation = blendingValue; // e.g. "hard-light"

      // For each circle, compute position based on animation type
      // We'll treat the "size" fraction for radius
      const minDim = Math.min(canvas.width, canvas.height);
      const radius = fractionSize * minDim * 0.5;
      // ^ 0.5 because the circle is from the center outward

      circles.forEach((circle) => {
        const { r, g, b } = parseColorString(circle.color);

        let cx = canvas.width / 2;
        let cy = canvas.height / 2;

        const progress = (elapsed % circle.durationMs) / circle.durationMs; // 0->1 over the duration
        const angle = progress * 2 * Math.PI; // complete loop in one duration

        switch (circle.anim) {
          case "vertical": {
            // Move up/down
            // from -0.5 radius to +0.5 radius
            const offset = Math.sin(angle) * (canvas.height * 0.25);
            cy = canvas.height / 2 + offset;
            break;
          }
          case "horizontal": {
            // Move left/right
            const offset = Math.sin(angle) * (canvas.width * 0.25);
            cx = canvas.width / 2 + offset;
            break;
          }
          case "circular": {
            const offsetX = Math.cos(angle) * (canvas.width * 0.25);
            const offsetY = Math.sin(angle) * (canvas.height * 0.25);
            cx = canvas.width / 2 + offsetX;
            cy = canvas.height / 2 + offsetY;
            break;
          }
          case "circularReverse": {
            // same as "circular" but rotate in the opposite direction
            const offsetX = -Math.cos(angle) * (canvas.width * 0.25);
            const offsetY = -Math.sin(angle) * (canvas.height * 0.25);
            cx = canvas.width / 2 + offsetX;
            cy = canvas.height / 2 + offsetY;
            break;
          }
          default:
            break;
        }

        // Draw with a radial gradient. The original code used
        // radial-gradient(circle at center, color 0, transparent 50%).
        // We'll do something similar:
        const radGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        radGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.8)`);
        radGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.0)`);
        ctx.fillStyle = radGrad;

        // Optionally add blur to replicate the heavy blur:
        ctx.save();
        ctx.filter = "blur(40px)";
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      });

      ctx.restore();

      // If interactive, draw a pointer circle where the mouse is
      if (interactive) {
        ctx.save();
        ctx.globalCompositeOperation = blendingValue; // e.g. "hard-light"
        ctx.filter = "blur(40px)";
        const { r, g, b } = parseColorString(pointerColor);
        const pointerRad = minDim * 0.3; // pointer's radial gradient size

        const pointerGrad = ctx.createRadialGradient(
          mousePos.x,
          mousePos.y,
          0,
          mousePos.x,
          mousePos.y,
          pointerRad
        );
        pointerGrad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.8)`);
        pointerGrad.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0)`);
        ctx.fillStyle = pointerGrad;

        ctx.beginPath();
        ctx.arc(mousePos.x, mousePos.y, pointerRad, 0, 2 * Math.PI);
        ctx.fill();
        ctx.restore();
      }

      // request next frame
      animationFrameId = requestAnimationFrame(draw);
    };

    // Start the animation
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    gradientBackgroundStart,
    gradientBackgroundEnd,
    firstColor,
    secondColor,
    thirdColor,
    fourthColor,
    fifthColor,
    pointerColor,
    blendingValue,
    fractionSize,
    interactive,
  ]);

  return (
    <div
      className={`relative w-screen h-screen overflow-hidden ${containerClassName}`}
    >
      {/* 
        We place the <canvas> absolutely to fill the parent. 
        className if you want extra styling. 
      */}
      <canvas
        ref={canvasRef}
        className={className}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: -1,
          width: "100%",
          height: "100%",
        }}
      />
    </div>
  );
}

function darkenColor(color, amount) {
  // Convert "rgb(r,g,b)" → numeric
  let col = color;
  // If we see "rgb(", strip it
  if (col.startsWith("rgb(") || col.startsWith("rgba(")) {
    col = col.replace(/rgba?\(/, "").replace(")", "");
  }
  const [r, g, b] = col.split(",").map((n) => parseInt(n.trim(), 10));
  const dr = Math.max(r - amount, 0);
  const dg = Math.max(g - amount, 0);
  const db = Math.max(b - amount, 0);
  return `rgb(${dr}, ${dg}, ${db})`;
}
