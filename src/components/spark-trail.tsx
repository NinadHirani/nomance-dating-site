"use client";

import React, { useEffect, useRef } from "react";

export function SparkTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Particle[] = [];
    const particleCount = 20; // Number of particles to create per move
    const maxParticles = 300;

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;
      decay: number;

        constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
        this.size = Math.random() * 4 + 3; // Smaller hearts
        this.speedX = (Math.random() - 0.5) * 0.8; // Reduced spread
        this.speedY = (Math.random() - 0.5) * 0.8; // Reduced spread
        this.opacity = 1;
        this.decay = 0.016; // Approximately 1 second at 60fps
        
        // Romantic colors: Reds, Pinks, Purples, White
        const colors = ["#ff4d4d", "#ff7eb9", "#ff007f", "#e0aaff", "#ffffff"];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.opacity -= this.decay;
        // Size decay adjusted to match lifetime
        if (this.size > 0.1) this.size -= (this.size / (1 / this.decay));
      }

      draw() {
        if (!ctx) return;
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.fillStyle = this.color;
        
        // Add glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        // Draw Heart Shape
        ctx.beginPath();
        const x = this.x;
        const y = this.y;
        const s = this.size;
        
        ctx.moveTo(x, y + s / 4);
        ctx.bezierCurveTo(x, y, x - s, y, x - s, y + s / 2);
        ctx.bezierCurveTo(x - s, y + s, x, y + s * 1.5, x, y + s * 2);
        ctx.bezierCurveTo(x, y + s * 1.5, x + s, y + s, x + s, y + s / 2);
        ctx.bezierCurveTo(x + s, y, x, y, x, y + s / 4);
        ctx.fill();
        ctx.restore();
      }
    }

    let isMouseDown = false;

    const handleMouseMove = (e: MouseEvent) => {
      const count = isMouseDown ? 6 : 2; // More hearts when dragging
      for (let i = 0; i < count; i++) {
        if (particles.length < maxParticles) {
          particles.push(new Particle(e.clientX, e.clientY));
        }
      }
    };

    const handleMouseDown = () => { isMouseDown = true; };
    const handleMouseUp = () => { isMouseDown = false; };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();

        if (particles[i].opacity <= 0) {
          particles.splice(i, 1);
          i--;
        }
      }
      
      requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("resize", handleResize);
    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
