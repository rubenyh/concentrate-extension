// Block page logic. The only input is the ?from= host, which is matched against an allowlist.

const HOMES: Record<string, { name: string; url: string }> = {
  'www.youtube.com': { name: 'YouTube', url: 'https://www.youtube.com/' },
  'm.youtube.com': { name: 'YouTube', url: 'https://www.youtube.com/' },
  'youtube.com': { name: 'YouTube', url: 'https://www.youtube.com/' },
  'www.instagram.com': { name: 'Instagram', url: 'https://www.instagram.com/' },
};

const from = new URLSearchParams(location.search).get('from') ?? '';
const home = Object.hasOwn(HOMES, from) ? HOMES[from] : undefined;
const homeLink = document.getElementById('home') as HTMLAnchorElement;
const backButton = document.getElementById('back') as HTMLButtonElement;

if (home) {
  homeLink.href = home.url;
  homeLink.textContent = `Open ${home.name} home`;
} else {
  homeLink.hidden = true;
}

backButton.addEventListener('click', () => {
  // A blocked page opened in a fresh tab has nothing to go back to.
  if (history.length > 1) history.back();
  else if (home) location.assign(home.url);
});
