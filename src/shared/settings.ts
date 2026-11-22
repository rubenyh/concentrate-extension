// User-toggleable features, stored in chrome.storage.sync (synced across the user's Chrome profiles,
// never sent anywhere else). Route blocking is not toggleable; these only control home-feed filtering.

export const DEFAULT_SETTINGS = {
  /** Hide reel posts in the Instagram home feed. */
  igHideFeedReels: true,
  /** Hide Instagram home-feed posts from accounts the user does not follow (suggested posts, ads). */
  igFollowedOnly: true,
};

export type Settings = typeof DEFAULT_SETTINGS;
export type SettingKey = keyof Settings;

export async function loadSettings(): Promise<Settings> {
  // get(defaults) fills any missing key with its default.
  return (await chrome.storage.sync.get(DEFAULT_SETTINGS)) as Settings;
}

export function onSettingsChanged(callback: (settings: Settings) => void): void {
  chrome.storage.onChanged.addListener((_changes, area) => {
    // A failed read keeps the current settings; there is nothing better to fall back to.
    if (area === 'sync') loadSettings().then(callback, () => undefined);
  });
}
