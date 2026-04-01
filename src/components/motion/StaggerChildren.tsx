'use client';

import { useMemo } from 'react';
import { motion } from 'motion/react';
import type { ReactNode } from 'react';

interface StaggerChildrenProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

const childVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
} as const;

export function StaggerChildren({ children, staggerDelay = 0.08, className }: StaggerChildrenProps) {
  const parentVariants = useMemo(() => ({
    hidden: {},
    visible: { transition: { staggerChildren: staggerDelay } },
  }), [staggerDelay]);

  return (
    <motion.div initial="hidden" animate="visible" variants={parentVariants} className={className}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div variants={childVariants} className={className}>
      {children}
    </motion.div>
  );
}
