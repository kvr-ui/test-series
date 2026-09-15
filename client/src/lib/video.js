/*
 * Single source of truth for turning a pasted video URL into something playable.
 *
 * Understands:
 * - Bunny Stream embed link      https://iframe.mediadelivery.net/embed/LIB/GUID
 * - Bunny Stream share link      https://iframe.mediadelivery.net/play/LIB/GUID  (rewritten to /embed/)
 * - Bunny HLS playlist           https://vz-xxxx.b-cdn.net/GUID/playlist.m3u8    (<video> + hls.js)
 * - Any other direct file        https://xxxx.b-cdn.net/clip.mp4                 (<video>)
 * - No URL but a YouTube ID      YouTube iframe (legacy fallback)
 */

export const hasVideo = (video) => Boolean(video?.video_url?.trim() || video?.video_id?.trim());

/**
 * @param {{ video_url?: string, video_id?: string, thumbnail?: string }} video
 * @param {{ muted?: boolean, loop?: boolean, controls?: boolean }} options
 * @returns {{ kind: 'iframe'|'youtube'|'hls'|'file'|null, src: string, poster: string, badUrl: boolean }}
 */
export function resolveVideo(video = {}, { muted = false, loop = false, controls = true } = {}) {
  const url = (video.video_url || '').trim();
  const videoId = (video.video_id || '').trim();
  const result = { kind: null, src: '', poster: video.thumbnail || '', badUrl: false };

  if (url) {
    const urlNoQuery = url.split('?')[0];
    const check = urlNoQuery.toLowerCase();

    // A dashboard URL rather than a playable one
    if (check.includes('dash.bunny.net')) {
      result.badUrl = true;
      return result;
    }

    if (check.includes('mediadelivery.net') || check.includes('bunnycdn.com/play')) {
      const embedUrl = url.replace('/play/', '/embed/');
      const params = new URLSearchParams({ autoplay: 'true', preload: 'true' });
      if (muted) params.set('muted', 'true');
      if (loop) params.set('loop', 'true');
      if (!controls) params.set('controls', 'false');

      result.kind = 'iframe';
      result.src = `${embedUrl}${embedUrl.includes('?') ? '&' : '?'}${params}`;
      return result;
    }

    result.kind = check.includes('.m3u8') ? 'hls' : 'file';
    result.src = url;

    // Bunny Stream serves thumbnail.jpg alongside the playable file in the same folder
    if (!result.poster && check.includes('b-cdn.net')) {
      const fileName = urlNoQuery.split('/').pop();
      result.poster = urlNoQuery.slice(0, urlNoQuery.length - fileName.length) + 'thumbnail.jpg';
    }
    return result;
  }

  if (videoId) {
    const params = new URLSearchParams({ autoplay: '1', playsinline: '1', rel: '0' });
    if (muted) params.set('mute', '1');
    if (loop) {
      // YouTube only loops a single video when it is also the whole playlist
      params.set('loop', '1');
      params.set('playlist', videoId);
    }
    if (!controls) {
      params.set('controls', '0');
      params.set('modestbranding', '1');
    }

    result.kind = 'youtube';
    result.src = `https://www.youtube.com/embed/${encodeURIComponent(videoId)}?${params}`;
    if (!result.poster) result.poster = `https://img.youtube.com/vi/${encodeURIComponent(videoId)}/maxresdefault.jpg`;
  }

  return result;
}
