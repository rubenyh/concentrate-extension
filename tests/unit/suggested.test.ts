// @vitest-environment jsdom
// Lifecycle of the Instagram suggested-post tagger: no scan may run after it is stopped, whether
// stop comes from the "Only show accounts I follow" toggle or from leaving the home route, and it
// must restart cleanly. Animation frames are queued by hand so a scan can be caught "in flight".
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_SETTINGS, type Settings } from '../../src/shared/settings';
import { SUGGESTED_ATTR, startSuggestedTagger } from '../../src/content/suggested';

const frames = new Map<number, FrameRequestCallback>();
let nextFrame = 1;
const flushFrames = (): void => {
  const callbacks = [...frames.values()];
  frames.clear();
  for (const callback of callbacks) callback(0);
};
/** Lets MutationObserver callbacks (microtasks) and promise callbacks run. */
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

const addPost = (id: string, button: string): HTMLElement => {
  const article = document.createElement('article');
  article.id = id;
  const div = document.createElement('div');
  div.setAttribute('role', 'button');
  div.textContent = button;
  article.append(div);
  document.body.append(article);
  return article;
};
const tagged = (): string[] =>
  [...document.querySelectorAll(`article[${SUGGESTED_ATTR}]`)].map((a) => a.id);

beforeEach(() => {
  frames.clear();
  document.body.replaceChildren();
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    frames.set(nextFrame, callback);
    return nextFrame++;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => frames.delete(id));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.doUnmock('../../src/shared/settings');
  vi.doUnmock('../../src/shared/guard');
  vi.resetModules();
});

describe('startSuggestedTagger', () => {
  it('tags late posts on the next frame', async () => {
    const stop = startSuggestedTagger();
    addPost('late', 'Follow');
    await settle();
    expect(tagged()).toEqual([]);
    flushFrames();
    expect(tagged()).toEqual(['late']);
    stop();
  });

  it('cancels a scan that was scheduled before stop', async () => {
    const stop = startSuggestedTagger();
    addPost('late', 'Follow');
    await settle();
    expect(frames.size).toBe(1); // scan pending
    stop();
    expect(frames.size).toBe(0);
    flushFrames();
    expect(tagged()).toEqual([]);
    addPost('later', 'Follow'); // observer is gone: nothing is scheduled
    await settle();
    expect(frames.size).toBe(0);
  });

  it('removes its tags on stop and tags again after a restart', async () => {
    addPost('a', 'Follow');
    addPost('b', 'Following');
    const stop = startSuggestedTagger();
    expect(tagged()).toEqual(['a']);
    stop();
    expect(tagged()).toEqual([]);
    const restart = startSuggestedTagger();
    expect(tagged()).toEqual(['a']);
    addPost('c', 'Follow');
    await settle();
    flushFrames();
    expect(tagged()).toEqual(['a', 'c']);
    restart();
  });
});

describe('instagram content script', () => {
  let current: Settings;
  let notify: (settings: Settings) => void = () => undefined;
  let navigation: EventTarget;

  const setSettings = async (next: Partial<Settings>): Promise<void> => {
    current = { ...current, ...next };
    notify(current);
    await settle();
  };
  const navigate = async (path: string): Promise<void> => {
    history.pushState(null, '', path);
    navigation.dispatchEvent(new Event('currententrychange'));
    await settle();
  };

  beforeEach(async () => {
    current = { ...DEFAULT_SETTINGS };
    navigation = new EventTarget();
    vi.stubGlobal('navigation', navigation);
    vi.doMock('../../src/shared/guard', () => ({ startGuard: () => undefined }));
    vi.doMock('../../src/shared/settings', async (importOriginal) => ({
      ...(await importOriginal<typeof import('../../src/shared/settings')>()),
      loadSettings: () => Promise.resolve(current),
      onSettingsChanged: (callback: (settings: Settings) => void) => {
        notify = callback;
      },
    }));
    history.replaceState(null, '', '/');
    addPost('s1', 'Follow');
    await import('../../src/content/instagram');
    await settle();
  });

  // Each test imports a fresh module instance; stop its tagger so its observer cannot leak.
  afterEach(() => setSettings({ igFollowedOnly: false }));

  it('tags on the home route with "Only show accounts I follow" on', () => {
    expect(tagged()).toEqual(['s1']);
  });

  it('stops tagging, including a pending scan, when the toggle is turned off', async () => {
    addPost('s2', 'Follow');
    await settle();
    expect(frames.size).toBe(1);
    await setSettings({ igFollowedOnly: false });
    expect(frames.size).toBe(0);
    flushFrames();
    expect(tagged()).toEqual([]);
  });

  it('stops tagging, including a pending scan, when leaving the home route', async () => {
    addPost('s2', 'Follow');
    await settle();
    await navigate('/explore/');
    flushFrames();
    expect(tagged()).toEqual([]);
    expect(document.documentElement.hasAttribute('data-rsb-home')).toBe(false);
    addPost('s3', 'Follow');
    await settle();
    expect(frames.size).toBe(0);
  });

  it('restarts the observer after returning home', async () => {
    await navigate('/explore/');
    await navigate('/');
    expect(tagged()).toEqual(['s1']);
    addPost('s2', 'Follow');
    await settle();
    flushFrames();
    expect(tagged()).toEqual(['s1', 's2']);
  });

  it('keeps one observer and no stray scans when the toggle flips rapidly', async () => {
    for (let i = 0; i < 5; i++) {
      addPost(`x${i}`, 'Follow');
      await setSettings({ igFollowedOnly: false });
      await setSettings({ igFollowedOnly: true });
    }
    await setSettings({ igFollowedOnly: false });
    flushFrames();
    expect(tagged()).toEqual([]);

    await setSettings({ igFollowedOnly: true });
    addPost('last', 'Follow');
    await settle();
    expect(frames.size).toBe(1); // a second live observer would schedule a second frame
    flushFrames();
    expect(tagged()).toEqual(['s1', 'x0', 'x1', 'x2', 'x3', 'x4', 'last']);
  });
});
