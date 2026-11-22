// Toolbar popup: one checkbox per setting, named after its key in DEFAULT_SETTINGS.
import { DEFAULT_SETTINGS, loadSettings, type SettingKey } from './shared/settings';

const isSettingKey = (name: string): name is SettingKey => Object.hasOwn(DEFAULT_SETTINGS, name);

void loadSettings().then((settings) => {
  for (const input of document.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')) {
    const key = input.name;
    if (!isSettingKey(key)) continue;
    input.checked = settings[key];
    input.addEventListener('change', () => {
      void chrome.storage.sync.set({ [key]: input.checked });
    });
  }
});
