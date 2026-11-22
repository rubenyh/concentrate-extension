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
// "followed only" toggle needs JS, to tag suggested posts (see ./suggested.ts).
const root = document.documentElement;
let stopSuggestedTagger: (() => void) | undefined;

const markRoute = (): void => {
  root.toggleAttribute('data-rsb-home', location.pathname === '/');
};
markRoute();
navigation.addEventListener('currententrychange', markRoute);

const applySettings = (settings: Settings): void => {
  root.toggleAttribute('data-rsb-hide-feed-reels', settings.igHideFeedReels);
  root.toggleAttribute('data-rsb-followed-only', settings.igFollowedOnly);
  if (settings.igFollowedOnly) stopSuggestedTagger ??= startSuggestedTagger();
  else {
    stopSuggestedTagger?.();
    stopSuggestedTagger = undefined;
  }
};
applySettings(DEFAULT_SETTINGS); // no flash of unfiltered feed while storage loads
loadSettings().then(applySettings, () => undefined); // keep defaults if storage is unavailable
onSettingsChanged(applySettings);
