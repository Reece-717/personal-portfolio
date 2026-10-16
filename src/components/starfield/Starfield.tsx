"use client";

import { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  r: number;
  baseAlpha: number;
  phase: number;
  speed: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
}

const STARS_DESKTOP = 220;
const STARS_MOBILE = 100;

export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.innerWidth < 640;
    const starCount = isMobile ? STARS_MOBILE : STARS_DESKTOP;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let stars: Star[] = [];
    let shooting: ShootingStar | null = null;
    let lastShoot = 0;
    let raf = 0;

    function initStars() {
      stars = Array.from({ length: starCount }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.5 + 0.4,
        baseAlpha: Math.random() * 0.6 + 0.4,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.005,
      }));
    }

    function resize() {
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = window.innerWidth + "px";
      canvas!.style.height = window.innerHeight + "px";
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      initStars();
    }

    function draw(now: number) {
      const w = window.innerWidth;
      const h = window.innerHeight;
      ctx!.clearRect(0, 0, w, h);

      // 星点闪烁
      for (const s of stars) {
        const twinkle = prefersReduced ? 1 : 0.5 + 0.5 * Math.sin(s.phase + now * s.speed);
        ctx!.beginPath();
        ctx!.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(230, 236, 255, ${(s.baseAlpha * twinkle).toFixed(3)})`;
        ctx!.fill();
      }

      // 流星
      if (!prefersReduced) {
        if (!shooting && now - lastShoot > 4000 + Math.random() * 4000) {
          shooting = {
            x: Math.random() * w,
            y: Math.random() * h * 0.4,
            vx: -(4 + Math.random() * 4),
            vy: 2 + Math.random() * 2,
            life: 1,
          };
          lastShoot = now;
        }

        if (shooting) {
          shooting.x += shooting.vx;
          shooting.y += shooting.vy;
          shooting.life -= 0.02;

          const tailX = shooting.x - shooting.vx * 8;
          const tailY = shooting.y - shooting.vy * 8;
          const grad = ctx!.createLinearGradient(shooting.x, shooting.y, tailX, tailY);
          grad.addColorStop(0, `rgba(255, 255, 255, ${Math.max(shooting.life, 0)})`);
          grad.addColorStop(1, "rgba(255, 255, 255, 0)");
          ctx!.strokeStyle = grad;
          ctx!.lineWidth = 1.5;
          ctx!.beginPath();
          ctx!.moveTo(shooting.x, shooting.y);
          ctx!.lineTo(tailX, tailY);
          ctx!.stroke();

          if (shooting.life <= 0 || shooting.x < 0 || shooting.y > h) {
            shooting = null;
          }
        }
      }

      raf = requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", resize);

    if (prefersReduced) {
      draw(0);
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(draw);
    }

    function onVisibility() {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else if (!prefersReduced) {
        raf = requestAnimationFrame(draw);
      }
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full"
    />
  );
}
