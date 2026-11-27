import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  twinkleSpeed: number;
  phase: number;
  driftX: number;
  driftY: number;
  tint: string;
}

export default function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let animationFrameId = 0;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();

    const starCount = Math.min(220, Math.max(95, Math.floor((width * height) / 9000)));
    const tints = ['#E2E8F0', '#BAE6FD', '#C7D2FE', '#DDD6FE', '#F8FAFC'];

    const stars: Star[] = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.45 + 0.35,
      baseAlpha: Math.random() * 0.55 + 0.2,
      twinkleSpeed: Math.random() * 0.015 + 0.004,
      phase: Math.random() * Math.PI * 2,
      driftX: (Math.random() - 0.5) * 0.06,
      driftY: (Math.random() - 0.5) * 0.04,
      tint: tints[Math.floor(Math.random() * tints.length)],
    }));

    const renderFrame = (time: number) => {
      ctx.clearRect(0, 0, width, height);

      for (const star of stars) {
        if (!prefersReducedMotion) {
          star.x += star.driftX;
          star.y += star.driftY;
          if (star.x < 0) star.x = width;
          if (star.x > width) star.x = 0;
          if (star.y < 0) star.y = height;
          if (star.y > height) star.y = 0;
        }

        const twinkle = prefersReducedMotion
          ? 0
          : Math.sin(time * star.twinkleSpeed * 0.06 + star.phase) * 0.25;
        const alpha = Math.max(0.08, Math.min(0.95, star.baseAlpha + twinkle));

        ctx.globalAlpha = alpha;
        ctx.fillStyle = star.tint;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    if (prefersReducedMotion) {
      renderFrame(0);
    } else {
      const loop = (time: number) => {
        renderFrame(time);
        animationFrameId = window.requestAnimationFrame(loop);
      };
      animationFrameId = window.requestAnimationFrame(loop);
    }

    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameId) {
        window.cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Deep navy and space obsidian ambient nebula gradients */}
      <div className="animate-galaxy-drift absolute -left-1/4 -top-1/4 h-[65vh] w-[65vw] rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.12)_0%,rgba(59,130,246,0.04)_45%,transparent_70%)] blur-3xl" />
      <div className="animate-galaxy-drift absolute -bottom-1/4 -right-1/4 h-[70vh] w-[70vw] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.12)_0%,rgba(79,70,229,0.04)_45%,transparent_70%)] blur-3xl [animation-delay:-9s]" />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-90" />
    </div>
  );
}
