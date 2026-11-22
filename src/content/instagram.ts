import { isBlockedInstagram } from '../shared/classify';
import { startGuard } from '../shared/guard';
import {
  DEFAULT_SETTINGS,
  loadSettings,
  onSettingsChanged,
  type Settings,
} from '../shared/settings';
import { startSuggestedTagger } from './suggested';

startGuard(isBlockedInstagram);

// Home-feed filters live in static/instagram.css, gated by attributes on <html>:
// data-rsb-home marks the home route; the others mirror the user's toggles. Only the
// "followed only" toggle needs JS, to tag suggested posts (see ./suggested.ts), and that
// tagger runs only on the home route.
const root = document.documentElement;
let settings = DEFAULT_SETTINGS;
let stopSuggestedTagger: (() => void) | undefined;

const update = (): void => {
  const home = location.pathname === '/';
  root.toggleAttribute('data-rsb-home', home);
  root.toggleAttribute('data-rsb-hide-feed-reels', settings.igHideFeedReels);
  root.toggleAttribute('data-rsb-followed-only', settings.igFollowedOnly);
  if (home && settings.igFollowedOnly) {
    stopSuggestedTagger ??= startSuggestedTagger();
  } else {
    stopSuggestedTagger?.();
    stopSuggestedTagger = undefined;
  }
};

const applySettings = (next: Settings): void => {
  settings = next;
  update();
};

update(); // defaults first: no flash of an unfiltered feed while storage loads
navigation.addEventListener('currententrychange', update);
loadSettings().then(applySettings, () => undefined); // keep defaults if storage is unavailable
onSettingsChanged(applySettings);
