import { useEffect, useState } from 'react';
import VideoMedia from './VideoMedia.jsx';
import { hasVideo } from '../lib/video.js';

function TestimonialCard({ item, onPlay }) {
  const playable = hasVideo(item);
  const initial = (item.name || '').trim().charAt(0).toUpperCase();

  const interactiveProps = playable
    ? {
        role: 'button',
        tabIndex: 0,
        onClick: onPlay,
        onKeyDown: (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onPlay();
          }
        },
        'aria-label': `Play testimonial from ${item.name}`,
      }
    : {};

  return (
    <div className={`group relative overflow-hidden rounded-xl shadow-card ${playable ? 'cursor-pointer' : ''}`} {...interactiveProps}>
      {/*
        The card plays a silent looping preview; clicking it opens the modal, where the same video
        starts over with sound (that click is the gesture browsers require for audible autoplay).
      */}
      <div className="aspect-[3/4]">
        <VideoMedia
          video={item}
          part="preview"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          title={item.overlay}
          fallbackLetter={initial}
        />
      </div>
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-primary via-primary/50 to-transparent p-5 sm:p-6">
        <p className="font-display text-lg font-semibold text-primary-foreground sm:text-xl">&ldquo;{item.overlay}&rdquo;</p>
        <div className="mt-3 flex items-center justify-between">
          <div>
            <p className="font-medium text-primary-foreground">{item.name}</p>
            <p className="text-sm text-primary-foreground/70">{item.attempt}</p>
          </div>
          {playable && (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform group-hover:scale-110">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VideoTestimonials({ content }) {
  const items = content.items || [];
  const [activeIndex, setActiveIndex] = useState(null);
  const modalOpen = activeIndex !== null;

  useEffect(() => {
    if (!modalOpen) return undefined;
    const onKeyDown = (e) => e.key === 'Escape' && setActiveIndex(null);
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [modalOpen]);

  if (!items.length) return null;

  const modalClass =
    content.video_orientation === 'portrait'
      ? 'aspect-[9/16] h-auto max-h-[85svh] w-[min(100%,calc(85svh*9/16))]'
      : 'aspect-video w-full max-w-4xl';

  return (
    <section className="bg-secondary py-14 sm:py-20 lg:py-28" id="testimonials">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center sm:mb-12" data-aos="fade-up">
          <h2 className="font-display text-3xl font-bold text-primary md:text-4xl">{content.heading}</h2>
          <p className="mt-4 text-lg text-muted-foreground">{content.subheading}</p>
        </div>

        {/*
          Swipeable snap carousel on phones (the next card peeks in). From tablets up the cards wrap
          and centre, sized for 3 per row on tablets and 4 on laptops, so any count lays out evenly.
        */}
        <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:flex-wrap md:justify-center md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {items.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="flex-[0_0_78%] snap-start sm:flex-[0_0_45%] md:flex-[0_0_calc((100%-3rem)/3)] lg:flex-[0_0_calc((100%-4.5rem)/4)]"
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <TestimonialCard item={item} onPlay={() => setActiveIndex(index)} />
            </div>
          ))}
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex animate-fade-in items-center justify-center bg-primary/90 p-4"
          onClick={() => setActiveIndex(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Testimonial from ${items[activeIndex].name}`}
        >
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute right-2 top-2 z-10 flex h-12 w-12 items-center justify-center text-primary-foreground hover:opacity-70 sm:right-4 sm:top-4"
            aria-label="Close video"
          >
            <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className={modalClass} onClick={(e) => e.stopPropagation()}>
            <VideoMedia
              video={items[activeIndex]}
              part="player"
              className="h-full w-full rounded-lg shadow-2xl"
              title={items[activeIndex].overlay}
            />
          </div>
        </div>
      )}
    </section>
  );
}
