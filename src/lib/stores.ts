import { writable } from 'svelte/store';
import type { Mitarbeiter } from './api';

export type Screen = 'splash' | 'login' | 'home' | 'settings';

export interface PersonEntry {
  person: Mitarbeiter;
  fromTime: string;
  toTime: string;
  signature: string | null;
}

export const currentScreen = writable<Screen>('splash');
export const personEntries = writable<PersonEntry[]>([]);
export const error = writable<string | null>(null);
export const toast = writable<string | null>(null);
