// Checks every hide selector in static/*.css against hand-trimmed fixtures:
// Shorts/Reels surfaces must match; regular content must not match, nor sit inside a match.
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';
import { describe, expect, it } from 'vitest';

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
  ['youtube', '../../static/youtube.css', '../fixtures/youtube.html'],
  ['instagram', '../../static/instagram.css', '../fixtures/instagram.html'],
])('%s selectors', (_site, cssPath, fixturePath) => {
  const selectors = selectorsOf(read(cssPath));
  const { document } = new JSDOM(read(fixturePath)).window;
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
