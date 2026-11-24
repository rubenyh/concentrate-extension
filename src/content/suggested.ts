// Tags Instagram feed posts from accounts the user does not follow, for the "followed only" toggle.
// The only reliable signal (live check 2026-11-21: 14/14 suggested, 0/16 followed) is an in-post
// "Follow" button, which CSS cannot match by text. A MutationObserver therefore marks such
// articles with data-rsb-suggested, and static/instagram.css hides them (DECISIONS.md ADR-011).
// ponytail: English UI only; add localized labels here if users need other languages.

const FOLLOW_LABELS = new Set(['Follow']);
export const SUGGESTED_ATTR = 'data-rsb-suggested';

export function isSuggested(article: Element): boolean {
  for (const button of article.querySelectorAll('[role="button"]')) {
    // textContent, not innerText: Instagram keeps rotated-out labels in the DOM, hidden.
    if (FOLLOW_LABELS.has(button.textContent?.trim() ?? '')) return true;
  }
  return false;
}

export function tagSuggested(root: ParentNode): void {
  for (const article of root.querySelectorAll('article')) {
    article.toggleAttribute(SUGGESTED_ATTR, isSuggested(article));
  }
}

/**
 * Starts tagging; returns a stop function that disconnects the observer, cancels a scan still
 * waiting for its animation frame, and removes the tags. Nothing runs after stop returns.
 */
export function startSuggestedTagger(): () => void {
  let frame = 0; // pending requestAnimationFrame id; 0 when no scan is scheduled (ids are > 0)
  const scan = (): void => {
    frame = 0;
    tagSuggested(document);
  };
  // One rescan per frame is cheap: about 1 ms for 48 feed articles (live check 2026-11-21).
  // ponytail: rescans every article; track unchanged articles if feeds grow into the hundreds.
  // Attribute writes do not retrigger the observer: it watches childList/characterData only.
  const observer = new MutationObserver(() => {
    if (frame) return;
    frame = requestAnimationFrame(scan);
  });
  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
    characterData: true,
  });
  scan();
  return () => {
    observer.disconnect();
    // A scan already scheduled would otherwise re-tag the feed after the toggle went off or the
    // user left the home route.
    cancelAnimationFrame(frame);
    frame = 0;
    for (const article of document.querySelectorAll(`article[${SUGGESTED_ATTR}]`)) {
      article.removeAttribute(SUGGESTED_ATTR);
    }
  };
}
