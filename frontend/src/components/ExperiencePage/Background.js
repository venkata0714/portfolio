import React, { useEffect, useRef } from "react";

const Background = () => {
  const canvasRef = useRef();

  useEffect(() => {
    const STAR_COLOR = "#edeeef";
    const STAR_SIZE = 4;
    const STAR_MIN_SCALE = 0.2;
    const OVERFLOW_THRESHOLD = 50;
    const STAR_COUNT = (window.innerWidth + window.innerHeight) / 5;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    let scale = 1; // Device pixel ratio
    let width, height;

    const stars = [];
    let pointerX = window.innerWidth / 2, // Default pointer to center
      pointerY = window.innerHeight / 2;

    let velocity = { x: 0, y: 0, tx: 0, ty: 0, z: 0.00075 };
    let touchInput = false;

    const generateStars = () => {
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: 0,
          y: 0,
          z: STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE),
        });
      }
    };

    const placeStar = (star) => {
      star.x = Math.random() * width;
      star.y = Math.random() * height;
    };

    const recycleStar = (star) => {
      let direction = "z";
      const vx = Math.abs(velocity.x);
      const vy = Math.abs(velocity.y);

      if (vx > 1 || vy > 1) {
        const axis = vx > vy ? "h" : "v";
        direction =
          axis === "h"
            ? velocity.x > 0
              ? "l"
              : "r"
            : velocity.y > 0
            ? "t"
            : "b";
      }

      star.z = STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE);

      if (direction === "z") {
        star.x = Math.random() * width;
        star.y = Math.random() * height;
      } else if (direction === "l") {
        star.x = -OVERFLOW_THRESHOLD;
        star.y = height * Math.random();
      } else if (direction === "r") {
        star.x = width + OVERFLOW_THRESHOLD;
        star.y = height * Math.random();
      } else if (direction === "t") {
        star.x = width * Math.random();
        star.y = -OVERFLOW_THRESHOLD;
      } else if (direction === "b") {
        star.x = width * Math.random();
        star.y = height + OVERFLOW_THRESHOLD;
      }
    };

    const resizeCanvas = () => {
      scale = window.devicePixelRatio || 1;
      width = window.innerWidth * scale;
      height = window.innerHeight * scale;

      canvas.width = width;
      canvas.height = height;

      stars.forEach(placeStar);
    };

    const step = () => {
      context.clearRect(0, 0, width, height);
      updateStars();
      renderStars();
      requestAnimationFrame(step);
    };

    const updateStars = () => {
      velocity.tx *= 0.96;
      velocity.ty *= 0.96;

      velocity.x += (velocity.tx - velocity.x) * 0.8;
      velocity.y += (velocity.ty - velocity.y) * 0.8;

      stars.forEach((star) => {
        star.x += velocity.x * star.z;
        star.y += velocity.y * star.z;

        star.x += (star.x - width / 2) * velocity.z * star.z;
        star.y += (star.y - height / 2) * velocity.z * star.z;
        star.z += velocity.z;

        if (
          star.x < -OVERFLOW_THRESHOLD ||
          star.x > width + OVERFLOW_THRESHOLD ||
          star.y < -OVERFLOW_THRESHOLD ||
          star.y > height + OVERFLOW_THRESHOLD
        ) {
          recycleStar(star);
        }
      });
    };

    const renderStars = () => {
      stars.forEach((star) => {
        context.beginPath();
        context.lineCap = "round";
        context.lineWidth = STAR_SIZE * star.z * scale;
        context.globalAlpha = 0.7 + 0.5 * Math.random();
        context.strokeStyle = STAR_COLOR;
        context.moveTo(star.x, star.y);
        context.lineTo(star.x, star.y);

        context.stroke();
      });
    };

    const movePointer = (x, y) => {
      const ox = x - pointerX;
      const oy = y - pointerY;

      velocity.tx += (ox / (8 * scale)) * (touchInput ? 1 : -1);
      velocity.ty += (oy / (8 * scale)) * (touchInput ? 1 : -1);

      pointerX = x;
      pointerY = y;
    };

    const onMouseMove = (event) => {
      touchInput = false;
      renderStars();
      movePointer(event.clientX, event.clientY);
    };

    const onTouchMove = (event) => {
      touchInput = false;
      movePointer(event.touches[0].clientX, event.touches[0].clientY);
      // event.preventDefault();
    };

    const onMouseLeave = () => {
      pointerX = window.innerWidth / 2;
      pointerY = window.innerHeight / 2;
    };

    generateStars();
    resizeCanvas();
    step();

    window.addEventListener("resize", resizeCanvas);
    window.addEventListener("mousemove", onMouseMove); // Global listener for mousemove
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseleave", onMouseLeave);
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
      }}
    />
  );
};

export default Background;
