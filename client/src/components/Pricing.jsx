import { useMemo, useState } from 'react';
import { buildPlans, checkoutHref, firstItemFor, formatInr } from '../lib/plans.js';

export default function Pricing({ content }) {
  const levels = content.levels || [];
  const enabledLevels = content.enabled_levels || levels;
  const types = content.selection_types || [];
  const comingSoon = content.coming_soon_types || [];

  const [level, setLevel] = useState(content.default_level || enabledLevels[0]);
  const [type, setType] = useState(content.default_type || types.find((t) => !comingSoon.includes(t)));
  const [item, setItem] = useState(() => firstItemFor(content, level, type));

  const pricing = content.pricing_by_type?.[type];
  const plans = useMemo(() => (pricing ? buildPlans(type, item, pricing) : []), [type, item, pricing]);
  const options = type === 'Subject Wise' ? content.subjects?.[level] : type === 'Group Wise' ? content.groups?.[level] : null;

  const changeLevel = (next) => {
    setLevel(next);
    setItem(firstItemFor(content, next, type));
  };

  const changeType = (next) => {
    if (comingSoon.includes(next)) return;
    setType(next);
    setItem(firstItemFor(content, level, next));
  };

  return (
    <section className="bg-background py-14 sm:py-20 lg:py-28" id="pricing">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center sm:mb-10" data-aos="fade-up">
          <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">{content.heading}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{content.subheading}</p>
        </div>

        {/* CA level toggle */}
        <div className="mb-4 flex justify-center sm:mb-6">
          <div className="inline-flex max-w-full rounded-full bg-muted p-1">
            {levels.map((option) => {
              const disabled = !enabledLevels.includes(option);
              return (
                <button
                  type="button"
                  key={option}
                  onClick={() => changeLevel(option)}
                  disabled={disabled}
                  aria-pressed={level === option}
                  className={`relative min-h-[40px] rounded-full px-3.5 text-sm font-medium transition-all duration-300 sm:px-6 ${
                    disabled
                      ? 'cursor-not-allowed text-muted-foreground/40'
                      : level === option
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selection type toggle */}
        <div className="mb-4 flex justify-center sm:mb-6">
          {/* Wraps onto two rows on very narrow phones instead of running off-screen */}
          <div className="inline-flex max-w-full flex-wrap justify-center rounded-3xl bg-muted p-1 min-[380px]:flex-nowrap min-[380px]:rounded-full">
            {types.map((option) => {
              const soon = comingSoon.includes(option);
              return (
                <button
                  type="button"
                  key={option}
                  onClick={() => changeType(option)}
                  disabled={soon}
                  title={soon ? 'Coming soon' : undefined}
                  aria-pressed={type === option}
                  className={`relative flex min-h-[40px] items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-xs font-medium transition-all duration-300 min-[380px]:px-3 sm:gap-1.5 sm:px-5 sm:text-sm ${
                    soon
                      ? 'cursor-not-allowed text-muted-foreground/40'
                      : type === option
                        ? 'bg-accent text-accent-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <span>{option}</span>
                  {soon && (
                    <span className="rounded-full bg-muted-foreground/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subject / group selector */}
        {options && (
          <div className="mb-8 flex justify-center sm:mb-10">
            <div className="relative w-full max-w-[320px]">
              <select
                value={item}
                onChange={(e) => setItem(e.target.value)}
                aria-label={type === 'Subject Wise' ? 'Subject' : 'Group'}
                className="min-h-[44px] w-full appearance-none rounded-lg border-2 border-border bg-card px-4 py-2 pr-10 text-base text-foreground focus:border-accent focus:outline-none"
              >
                {options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Plans */}
        <div className="mx-auto grid max-w-md gap-6 lg:max-w-5xl lg:grid-cols-3 lg:items-stretch">
          {plans.map((plan, index) => (
            <div
              key={plan.key}
              className={`relative h-full overflow-hidden rounded-2xl border-2 bg-card transition-all duration-300 ${
                plan.popular ? 'z-10 border-accent shadow-elevated lg:scale-105' : 'border-border shadow-card'
              }`}
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              {plan.popular && (
                <div className="absolute -right-12 top-6 rotate-45 bg-accent px-12 py-1 text-[10px] font-bold text-accent-foreground">
                  MOST CHOSEN
                </div>
              )}

              <div className="flex h-full flex-col p-6 lg:p-8">
                {plan.popular && (
                  <div className="mb-4 flex items-center gap-2">
                    <svg className="h-4 w-4 fill-current text-accent" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                    </svg>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-accent">Most Popular</span>
                  </div>
                )}

                <h3 className="font-display text-xl font-bold text-primary">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.subtitle}</p>

                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-display text-4xl font-bold text-primary">{formatInr(plan.price)}</span>
                  <span className="text-xs text-muted-foreground">/one-time</span>
                </div>

                <ul className="mt-6 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/20">
                        <svg className="h-2.5 w-2.5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="text-sm text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href={checkoutHref({ level, type, item, plan: plan.key })}
                  className={`mt-8 block w-full rounded-xl px-6 py-3 text-center font-bold transition-all duration-300 ${
                    plan.popular
                      ? 'bg-accent text-accent-foreground hover:shadow-lg'
                      : 'border-2 border-accent bg-transparent text-accent hover:bg-accent/5'
                  }`}
                >
                  {plan.cta}
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground sm:mt-12">{content.footer_text}</p>
      </div>
    </section>
  );
}
