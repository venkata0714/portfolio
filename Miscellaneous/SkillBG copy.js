import React, { useEffect, useRef } from "react";

const SkillBG = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    (function () {
      "use strict";
      const canvas = canvasRef.current;

      if (!canvas || !canvas.getContext) {
        return false;
      }

      function rand(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
      }

      const ctx = canvas.getContext("2d");
      let X = (canvas.width = window.innerWidth);
      let Y = (canvas.height = window.innerHeight);
      let mouseX = null;
      let mouseY = null;
      let dist = 120;
      let lessThan = Math.sqrt(dist * dist + dist * dist);
      let mouseDist = 200;
      let shapeNum;
      let shapes = [];
      let ease = 0.2;
      let friction = 0.2;
      let lineWidth = 5;
      X > Y ? (shapeNum = X / dist) : (shapeNum = Y / dist);

      if (X < 768) {
        lineWidth = 2;
        dist = 40;
        lessThan = Math.sqrt(dist * dist + dist * dist);
        mouseDist = 50;
        X > Y ? (shapeNum = X / dist) : (shapeNum = Y / dist);
      }

      window.requestAnimationFrame =
        window.requestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (cb) {
          setTimeout(cb, 17);
        };

      function Shape(ctx, x, y, i) {
        this.ctx = ctx;
        this.init(x, y, i);
      }

      Shape.prototype.init = function (x, y, i) {
        this.x = x;
        this.y = y;
        this.xi = x;
        this.yi = y;
        this.i = i;
        this.r = 1;
        this.v = {
          x: 0,
          y: 0,
        };
        this.c = rand(0, 360);
      };

      Shape.prototype.draw = function () {
        const ctx = this.ctx;
        ctx.save();
        ctx.fillStyle = "hsl(" + this.c + ", " + "80%, 60%)";
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.restore();
      };

      Shape.prototype.mouseDist = function () {
        const x = mouseX - this.x;
        const y = mouseY - this.y;
        const d = x * x + y * y;
        const dist = Math.sqrt(d);
        if (dist < mouseDist) {
          this.v.x = +this.v.x;
          this.v.y = +this.v.y;
          const colAngle = Math.atan2(mouseY - this.y, mouseX - this.x);
          this.v.x = -Math.cos(colAngle) * 5;
          this.v.y = -Math.sin(colAngle) * 5;
          this.x += this.v.x;
          this.y += this.v.y;
        } else if (dist > mouseDist && dist < mouseDist + 10) {
          this.v.x = 0;
          this.v.y = 0;
        } else {
          this.v.x += (this.xi - this.x) * ease;
          this.v.y += (this.yi - this.y) * ease;
          this.v.x *= friction;
          this.v.y *= friction;
          this.x += this.v.x;
          this.y += this.v.y;
        }
      };

      Shape.prototype.drawLine = function (i) {
        const j = i;
        for (let i = 0; i < shapes.length; i++) {
          if (j !== i) {
            const x = this.x - shapes[i].x;
            const y = this.y - shapes[i].y;
            const d = x * x + y * y;
            const dist = Math.floor(Math.sqrt(d));
            if (dist <= lessThan) {
              ctx.save();
              ctx.lineWidth = lineWidth;
              ctx.strokeStyle = "hsl(" + this.c + ", " + "80%, 60%)";
              ctx.beginPath();
              ctx.moveTo(this.x, this.y);
              ctx.lineTo(shapes[i].x, shapes[i].y);
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      };

      Shape.prototype.render = function (i) {
        this.drawLine(i);
        if (mouseX !== null) this.mouseDist();
        this.draw();
      };

      for (let i = 0; i < shapeNum + 1; i++) {
        for (let j = 0; j < shapeNum + 1; j++) {
          if (j * dist - dist > Y) break;
          const s = new Shape(ctx, i * dist, j * dist, i, j);
          shapes.push(s);
        }
      }

      function render() {
        ctx.clearRect(0, 0, X, Y);
        for (let i = 0; i < shapes.length; i++) {
          shapes[i].render(i);
        }
        requestAnimationFrame(render);
      }

      render();

      function onResize() {
        X = canvas.width = window.innerWidth;
        Y = canvas.height = window.innerHeight;
        shapes = [];
        if (X < 768) {
          lineWidth = 2;
          dist = 40;
          lessThan = Math.sqrt(dist * dist + dist * dist);
          mouseDist = 50;
          X > Y ? (shapeNum = X / dist) : (shapeNum = Y / dist);
        } else {
          lineWidth = 5;
          dist = 80;
          lessThan = Math.sqrt(dist * dist + dist * dist);
          mouseDist = 150;
          X > Y ? (shapeNum = X / dist) : (shapeNum = Y / dist);
        }
        for (let i = 0; i < shapeNum + 1; i++) {
          for (let j = 0; j < shapeNum + 1; j++) {
            if (j * dist - dist > Y) break;
            const s = new Shape(ctx, i * dist, j * dist, i, j);
            shapes.push(s);
          }
        }
      }

      window.addEventListener("resize", onResize);

      window.addEventListener(
        "mousemove",
        function (e) {
          mouseX = e.clientX;
          mouseY = e.clientY;
        },
        false
      );

      canvas.addEventListener("touchmove", function (e) {
        const touch = e.targetTouches[0];
        mouseX = touch.pageX;
        mouseY = touch.pageY;
      });
    })();
  }, []);

  return <canvas ref={canvasRef} className="skill-bg-canvas" />;
};

export default SkillBG;
