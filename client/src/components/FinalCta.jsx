export default function FinalCta({ content }) {
  return (
    <section className="bg-hero-gradient py-14 sm:py-20 lg:py-28" id="get-started">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-2xl text-center" data-aos="fade-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/10 px-4 py-2">
            <svg className="h-4 w-4 animate-pulse-soft text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium text-primary-foreground">{content.pill_text}</span>
          </div>

          <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
            {content.heading}
            <br />
            {content.subheading}
          </h2>

          <p className="mt-6 text-lg text-primary-foreground/70">{content.text}</p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <a
              href={content.button_link || '#pricing'}
              className="w-full rounded-full bg-accent px-8 py-4 text-center text-lg font-bold text-accent-foreground transition-shadow duration-300 hover:shadow-elevated sm:w-auto"
            >
              {content.button_label}
            </a>
          </div>

          <p className="mt-8 text-sm text-primary-foreground/50">{content.footer_text}</p>
        </div>
      </div>
    </section>
  );
}
