export const Section = ({
  children, className = '', label,
}: { children: React.ReactNode; className?: string; label?: string }) => (
  <section aria-label={label} className={`rounded-2xl border border-border/40 bg-card p-4 md:p-5 ${className}`}>
    {children}
  </section>
);

export const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">{children}</h2>
);

export const formatPrice = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;
