import { motion } from 'framer-motion';

export function FloatingIconBtn({
  children, onClick, ariaLabel,
}: { children: React.ReactNode; onClick?: () => void; ariaLabel?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      whileTap={{ scale: 0.85, y: 2 }}
      whileHover={{ scale: 1.08, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className="w-12 h-12 rounded-full flex items-center justify-center relative text-foreground cursor-pointer focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-2"
      style={{
        background: 'hsl(var(--background) / 0.8)',
        boxShadow: `
          10px 10px 24px hsl(var(--neu-dark) / 0.5),
          -10px -10px 24px hsl(var(--neu-light) / 0.7),
          inset 0 2px 0 hsl(var(--neu-light) / 0.6),
          inset 0 -2px 0 hsl(var(--neu-dark) / 0.08)
        `,
        border: '1px solid hsl(var(--neon-primary) / 0.25)',
      }}
    >
      {children}
    </motion.button>
  );
}
