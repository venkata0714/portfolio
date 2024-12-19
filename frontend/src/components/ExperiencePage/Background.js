import React, { useRef, useEffect } from "react";

const Background = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let particlesArray = [];
    const colors = ["#fcbc1d", "#edeeef", "#212529"];
    const maxParticles = 100;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const mouse = {
      x: null,
      y: null,
      radius: 120, // Radius of interaction
    };

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    const handleMouseMove = (event) => {
      mouse.x = event.clientX;
      mouse.y = event.clientY;
    };

    class Particle {
      constructor(x, y, size, color, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = this.color;
        ctx.fill();
      }

      update() {
        if (this.x + this.size > canvas.width || this.x - this.size < 0) {
          this.velocityX = -this.velocityX;
        }
        if (this.y + this.size > canvas.height || this.y - this.size < 0) {
          this.velocityY = -this.velocityY;
        }

        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {
          this.x += dx / 10;
          this.y += dy / 10;
        }

        this.x += this.velocityX;
        this.y += this.velocityY;

        this.draw();
      }
    }

    const initParticles = () => {
      particlesArray = [];
      for (let i = 0; i < maxParticles; i++) {
        const size = Math.random() * 5 + 2;
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        const velocityX = Math.random() * 2 - 1;
        const velocityY = Math.random() * 2 - 1;
        const color = colors[Math.floor(Math.random() * colors.length)];

        particlesArray.push(new Particle(x, y, size, color, velocityX, velocityY));
      }
    };

    const connectParticles = () => {
      for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
          const dx = particlesArray[a].x - particlesArray[b].x;
          const dy = particlesArray[a].y - particlesArray[b].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.strokeStyle = `rgba(252, 188, 29, ${1 - distance / 150})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
            ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesArray.forEach((particle) => particle.update());
      connectParticles();

      requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="background-canvas-2"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: -1,
      }}
    ></canvas>
  );
};

export default Background;
