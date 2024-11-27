"use client";
import React, { useEffect, useRef } from "react";
import planet1 from "../assets/img/media/planet-1.png";
import planet2 from "../assets/img/media/planet-2.png";
import planet3 from "../assets/img/media/planet-3.png";
import planet4 from "../assets/img/media/planet-4.png";

export const BackgroundBeams = ({ className = "" }) => {
  const canvasRef = useRef(null);
  const planetImages = [planet1, planet2, planet3, planet4];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const stars = [];
    const planets = [];
    const nebulas = [];
    const meteors = [];

    // Create Stars
    const createStars = (count, layer) => {
      for (let i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          radius: Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.5 + 0.5,
          speed: (Math.random() * 0.05 + 0.02) * layer,
          layer,
        });
      }
    };

    // Create Planets
    const createPlanets = (count, layer) => {
      for (let i = 0; i < count; i++) {
        planets.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 50 + 20, // Slightly bigger than stars
          speedX: Math.random() * 0.1 - 0.05 * layer, // Slow horizontal motion
          speedY: Math.random() * 0.1 - 0.05 * layer, // Slow vertical motion
          image: planetImages[Math.floor(Math.random() * planetImages.length)],
        });
      }
    };

    // Create Nebulas
    const createNebulas = (count) => {
      for (let i = 0; i < count; i++) {
        nebulas.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 150 + 50,
          //   color: `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
          //     Math.random() * 255
          //   }, 0.3)`,
          color: `#edeeef`,
          opacity: Math.random() * 0.2 + 0.1,
        });
      }
    };

    // Create Meteor
    const createMeteor = () => {
      meteors.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 200 + 100,
        speed: Math.random() * 5 + 2,
        opacity: Math.random() * 0.8 + 0.2,
        angle: -Math.PI / 4, // Diagonal top-left movement
      });
    };

    // Draw Stars
    const drawStars = () => {
      stars.forEach((star) => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();
        star.x -= star.speed; // Parallax effect based on layer
        if (star.x < 0) star.x = canvas.width; // Wrap around horizontally
      });
    };

    // Draw Planets
    const drawPlanets = () => {
      planets.forEach((planet) => {
        const img = new Image();
        img.src = planet.image;
        ctx.drawImage(img, planet.x, planet.y, planet.size, planet.size);
        planet.x += planet.speedX;
        planet.y += planet.speedY;

        // Wrap planets if they move off-screen
        if (planet.x < -planet.size) planet.x = canvas.width;
        if (planet.x > canvas.width) planet.x = -planet.size;
        if (planet.y < -planet.size) planet.y = canvas.height;
        if (planet.y > canvas.height) planet.y = -planet.size;
      });
    };

    // Draw Nebulas
    const drawNebulas = () => {
      nebulas.forEach((nebula) => {
        const gradient = ctx.createRadialGradient(
          nebula.x,
          nebula.y,
          0,
          nebula.x,
          nebula.y,
          nebula.size
        );
        gradient.addColorStop(0, nebula.color);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.beginPath();
        ctx.arc(nebula.x, nebula.y, nebula.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = nebula.opacity;
        ctx.fill();
        ctx.globalAlpha = 1; // Reset alpha
      });
    };

    // Draw Meteors
    const drawMeteors = () => {
      meteors.forEach((meteor, index) => {
        ctx.beginPath();
        ctx.moveTo(meteor.x, meteor.y);
        ctx.lineTo(
          meteor.x + Math.cos(meteor.angle) * meteor.length,
          meteor.y + Math.sin(meteor.angle) * meteor.length
        );
        ctx.strokeStyle = `rgba(255, 255, 255, ${meteor.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();

        meteor.x += Math.cos(meteor.angle) * meteor.speed;
        meteor.y += Math.sin(meteor.angle) * meteor.speed;

        if (meteor.x < 0 || meteor.y < 0) meteors.splice(index, 1); // Remove off-screen meteors
      });
    };

    // Animation Loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      drawStars();
      drawPlanets();
      drawNebulas();
      drawMeteors();

      if (Math.random() > 0.995) createMeteor(); // Rare meteor event
      requestAnimationFrame(animate);
    };

    // Handle Resize
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      stars.length = 0;
      planets.length = 0;
      createStars(40, 1);
      createStars(20, 0.5);
      createStars(20, 0.3);
      createPlanets(2, 0.9);
      createPlanets(3, 0.3);
    };

    createStars(40, 1);
    createStars(20, 0.5);
    createStars(20, 0.3);
    createPlanets(2, 0.75);
    createPlanets(3, 0.25);
    createNebulas(8);
    handleResize();
    animate();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [planetImages]);

  return (
    <canvas
      ref={canvasRef}
      className={`background-beams-canvas ${className}`}
    />
  );
};
