/**
 * BackToTop - #23 Scroll-to-top button
 */
import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`back-to-top ${visible ? 'visible' : ''}`}
      aria-label="Voltar ao topo"
      style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'hsl(var(--background))',
        boxShadow: '4px 4px 10px hsl(var(--neu-dark) / 0.3), -4px -4px 10px hsl(var(--neu-light) / 0.5)',
        border: '1px solid hsl(var(--neon-primary) / 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'hsl(var(--primary))',
      }}
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}
