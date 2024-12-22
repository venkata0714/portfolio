import React, { useEffect, useRef } from "react";

const Background = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    // === Begin original variables and configuration ===
    const STAR_COLOR = "#edeeef";
    const STAR_SIZE = 6;
    const STAR_MIN_SCALE = 0.2;
    const OVERFLOW_THRESHOLD = 50;
    const STAR_COUNT = (window.innerWidth + window.innerHeight) / 5;

    let scale = 1; // device pixel ratio
    let width, height;

    let stars = [];
    let pointerX, pointerY;

    let velocity = { x: 0, y: 0, tx: 0, ty: 0, z: 0.0005 };
    let touchInput = false;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    // === Functions from original code ===

    function generate() {
      for (let i = 0; i < STAR_COUNT; i++) {
        stars.push({
          x: 0,
          y: 0,
          z: STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE),
        });
      }
    }

    function placeStar(star) {
      star.x = Math.random() * width;
      star.y = Math.random() * height;
    }

    function recycleStar(star) {
      let direction = "z";

      let vx = Math.abs(velocity.x),
        vy = Math.abs(velocity.y);

      if (vx > 1 || vy > 1) {
        let axis;

        if (vx > vy) {
          axis = Math.random() < vx / (vx + vy) ? "h" : "v";
        } else {
          axis = Math.random() < vy / (vx + vy) ? "v" : "h";
        }

        if (axis === "h") {
          direction = velocity.x > 0 ? "l" : "r";
        } else {
          direction = velocity.y > 0 ? "t" : "b";
        }
      }

      star.z = STAR_MIN_SCALE + Math.random() * (1 - STAR_MIN_SCALE);

      if (direction === "z") {
        star.z = 0.1;
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
    }

    function resize() {
      scale = window.devicePixelRatio || 1;

      width = window.innerWidth * scale;
      height = window.innerHeight * scale;

      canvas.width = width;
      canvas.height = height;

      stars.forEach(placeStar);
    }

    function step() {
      context.clearRect(0, 0, width, height);

      update();
      render();

      requestAnimationFrame(step);
    }

    function update() {
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
    }

    function render() {
      stars.forEach((star) => {
        context.beginPath();
        context.lineCap = "round";
        context.lineWidth = STAR_SIZE * star.z * scale;
        context.globalAlpha = 0.7 + 0.5 * Math.random();
        context.strokeStyle = STAR_COLOR;

        context.beginPath();
        context.moveTo(star.x, star.y);
        context.lineTo(star.x, star.y);

        context.stroke();
      });
    }

    function movePointer(x, y) {
      if (typeof pointerX === "number" && typeof pointerY === "number") {
        let ox = x - pointerX,
          oy = y - pointerY;

        velocity.tx = velocity.tx + (ox / (8 * scale)) * (touchInput ? 1 : -1);
        velocity.ty = velocity.ty + (oy / (8 * scale)) * (touchInput ? 1 : -1);
      }

      pointerX = x;
      pointerY = y;
    }

    function onMouseMove(event) {
      touchInput = false;
      movePointer(event.clientX, event.clientY);
    }

    function onTouchMove(event) {
      touchInput = true;
      movePointer(event.touches[0].clientX, event.touches[0].clientY, true);
      event.preventDefault();
    }

    function onMouseLeave() {
      pointerX = window.innerWidth / 2;
      pointerY = window.innerHeight / 2;
    }

    // === Run initialization code ===
    generate();
    resize();
    step();

    // === Attach event listeners (React-friendly) ===
    window.addEventListener("resize", resize);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("touchmove", onTouchMove, { passive: true });
    canvas.addEventListener("touchend", onMouseLeave);
    document.addEventListener("mouseleave", onMouseLeave);

    // === Cleanup when component unmounts ===
    return () => {
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("touchmove", onTouchMove);
      canvas.removeEventListener("touchend", onMouseLeave);
      document.removeEventListener("mouseleave", onMouseLeave);
    };
  }, []);

  // The canvas styling ensures it covers the entire screen
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
        background: "#0f1419",
        backgroundImage: `radial-gradient(circle at top right, rgba(121, 68, 154, 0.13),       transparent),
    radial-gradient(circle at 20% 80%, rgba(41, 196, 255, 0.13), transparent)`,
      }}
    />
  );
};

export default Background;
