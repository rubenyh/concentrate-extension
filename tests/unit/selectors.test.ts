// Checks every hide selector in static/*.css against hand-trimmed fixtures:
// Shorts/Reels surfaces must match; regular content must not match, nor sit inside a match.
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';
import { tagSuggested } from '../../src/content/suggested';

const FEED_TOGGLES = ['data-rsb-home', 'data-rsb-hide-feed-reels', 'data-rsb-followed-only'];

/** Puts the Instagram fixture into the state the content script creates on / with both toggles on. */
function prepareInstagram(document: Document): void {
  for (const attr of FEED_TOGGLES) document.documentElement.setAttribute(attr, '');
  tagSuggested(document);
}

const read = (path: string): string => readFileSync(new URL(path, import.meta.url), 'utf8');

/** Splits a stylesheet's rule preludes into individual selectors, keeping commas inside :has(). */
function selectorsOf(css: string): string[] {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const preludes = [...withoutComments.matchAll(/([^{}]+)\{[^}]*\}/g)].map((m) => m[1] ?? '');
  return preludes.flatMap((prelude) => {
    const out: string[] = [];
    let depth = 0;
    let current = '';
    for (const ch of prelude) {
      if (ch === '(') depth++;
      if (ch === ')') depth--;
      if (ch === ',' && depth === 0) {
        out.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    out.push(current.trim());
    return out.filter(Boolean);
  });
}

describe.each([
  ['youtube', '../../static/youtube.css', '../fixtures/youtube.html', undefined],
  ['instagram', '../../static/instagram.css', '../fixtures/instagram.html', prepareInstagram],
])('%s selectors', (_site, cssPath, fixturePath, prepare) => {
  const selectors = selectorsOf(read(cssPath));
  const { document } = new JSDOM(read(fixturePath)).window;
  prepare?.(document);
  const matchesAny = (el: Element): boolean => selectors.some((s) => el.matches(s));
  const label = (el: Element): string => `${el.outerHTML.split('>')[0] ?? ''}>`;

  it('hides every Shorts/Reels surface', () => {
    const hidden = [...document.querySelectorAll('[data-expect="hidden"]')];
    expect(hidden.length).toBeGreaterThan(0);
    for (const el of hidden) expect(matchesAny(el), label(el)).toBe(true);
  });

  it('keeps regular content visible', () => {
    for (const el of document.querySelectorAll('[data-expect="visible"]')) {
      for (let node: Element | null = el; node; node = node.parentElement) {
        expect(matchesAny(node), `${label(el)} via ${label(node)}`).toBe(false);
      }
    }
  });

  it.each(selectors)('has a positive fixture for %s', (selector) => {
    expect(document.querySelector(`[data-expect="hidden"]:is(${selector})`)).not.toBeNull();
  });
});

describe('instagram home-feed toggles', () => {
  const selectors = selectorsOf(read('../../static/instagram.css'));
  const hiddenFeedTypes = (attrs: string[]): string[] => {
    const { document } = new JSDOM(read('../fixtures/instagram.html')).window;
    for (const attr of attrs) document.documentElement.setAttribute(attr, '');
    tagSuggested(document);
    return [...document.querySelectorAll('article')]
      .filter((a) => selectors.some((s) => a.matches(s)))
      .map((a) => a.getAttribute('data-feed') ?? '');
  };

  it('hides only reels with "Hide reels" alone', () => {
    expect(hiddenFeedTypes(['data-rsb-home', 'data-rsb-hide-feed-reels'])).toEqual([
      'followed-reel',
      'suggested-reel',
    ]);
  });

  it('hides only non-followed posts and ads with "Only accounts I follow" alone', () => {
    expect(hiddenFeedTypes(['data-rsb-home', 'data-rsb-followed-only'])).toEqual([
      'suggested-reel',
      'suggested-photo',
      'ad',
    ]);
  });

  it('hides nothing in the feed when both toggles are off, or off the home route', () => {
    expect(hiddenFeedTypes(['data-rsb-home'])).toEqual([]);
    expect(hiddenFeedTypes(['data-rsb-hide-feed-reels', 'data-rsb-followed-only'])).toEqual([]);
  });
});
