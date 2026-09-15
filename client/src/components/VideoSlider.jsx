import { useState } from 'react';
import VideoMedia from './VideoMedia.jsx';
import { hasVideo } from '../lib/video.js';

const ChevronIcon = ({ d }) => (
  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={d} />
  </svg>
);

export default function VideoSlider({ content }) {
  const videos = content.videos || [];
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!videos.length) return null;

  const current = videos[currentIndex];
  const prev = () => setCurrentIndex((i) => (i === 0 ? videos.length - 1 : i - 1));
  const next = () => setCurrentIndex((i) => (i === videos.length - 1 ? 0 : i + 1));

  return (
    <section className="bg-primary py-14 sm:py-20 lg:py-28" id="video-reviews">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center sm:mb-12" data-aos="fade-up">
          <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">{content.heading}</h2>
          <p className="mt-4 text-lg text-primary-foreground/70">{content.subheading}</p>
        </div>

        <div className="relative mx-auto max-w-4xl">
          <div className="relative aspect-video overflow-hidden rounded-xl bg-black shadow-elevated">
            {/*
              Only the visible slide mounts a player, so one video loads at a time and the
              previous one is torn down. Muted because browsers block autoplay with sound —
              the player's own controls let the visitor turn it on.
            */}
            <div key={currentIndex} className="absolute inset-0 h-full w-full animate-slide-in">
              <VideoMedia
                video={current}
                part={hasVideo(current) ? 'player' : 'poster'}
                muted
                className={hasVideo(current) ? 'h-full w-full' : 'h-full w-full object-cover'}
                title={current.caption}
                fallbackLetter={String(currentIndex + 1)}
              />
            </div>
          </div>

          <p className="mt-5 text-center text-base font-medium text-primary-foreground sm:mt-6 sm:text-lg">{current.caption}</p>

          <div className="mt-6 flex items-center justify-center gap-3 sm:mt-8 sm:gap-4">
            <button
              type="button"
              onClick={prev}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              aria-label="Previous video"
            >
              <ChevronIcon d="M15 19l-7-7 7-7" />
            </button>

            <div className="flex">
              {videos.map((video, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className="group flex h-11 items-center px-1.5"
                  aria-label={`Go to video ${index + 1}`}
                  aria-current={index === currentIndex}
                >
                  <span
                    className={`block h-2 rounded-full transition-all ${
                      index === currentIndex ? 'w-6 bg-accent' : 'w-2 bg-primary-foreground/30 group-hover:bg-primary-foreground/50'
                    }`}
                  />
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={next}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10"
              aria-label="Next video"
            >
              <ChevronIcon d="M9 5l7 7-7 7" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
