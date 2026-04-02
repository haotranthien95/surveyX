'use client';

import { useEffect, useRef } from 'react';

interface Line {
  x: number;
  y: number;
  length: number;
  angle: number;
  opacity: number;
  thickness: number;
}

export function ScatteredPixels() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w;
    canvas.height = h;

    function createLines(width: number, height: number): Line[] {
      const count = Math.floor((width * height) / 4000);
      const lines: Line[] = [];
      for (let i = 0; i < count; i++) {
        // Bias toward right 60% and top 70%
        const biasRight = Math.random() < 0.65;
        const biasTop = Math.random() < 0.6;
        lines.push({
          x: biasRight ? width * 0.4 + Math.random() * width * 0.6 : Math.random() * width,
          y: biasTop ? Math.random() * height * 0.7 : Math.random() * height,
          length: Math.random() * 8 + 3,
          angle: Math.random() * Math.PI,
          opacity: Math.random() * 0.12 + 0.02,
          thickness: Math.random() < 0.2 ? 1.5 : 0.5 + Math.random() * 0.5,
        });
      }
      return lines;
    }

    function drawLines(lines: Line[]) {
      ctx!.clearRect(0, 0, w, h);
      for (const l of lines) {
        const dx = Math.cos(l.angle) * l.length * 0.5;
        const dy = Math.sin(l.angle) * l.length * 0.5;
        ctx!.beginPath();
        ctx!.moveTo(l.x - dx, l.y - dy);
        ctx!.lineTo(l.x + dx, l.y + dy);
        ctx!.strokeStyle = `rgba(150, 150, 150, ${l.opacity})`;
        ctx!.lineWidth = l.thickness;
        ctx!.lineCap = 'round';
        ctx!.stroke();
      }
    }

    let lines = createLines(w, h);
    drawLines(lines);

    const handleResize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      lines = createLines(w, h);
      drawLines(lines);
    };
    window.addEventListener('resize', handleResize);

    return () => {
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
