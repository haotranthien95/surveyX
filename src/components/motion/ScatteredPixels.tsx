'use client';

import { useEffect, useRef } from 'react';

interface Pixel {
  x: number;
  y: number;
  size: number;
  opacity: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

export function ScatteredPixels() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Check reduced motion
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    window.addEventListener('resize', handleResize);

    // Generate scattered pixels — concentrated on right side + top area
    const COUNT = Math.floor((w * h) / 2800); // density scales with viewport
    const pixels: Pixel[] = [];

    function createPixel(): Pixel {
      // Bias toward right 60% and top 70% of screen
      const biasRight = Math.random() < 0.65;
      const biasTop = Math.random() < 0.6;
      return {
        x: biasRight ? w * 0.4 + Math.random() * w * 0.6 : Math.random() * w,
        y: biasTop ? Math.random() * h * 0.7 : Math.random() * h,
        size: Math.random() < 0.3 ? Math.random() * 4 + 3 : Math.random() * 3 + 1,
        opacity: Math.random() * 0.15 + 0.03,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.06,
        life: 0,
        maxLife: Math.random() * 600 + 400,
      };
    }

    for (let i = 0; i < COUNT; i++) {
      const p = createPixel();
      p.life = Math.random() * p.maxLife; // stagger start
      pixels.push(p);
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);

      for (let i = 0; i < pixels.length; i++) {
        const p = pixels[i];

        // Fade in/out based on life cycle
        const lifeRatio = p.life / p.maxLife;
        let alpha = p.opacity;
        if (lifeRatio < 0.1) alpha *= lifeRatio / 0.1;
        else if (lifeRatio > 0.9) alpha *= (1 - lifeRatio) / 0.1;

        ctx!.fillStyle = `rgba(160, 160, 160, ${alpha})`;
        ctx!.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);

        if (!prefersReduced) {
          p.x += p.vx;
          p.y += p.vy;
        }
        p.life += 1;

        // Recycle pixel when life expires
        if (p.life >= p.maxLife) {
          const np = createPixel();
          np.life = 0;
          pixels[i] = np;
        }
      }

      animRef.current = requestAnimationFrame(draw);
    }

    // Static render for reduced motion
    if (prefersReduced) {
      draw();
    } else {
      animRef.current = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
