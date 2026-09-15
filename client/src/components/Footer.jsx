const DocIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
  </svg>
);

const LEGAL_LINKS = [
  { href: '/privacy-policy.pdf', label: 'Privacy Policy' },
  { href: '/terms-and-conditions.pdf', label: 'Terms & Conditions' },
];

export default function Footer({ site, siteUrl }) {
  return (
    <footer className="border-t border-border bg-background py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-6 text-center lg:flex-row lg:text-left">
          <a href={siteUrl} className="flex items-center">
            <img src="/focas-logo.jpg" alt={site.brand} width="480" height="131" loading="lazy" className="h-9 w-auto" />
          </a>

          <div className="flex flex-wrap justify-center gap-3">
            {LEGAL_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener"
                className="flex min-h-[44px] items-center gap-2 rounded-md bg-secondary px-4 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
              >
                <DocIcon />
                {link.label}
              </a>
            ))}
          </div>

          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {site.copyright_text}
          </p>
        </div>
      </div>
    </footer>
  );
}
