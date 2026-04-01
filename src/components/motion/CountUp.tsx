'use client';

import { useEffect, useRef } from 'react';
import { useMotionValue, animate } from 'motion/react';

interface CountUpProps {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}

export function CountUp({ value, duration = 0.8, suffix = '%', className }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);

  useEffect(() => {
    const controls = animate(motionValue, value, {
      duration,
      ease: [0.16, 1, 0.3, 1],
    });
    const unsubscribe = motionValue.on('change', (v) => {
      if (ref.current) {
        ref.current.textContent = `${Math.round(v).toLocaleString()}${suffix}`;
      }
    });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, duration, suffix, motionValue]);

  return <span ref={ref} className={className}>0{suffix}</span>;
}
