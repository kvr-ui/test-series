const CrossIcon = () => (
  <svg className="mt-0.5 h-4 w-4 shrink-0 text-destructive/60" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const CheckIcon = () => (
  <svg className="mt-0.5 h-4 w-4 shrink-0 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

export default function Comparison({ content }) {
  const rows = content.rows || [];

  return (
    <section className="bg-muted/30 py-14 sm:py-20 lg:py-28" id="comparison">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center sm:mb-12" data-aos="fade-up">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-accent">{content.pill_text}</p>
          <h2 className="font-display text-3xl font-bold text-primary md:text-4xl lg:text-5xl">
            {content.heading}
            <br />
            <span className="text-muted-foreground">{content.subheading}</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:mt-6 sm:text-lg">{content.description}</p>
        </div>

        {/* Desktop table */}
        <div
          className="mx-auto hidden max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-card md:block"
          data-aos="fade-up"
          data-aos-delay="200"
        >
          <div className="grid grid-cols-3 border-b border-border bg-muted/50">
            <div className="p-4 text-sm font-semibold text-muted-foreground lg:p-6">What Matters</div>
            <div className="border-l border-border p-4 text-center lg:p-6">
              <span className="text-sm font-semibold text-destructive/80">{content.col_1_label}</span>
            </div>
            <div className="border-l border-border bg-accent/5 p-4 text-center lg:p-6">
              <span className="text-sm font-bold text-accent">{content.col_2_label}</span>
            </div>
          </div>

          {rows.map((row, index) => (
            <div key={row.aspect} className={`grid grid-cols-3 ${index < rows.length - 1 ? 'border-b border-border' : ''}`}>
              <div className="flex items-center p-4 lg:p-6">
                <span className="text-sm font-medium text-foreground">{row.aspect}</span>
              </div>
              <div className="flex items-start gap-2 border-l border-border p-4 lg:p-6">
                <CrossIcon />
                <span className="text-sm text-muted-foreground">{row.regular}</span>
              </div>
              <div className="flex items-start gap-2 border-l border-border bg-accent/5 p-4 lg:p-6">
                <CheckIcon />
                <span className="text-sm font-medium text-foreground">{row.focas}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile cards */}
        <div className="space-y-4 md:hidden">
          {rows.map((row, index) => (
            <div
              key={row.aspect}
              className="overflow-hidden rounded-xl border border-border bg-card shadow-sm"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="border-b border-border bg-muted/50 p-4">
                <span className="text-sm font-semibold text-foreground">{row.aspect}</span>
              </div>
              <div className="grid grid-cols-1 divide-y divide-border">
                <div className="flex items-start gap-3 p-4">
                  <CrossIcon />
                  <div>
                    <span className="text-xs font-medium text-destructive/80">{content.col_1_label}</span>
                    <p className="mt-1 text-sm text-muted-foreground">{row.regular}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 bg-accent/5 p-4">
                  <CheckIcon />
                  <div>
                    <span className="text-xs font-medium text-accent">{content.col_2_label}</span>
                    <p className="mt-1 text-sm font-medium text-foreground">{row.focas}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p
          className="mt-10 text-center font-display text-xl font-semibold text-primary sm:mt-12 md:text-2xl"
          data-aos="fade-up"
          data-aos-delay="400"
        >
          {content.punchline}
        </p>
      </div>
    </section>
  );
}
