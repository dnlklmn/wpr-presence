import { writable } from "svelte/store";
import type { Mitarbeiter } from "./api";

export type Screen = "splash" | "login" | "home" | "settings";

export type Language = "en" | "de" | "hi" | "pl";
export type Theme = "dark" | "light";

export interface PersonEntry {
  person: Mitarbeiter;
  fromTime: string;
  toTime: string;
  signature: string | null;
}

export interface AppSettings {
  defaultMarketId: number | null;
  language: Language;
  theme: Theme;
}

const SETTINGS_KEY = "app_settings";

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  return { defaultMarketId: null, language: "en", theme: "dark" };
}

function createSettingsStore() {
  const { subscribe, set, update } = writable<AppSettings>(loadSettings());
  return {
    subscribe,
    set(value: AppSettings) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(value));
      set(value);
    },
    update(fn: (s: AppSettings) => AppSettings) {
      update((s) => {
        const next = fn(s);
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
        return next;
      });
    },
  };
}

export const currentScreen = writable<Screen>("splash");
export const personEntries = writable<PersonEntry[]>([]);
export const error = writable<string | null>(null);
export const toast = writable<string | null>(null);
export const settings = createSettingsStore();
