/**
 * SkipToContent - Accessibility skip navigation link
 * Also includes prefers-reduced-motion CSS injection
 */

export function SkipToContent() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-primary focus:text-primary-foreground focus:text-sm focus:font-semibold focus:shadow-lg focus:outline-none"
    >
      Pular para o conteúdo principal
    </a>
  );
}
