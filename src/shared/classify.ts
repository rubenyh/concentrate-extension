// URL classification: the single source of truth for which routes are blocked.
// static/rules.json mirrors these rules for full page loads; tests/unit/rules.test.ts keeps them in sync.

const YOUTUBE_HOSTS = new Set(['www.youtube.com', 'm.youtube.com', 'youtube.com']);
const INSTAGRAM_HOSTS = new Set(['www.instagram.com']);
const YOUTUBE_CHANNEL_PREFIXES = new Set(['channel', 'c', 'user']);
const REEL_SEGMENTS = new Set(['reel', 'reels']);

function segments(url: URL): string[] {
  return url.pathname
    .split('/')
    .filter(Boolean)
    .map((s) => s.toLowerCase());
}

/** /shorts, /shorts/{id}, and channel Shorts tabs (/@handle/shorts, /channel|c|user/{id}/shorts). */
export function isBlockedYouTube(url: URL): boolean {
  if (!YOUTUBE_HOSTS.has(url.hostname)) return false;
  const [first = '', second, third] = segments(url);
  if (first === 'shorts') return true;
  if (first.startsWith('@')) return second === 'shorts';
  return YOUTUBE_CHANNEL_PREFIXES.has(first) && third === 'shorts';
}

/** /reel/{id}, /reels/..., and profile routes /{user}/reels/ and /{user}/reel/{id}. */
export function isBlockedInstagram(url: URL): boolean {
  if (!INSTAGRAM_HOSTS.has(url.hostname)) return false;
  const [first = '', second = ''] = segments(url);
  if (REEL_SEGMENTS.has(first)) return true;
  // /stories/{user}/{id}: a user literally named "reels" must not be blocked.
  return first !== 'stories' && REEL_SEGMENTS.has(second);
}
