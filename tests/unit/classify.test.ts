import { describe, expect, it } from 'vitest';
import { isBlockedInstagram, isBlockedYouTube } from '../../src/shared/classify';
import { INSTAGRAM_CASES, YOUTUBE_CASES } from './urls';

describe('isBlockedYouTube', () => {
  it.each(YOUTUBE_CASES)('%s -> blocked=%s', (url, blocked) => {
    expect(isBlockedYouTube(new URL(url))).toBe(blocked);
  });
});

describe('isBlockedInstagram', () => {
  it.each(INSTAGRAM_CASES)('%s -> blocked=%s', (url, blocked) => {
    expect(isBlockedInstagram(new URL(url))).toBe(blocked);
  });

  it('only classifies its own platform', () => {
    expect(isBlockedInstagram(new URL('https://www.youtube.com/shorts/x'))).toBe(false);
    expect(isBlockedYouTube(new URL('https://www.instagram.com/reel/x/'))).toBe(false);
  });
});
