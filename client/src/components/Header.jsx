import { useEffect, useState } from 'react';

const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How It Works' },
  { href: '/#testimonials', label: 'Testimonials' },
  { href: '/#pricing', label: 'Pricing' },
];

export default function Header({ site, siteUrl }) {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onKeyDown = (e) => e.key === 'Escape' && setMenuOpen(false);
    // Close if the viewport grows past the breakpoint where the inline nav takes over
    const desktop = window.matchMedia('(min-width: 768px)');
    const onResize = () => desktop.matches && setMenuOpen(false);
    window.addEventListener('keydown', onKeyDown);
    desktop.addEventListener('change', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      desktop.removeEventListener('change', onResize);
    };
  }, [menuOpen]);

  const close = () => setMenuOpen(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-border/50 bg-background/90 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between gap-2 px-4 sm:gap-3">
        <a href={siteUrl} className="flex shrink-0 items-center py-2">
          <img src="/focas-logo.jpg" alt={site.brand} width="480" height="131" className="h-7 w-auto min-[360px]:h-8 sm:h-9" />
        </a>

        <nav className="hidden items-center gap-6 md:flex lg:gap-8" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="py-2 text-sm text-muted-foreground transition-colors hover:text-primary">
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1 min-[360px]:gap-2">
          <a
            href="/#pricing"
            onClick={close}
            className="flex min-h-[44px] items-center whitespace-nowrap rounded-full bg-accent px-4 text-sm font-bold min-[360px]:px-5 text-accent-foreground transition-shadow duration-300 hover:shadow-elevated sm:px-6"
          >
            Get Started
          </a>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-primary transition-colors hover:bg-muted md:hidden"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={menuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'}
              />
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="mobile-menu" aria-label="Main" className="animate-fade-in border-t border-border/50 bg-background md:hidden">
          <ul className="container mx-auto px-4 py-2">
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="border-b border-border/60 last:border-0">
                <a
                  href={link.href}
                  onClick={close}
                  className="flex min-h-[48px] items-center text-base font-medium text-foreground"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
