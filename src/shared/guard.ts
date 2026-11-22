// Route guard for SPA navigation. Full page loads are already redirected by DNR (static/rules.json);
// this covers client-side routing (history.pushState), back/forward, and in-page link clicks.

function blockedPageUrl(): string {
  return `${chrome.runtime.getURL('blocked.html')}?from=${encodeURIComponent(location.hostname)}`;
}

export function startGuard(isBlocked: (url: URL) => boolean): void {
  // The current history entry already points at a blocked route: replace it so Back does not loop.
  const checkCurrentRoute = (): void => {
    if (isBlocked(new URL(location.href))) location.replace(blockedPageUrl());
  };

  checkCurrentRoute();
  // Navigation API fires for pushState/replaceState and back/forward traversals alike.
  navigation.addEventListener('currententrychange', checkCurrentRoute);

  // Intercept plain left clicks before the site's own router sees them (capture phase on window).
  // Modified clicks open new tabs, which are full loads handled by DNR.
  window.addEventListener(
    'click',
    (event) => {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
        return;
      }
      const link = event
        .composedPath()
        .find(
          (node): node is HTMLAnchorElement => node instanceof HTMLAnchorElement && !!node.href,
        );
      if (!link || !isBlocked(new URL(link.href))) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      // assign, not replace: the page the user clicked from stays in history.
      location.assign(blockedPageUrl());
    },
    true,
  );
}
