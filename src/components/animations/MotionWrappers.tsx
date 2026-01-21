import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

// Fade In animation wrapper
interface FadeInProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
}

export function FadeIn({ 
  children, 
  delay = 0, 
  duration = 0.5,
  direction = 'up',
  ...props 
}: FadeInProps) {
  const directions = {
    up: { y: 20 },
    down: { y: -20 },
    left: { x: 20 },
    right: { x: -20 },
    none: {},
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration, delay, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Fade In when visible (scroll triggered)
interface FadeInViewProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  once?: boolean;
}

export function FadeInView({ 
  children, 
  delay = 0, 
  duration = 0.5,
  direction = 'up',
  once = true,
  ...props 
}: FadeInViewProps) {
  const directions = {
    up: { y: 30 },
    down: { y: -30 },
    left: { x: 30 },
    right: { x: -30 },
    none: {},
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once, margin: '-50px' }}
      transition={{ duration, delay, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Scale on hover
interface ScaleHoverProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  scale?: number;
}

export function ScaleHover({ children, scale = 1.02, ...props }: ScaleHoverProps) {
  return (
    <motion.div
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Stagger children animation
interface StaggerContainerProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  staggerDelay?: number;
  delayChildren?: number;
}

export function StaggerContainer({ 
  children, 
  staggerDelay = 0.1,
  delayChildren = 0,
  ...props 
}: StaggerContainerProps) {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
            delayChildren,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Stagger item (use inside StaggerContainer)
interface StaggerItemProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
}

export function StaggerItem({ children, ...props }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Slide in animation
interface SlideInProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  direction?: 'left' | 'right' | 'up' | 'down';
  delay?: number;
  duration?: number;
}

export function SlideIn({ 
  children, 
  direction = 'left',
  delay = 0,
  duration = 0.5,
  ...props 
}: SlideInProps) {
  const directions = {
    left: { x: -100 },
    right: { x: 100 },
    up: { y: -100 },
    down: { y: 100 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration, delay, ease: [0.25, 0.1, 0.25, 1] }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Page transition wrapper
interface PageTransitionProps {
  children: ReactNode;
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {children}
    </motion.div>
  );
}

// Counter animation for numbers
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ value, duration = 2, className }: AnimatedCounterProps) {
  return (
    <motion.span
      className={className}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <motion.span
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        {value}
      </motion.span>
    </motion.span>
  );
}

// Pulse animation
interface PulseProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
}

export function Pulse({ children, ...props }: PulseProps) {
  return (
    <motion.div
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Float animation
interface FloatProps extends HTMLMotionProps<'div'> {
  children: ReactNode;
  intensity?: number;
}

export function Float({ children, intensity = 10, ...props }: FloatProps) {
  return (
    <motion.div
      animate={{ y: [-intensity/2, intensity/2, -intensity/2] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
