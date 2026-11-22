// Loads the built extension (dist/) into Playwright's bundled Chromium and serves the markup
// fixtures on the real YouTube/Instagram hostnames, so no live site is contacted.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { test as base, chromium, expect, type BrowserContext, type Page } from '@playwright/test';

const dist = fileURLToPath(new URL('../../dist', import.meta.url));
const fixture = (name: string): string =>
  readFileSync(new URL(`../fixtures/${name}.html`, import.meta.url), 'utf8');

const test = base.extend<{ context: BrowserContext; page: Page }>({
  // eslint-disable-next-line no-empty-pattern -- Playwright fixtures require object destructuring
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      channel: 'chromium',
      args: [`--disable-extensions-except=${dist}`, `--load-extension=${dist}`],
    });
    const youtube = fixture('youtube');
    const instagram = fixture('instagram');
    await context.route('https://www.youtube.com/**', (route) =>
      route.fulfill({ contentType: 'text/html', body: youtube }),
    );
    await context.route('https://www.instagram.com/**', (route) =>
      route.fulfill({ contentType: 'text/html', body: instagram }),
    );
    await use(context);
    await context.close();
  },
  page: async ({ context }, use) => {
    await use(context.pages()[0] ?? (await context.newPage()));
  },
});

const BLOCKED_PAGE =
  /^chrome-extension:\/\/[^/]+\/blocked\.html\?from=www\.(youtube|instagram)\.com$/;

/** Adds a visible link plus a main-world SPA router that handles clicks with pushState, like the real sites. */
async function addSpaLink(page: Page, href: string): Promise<void> {
  await page.evaluate((target) => {
    const link = Object.assign(document.createElement('a'), {
      id: 'spa-link',
      href: target,
      textContent: 'SPA link',
    });
    document.body.prepend(link);
    document.addEventListener('click', (event) => {
      const a = (event.target as Element).closest('a');
      if (!a) return;
      event.preventDefault();
      history.pushState({}, '', a.href);
    });
  }, href);
}

async function expectSurfacesFiltered(page: Page): Promise<void> {
  const result = await page.evaluate(() => {
    const visible = (el: Element): boolean => el.checkVisibility();
    return {
      shownButShouldHide: [...document.querySelectorAll('[data-expect="hidden"]')]
        .filter(visible)
        .map((el) => el.outerHTML.slice(0, 80)),
      hiddenButShouldShow: [...document.querySelectorAll('[data-expect="visible"]')]
        .filter((el) => !visible(el))
        .map((el) => el.outerHTML.slice(0, 80)),
    };
  });
  expect(result).toEqual({ shownButShouldHide: [], hiddenButShouldShow: [] });
}

test.describe('YouTube', () => {
  for (const path of ['/shorts/abc123', '/shorts/abc123?feature=share', '/@creator/shorts']) {
    test(`direct load of ${path} is redirected to the block page`, async ({ page }) => {
      await page.goto(`https://www.youtube.com${path}`);
      await expect(page).toHaveURL(BLOCKED_PAGE);
      await expect(page.getByRole('heading', { name: 'Short-form video blocked' })).toBeVisible();
    });
  }

  test('regular pages load and Shorts surfaces are hidden', async ({ page }) => {
    await page.goto('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await expect(page).toHaveURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
    await expectSurfacesFiltered(page);
  });

  test('SPA pushState to a Short is blocked and Back returns to the previous page', async ({
    page,
  }) => {
    await page.goto('https://www.youtube.com/');
    await page.goto('https://www.youtube.com/watch?v=one');
    await page.evaluate(() => history.pushState({}, '', '/shorts/spa'));
    await expect(page).toHaveURL(BLOCKED_PAGE);
    await page.goBack();
    await expect(page).toHaveURL('https://www.youtube.com/watch?v=one');
    await page.goForward();
    await expect(page).toHaveURL(BLOCKED_PAGE);
  });

  test('clicking a Shorts link is intercepted before the site router', async ({ page }) => {
    await page.goto('https://www.youtube.com/');
    await addSpaLink(page, '/shorts/clicked');
    await page.click('#spa-link');
    await expect(page).toHaveURL(BLOCKED_PAGE);
    await page.getByRole('button', { name: 'Go back' }).click();
    await expect(page).toHaveURL('https://www.youtube.com/');
  });

  test('clicking a regular link is left to the site router', async ({ page }) => {
    await page.goto('https://www.youtube.com/');
    await addSpaLink(page, '/watch?v=regular');
    await page.click('#spa-link');
    await expect(page).toHaveURL('https://www.youtube.com/watch?v=regular');
  });
});

test.describe('Instagram', () => {
  for (const path of ['/reel/C0abc/', '/reels/', '/someuser/reels/']) {
    test(`direct load of ${path} is redirected to the block page`, async ({ page }) => {
      await page.goto(`https://www.instagram.com${path}`);
      await expect(page).toHaveURL(BLOCKED_PAGE);
    });
  }

  test('posts, profiles, stories and messages stay reachable', async ({ page }) => {
    for (const path of ['/p/C0postId/', '/someuser/', '/stories/someuser/123/', '/direct/inbox/']) {
      await page.goto(`https://www.instagram.com${path}`);
      await expect(page).toHaveURL(`https://www.instagram.com${path}`);
    }
    await expectSurfacesFiltered(page);
  });

  test('SPA navigation to a Reel is blocked', async ({ page }) => {
    await page.goto('https://www.instagram.com/');
    await addSpaLink(page, '/reel/C0spa/');
    // The link itself is hidden by instagram.css; dispatch the click as keyboard activation would.
    await page.locator('#spa-link').dispatchEvent('click');
    await expect(page).toHaveURL(BLOCKED_PAGE);
  });

  test('SPA pushState to the Reels tab is blocked', async ({ page }) => {
    await page.goto('https://www.instagram.com/someuser/');
    await page.evaluate(() => history.pushState({}, '', '/someuser/reels/'));
    await expect(page).toHaveURL(BLOCKED_PAGE);
    await page.goBack();
    await expect(page).toHaveURL('https://www.instagram.com/someuser/');
  });
});

test('a blocked page opened in a fresh tab offers the home page', async ({ context }) => {
  const page = await context.newPage();
  await page.goto('https://www.instagram.com/reel/fresh/');
  await expect(page).toHaveURL(BLOCKED_PAGE);
  await expect(page.getByRole('link', { name: 'Open Instagram home' })).toHaveAttribute(
    'href',
    'https://www.instagram.com/',
  );
});

test('popup toggles update Instagram home-feed filters live', async ({ context, page }) => {
  await page.goto('https://www.instagram.com/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-rsb-home', '');
  await expect(html).toHaveAttribute('data-rsb-hide-feed-reels', '');
  await expect(html).toHaveAttribute('data-rsb-followed-only', '');

  // The extension id is the host of the block page a blocked route redirects to.
  const probe = await context.newPage();
  await probe.goto('https://www.instagram.com/reels/');
  const extensionId = new URL(probe.url()).host;
  await probe.goto(`chrome-extension://${extensionId}/popup.html`);

  const hideReels = probe.getByLabel('Hide reels');
  await expect(hideReels).toBeChecked();
  await hideReels.uncheck();
  await expect(html).not.toHaveAttribute('data-rsb-hide-feed-reels', '');
  await expect(html).toHaveAttribute('data-rsb-followed-only', '');

  await probe.reload();
  await expect(probe.getByLabel('Hide reels')).not.toBeChecked();
  await expect(probe.getByLabel('Only show accounts I follow')).toBeChecked();

  await page.evaluate(() => history.pushState({}, '', '/someuser/'));
  await expect(html).not.toHaveAttribute('data-rsb-home', '');
});
