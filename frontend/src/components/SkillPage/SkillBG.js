import React, { useEffect, useRef } from "react";
import anime from "animejs/lib/anime.es.js";

const SkillBG = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let cW, cH;
    let bgColor = "#212529";
    let animations = [];
    let circles = [];

    const colorPicker = (() => {
      const colors = [
        "#FF6138", // Bright orange
        "#FFBE53", // Yellow-orange
        "#2980B9", // Blue
        "#282741", // Dark grayish-blue
      ];
      let index = 0;
      return {
        next: () => {
          index = index++ < colors.length - 1 ? index : 0;
          return colors[index];
        },
        current: () => colors[index],
      };
    })();

    const resizeCanvas = () => {
      cW = window.innerWidth;
      cH = window.innerHeight;
      canvas.width = cW * window.devicePixelRatio;
      canvas.height = cH * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    const calcPageFillRadius = (x, y) => {
      const l = Math.max(x - 0, cW - x);
      const h = Math.max(y - 0, cH - y);
      return Math.sqrt(l * l + h * h);
    };

    const Circle = function (opts) {
      Object.assign(this, opts);
    };

    Circle.prototype.draw = function () {
      ctx.globalAlpha = this.opacity || 1;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI, false);
      if (this.stroke) {
        ctx.strokeStyle = this.stroke.color;
        ctx.lineWidth = this.stroke.width;
        ctx.stroke();
      }
      if (this.fill) {
        ctx.fillStyle = this.fill;
        ctx.fill();
      }
      ctx.closePath();
      ctx.globalAlpha = 1;
    };

    const removeAnimation = (animation) => {
      const index = animations.indexOf(animation);
      if (index > -1) animations.splice(index, 1);
    };

    const handleEvent = (e) => {
      const x = e.pageX || e.touches[0].pageX;
      const y = e.pageY || e.touches[0].pageY;
      const currentColor = colorPicker.current();
      const nextColor = colorPicker.next();
      const targetR = calcPageFillRadius(x, y);
      const rippleSize = Math.min(200, cW * 0.4);

      const pageFill = new Circle({
        x,
        y,
        r: 0,
        fill: nextColor,
      });
      animations.push(
        anime({
          targets: pageFill,
          r: targetR,
          duration: Math.max(targetR / 2, 750),
          easing: "easeOutQuart",
          update: () => pageFill.draw(),
          complete: () => {
            bgColor = pageFill.fill;
            removeAnimation(pageFill);
          },
        })
      );

      const ripple = new Circle({
        x,
        y,
        r: 0,
        fill: currentColor,
        stroke: { width: 3, color: currentColor },
        opacity: 1,
      });
      animations.push(
        anime({
          targets: ripple,
          r: rippleSize,
          opacity: 0,
          easing: "easeOutExpo",
          duration: 900,
          update: () => ripple.draw(),
          complete: () => removeAnimation(ripple),
        })
      );

      const particles = [];
      for (let i = 0; i < 32; i++) {
        const particle = new Circle({
          x,
          y,
          r: anime.random(24, 48),
          fill: currentColor,
        });
        particles.push(particle);
      }

      animations.push(
        anime({
          targets: particles,
          x: (particle) => particle.x + anime.random(rippleSize, -rippleSize),
          y: (particle) =>
            particle.y + anime.random(rippleSize * 1.15, -rippleSize * 1.15),
          r: 0,
          easing: "easeOutExpo",
          duration: anime.random(1000, 1300),
          update: () => particles.forEach((p) => p.draw()),
          complete: () => removeAnimation(particles),
        })
      );
    };

    const animate = anime({
      duration: Infinity,
      update: () => {
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, cW, cH);
        animations.forEach((anim) =>
          anim.animatables.forEach((a) => a.target.draw())
        );
      },
    });

    const init = () => {
      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);
      document.addEventListener("mousedown", handleEvent);
      document.addEventListener("touchstart", handleEvent);
    };

    init();
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      document.removeEventListener("mousedown", handleEvent);
      document.removeEventListener("touchstart", handleEvent);
    };
  }, []);

  return <canvas ref={canvasRef} className="skill-bg-canvas" />;
};

export default SkillBG;
