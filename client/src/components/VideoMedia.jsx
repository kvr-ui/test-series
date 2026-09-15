import { useEffect, useRef } from 'react';
import { resolveVideo } from '../lib/video.js';

/*
 * Plays a <video> for an HLS playlist or a direct file. hls.js is only downloaded when the
 * browser can't play HLS natively (Safari can), and nothing loads until the element is near
 * the viewport, so autoplaying cards further down the page don't pull segments early.
 */
function NativeVideo({ kind, src, poster, muted, loop, controls, preview, className }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    // React doesn't reflect `muted` as an attribute; set it before loading so autoplay is allowed
    el.muted = muted;
    el.defaultMuted = muted;

    let hls;
    let cancelled = false;

    const load = async () => {
      if (kind === 'file' || el.canPlayType('application/vnd.apple.mpegurl')) {
        el.src = src;
        return;
      }
      const { default: Hls } = await import('hls.js/light');
      if (cancelled) return;
      if (!Hls.isSupported()) {
        el.src = src;
        return;
      }
      hls = new Hls();
      hls.loadSource(src);
      hls.attachMedia(el);
    };

    let observer;
    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver(
        (entries) => {
          if (!entries[0].isIntersecting) return;
          observer.disconnect();
          load();
        },
        { rootMargin: '200px' },
      );
      observer.observe(el);
    } else {
      load();
    }

    return () => {
      cancelled = true;
      observer?.disconnect();
      hls?.destroy();
    };
  }, [kind, src, muted]);

  return (
    <video
      ref={ref}
      controls={controls}
      autoPlay
      muted={muted}
      loop={loop}
      playsInline
      preload="metadata"
      poster={poster || undefined}
      className={`bg-black ${preview ? 'pointer-events-none object-cover' : 'object-contain'} ${className}`}
    />
  );
}

/**
 * part:
 *   player  — full player, autoplays; pass `muted` when nothing gated it behind a click,
 *             because browsers only allow autoplay with sound after a user gesture
 *   preview — silent looping in-page player with no controls, used instead of a still poster
 *   poster  — still image (thumbnail, Bunny/YouTube poster, or a lettered placeholder)
 */
export default function VideoMedia({ video, part = 'poster', muted = false, className = '', title = 'Video', fallbackLetter = '' }) {
  const preview = part === 'preview';
  const options = preview ? { muted: true, loop: true, controls: false } : { muted, loop: false, controls: true };
  const { kind, src, poster, badUrl } = resolveVideo(video, options);

  // Nothing playable to preview — fall back to the still image
  const effectivePart = preview && !kind ? 'poster' : part;

  if (effectivePart === 'player' || effectivePart === 'preview') {
    if (kind === 'iframe' || kind === 'youtube') {
      return (
        <iframe
          src={src}
          title={title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className={`${preview ? 'pointer-events-none ' : ''}${className}`}
        />
      );
    }

    if (kind === 'hls' || kind === 'file') {
      return (
        <NativeVideo
          kind={kind}
          src={src}
          poster={poster}
          muted={options.muted}
          loop={options.loop}
          controls={options.controls}
          preview={preview}
          className={className}
        />
      );
    }

    return (
      <div className={`flex items-center justify-center bg-black p-6 text-center text-sm text-primary-foreground/70 ${className}`}>
        {badUrl
          ? "That's a Bunny dashboard link, which can't be played. In Bunny Stream open the video, click Embed / Share, then copy the iframe URL or the HLS playlist link."
          : "This video URL can't be played. Paste a Bunny Stream embed link, an HLS playlist or a direct file URL."}
      </div>
    );
  }

  if (poster) {
    return <img src={poster} alt={title} loading="lazy" className={className} />;
  }

  return (
    <div className={`flex items-center justify-center bg-gradient-to-br from-primary to-primary/60 ${className}`}>
      <span className="font-display text-6xl font-bold text-primary-foreground/30">{fallbackLetter}</span>
    </div>
  );
}
