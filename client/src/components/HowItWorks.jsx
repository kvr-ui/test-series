export default function HowItWorks({ content }) {
  const steps = content.steps || [];

  return (
    <section className="bg-background py-14 sm:py-20 lg:py-28" id="how-it-works">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center sm:mb-16" data-aos="fade-up">
          <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">{content.heading}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{content.subheading}</p>
        </div>

        {/* One column on phones, 2×2 on tablets, one row of steps on laptops */}
        <ol className="mx-auto grid max-w-2xl gap-6 sm:gap-8 md:max-w-4xl md:grid-cols-2 lg:max-w-6xl lg:grid-cols-4 lg:gap-6">
          {steps.map((step, index) => (
            <li
              key={step.title}
              className="flex items-start gap-4 lg:flex-col lg:rounded-2xl lg:border lg:border-border lg:bg-card lg:p-6 lg:shadow-soft"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground shadow-soft">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {index + 1}
                </span>
              </div>
              <div>
                <h3 className="font-display text-xl font-semibold text-primary">{step.title}</h3>
                <p className="mt-1 text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
