// Keeps static/rules.json (full page loads) in agreement with src/shared/classify.ts (SPA routes).
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { INSTAGRAM_CASES, YOUTUBE_CASES } from './urls';

interface Rule {
  id: number;
  priority: number;
  action: { type: 'redirect' | 'allow'; redirect?: { extensionPath: string } };
  condition: { regexFilter: string; resourceTypes: string[] };
}

const rules = JSON.parse(
  readFileSync(new URL('../../static/rules.json', import.meta.url), 'utf8'),
) as Rule[];

/** Mirrors DNR matching: the highest-priority matching rule wins; regexFilter is case-insensitive by default. */
function dnrRedirects(url: string): boolean {
  const winner = rules
    .filter((r) => new RegExp(r.condition.regexFilter, 'i').test(url))
    .sort((a, b) => b.priority - a.priority)[0];
  return winner?.action.type === 'redirect';
}

describe('static/rules.json', () => {
  it('has unique ids and only redirects main_frame requests to the block page', () => {
    expect(new Set(rules.map((r) => r.id)).size).toBe(rules.length);
    for (const rule of rules) {
      expect(rule.condition.resourceTypes).toEqual(['main_frame']);
      if (rule.action.type === 'redirect') {
        expect(rule.action.redirect?.extensionPath).toMatch(/^\/blocked\.html\?from=www\./);
      }
    }
  });

  it.each([...YOUTUBE_CASES, ...INSTAGRAM_CASES])('%s -> redirect=%s', (url, blocked) => {
    expect(dnrRedirects(url)).toBe(blocked);
  });
});
