export default function Hero({ content }) {
  return (
    <section className="relative min-h-[85svh] overflow-hidden lg:min-h-[90vh]">
      <img
        src={content.image || '/hero-mentor-review.jpg'}
        alt="CA student studying with mentor reviewing papers"
        fetchPriority="high"
        className="absolute inset-0 h-full w-full scale-[1.15] object-cover object-[50%_30%] sm:scale-100 sm:object-center"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/60 to-black/30 sm:from-black/80 sm:via-black/50 sm:to-black/20" />

      <div className="relative flex min-h-[85svh] flex-col items-center justify-end px-4 pb-10 pt-28 text-center sm:pt-32 lg:min-h-[90vh] lg:pb-16">
        <div className="max-w-2xl" data-aos="fade-up" data-aos-duration="600">
          <h1 className="font-display text-3xl font-bold leading-tight text-white text-shadow sm:text-4xl lg:text-5xl xl:text-6xl">
            {content.heading}
            <br />
            <span className="text-blue-400">{content.subheading}</span>
          </h1>

          <p className="mt-4 text-base text-white/90 text-shadow sm:text-lg lg:mt-6 lg:text-xl">{content.text}</p>

          <div className="mt-6 lg:mt-8">
            <a
              href={content.button_link || '#pricing'}
              className="inline-block w-full rounded-full bg-accent px-8 py-4 font-bold text-accent-foreground transition-shadow duration-300 hover:shadow-elevated sm:w-auto"
            >
              {content.button_label}
            </a>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-white/80 lg:gap-6">
            {(content.badges || []).map((badge) => (
              <div key={badge} className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400" />
                <span>{badge}</span>
              </div>
            ))}
          </div>

          {content.trusted_count && (
            <div
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-sm"
              data-aos="fade-in"
              data-aos-delay="400"
            >
              <span className="text-sm text-white/60">Trusted by</span>
              <span className="text-lg font-bold text-white">{content.trusted_count}</span>
              <span className="text-sm text-white/60">CA Students</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
