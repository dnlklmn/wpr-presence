import { derived } from 'svelte/store';
import { settings } from './stores';
import type { Language } from './stores';

const translations = {
  // Login
  login: { en: 'Login', de: 'Anmelden', hi: 'लॉगिन', pl: 'Logowanie' },
  username: { en: 'Username', de: 'Benutzername', hi: 'उपयोगकर्ता नाम', pl: 'Nazwa użytkownika' },
  password: { en: 'Password', de: 'Passwort', hi: 'पासवर्ड', pl: 'Hasło' },
  forgotPassword: { en: 'Forgot password?', de: 'Passwort vergessen?', hi: 'पासवर्ड भूल गए?', pl: 'Zapomniałeś hasła?' },
  loggingIn: { en: 'Logging in...', de: 'Anmeldung...', hi: 'लॉग इन हो रहा है...', pl: 'Logowanie...' },
  loginErrorEmpty: { en: 'Please enter username and password', de: 'Bitte Benutzername und Passwort eingeben', hi: 'कृपया उपयोगकर्ता नाम और पासवर्ड दर्ज करें', pl: 'Proszę podać nazwę użytkownika i hasło' },
  loginErrorInvalid: { en: 'Invalid username or password', de: 'Ungültiger Benutzername oder Passwort', hi: 'गलत उपयोगकर्ता नाम या पासवर्ड', pl: 'Nieprawidłowa nazwa użytkownika lub hasło' },
  connectionError: { en: 'Connection error', de: 'Verbindungsfehler', hi: 'कनेक्शन त्रुटि', pl: 'Błąd połączenia' },

  // Home - header
  location: { en: 'Location', de: 'Standort', hi: 'स्थान', pl: 'Lokalizacja' },
  selectLocation: { en: 'Select Location', de: 'Standort wählen', hi: 'स्थान चुनें', pl: 'Wybierz lokalizację' },

  // Home - table header
  name: { en: 'Name', de: 'Name', hi: 'नाम', pl: 'Imię' },
  start: { en: 'Start', de: 'Beginn', hi: 'शुरू', pl: 'Start' },
  end: { en: 'End', de: 'Ende', hi: 'समाप्त', pl: 'Koniec' },
  signCol: { en: 'Sign...', de: 'Unter...', hi: 'हस्ता...', pl: 'Podp...' },

  // Home - entries
  sign: { en: 'Sign', de: 'Unter.', hi: 'हस्ता.', pl: 'Podpis' },
  noPeopleYet: { en: 'No people added yet', de: 'Noch keine Personen hinzugefügt', hi: 'अभी तक कोई व्यक्ति नहीं जोड़ा गया', pl: 'Nie dodano jeszcze żadnych osób' },

  // Home - actions
  addNew: { en: 'Add new', de: 'Hinzufügen', hi: 'नया जोड़ें', pl: 'Dodaj nowy' },
  submit: { en: 'Submit', de: 'Absenden', hi: 'जमा करें', pl: 'Wyślij' },
  submitting: { en: 'Submitting...', de: 'Wird gesendet...', hi: 'जमा हो रहा है...', pl: 'Wysyłanie...' },
  edit: { en: 'Edit', de: 'Bearbeiten', hi: 'संपादित करें', pl: 'Edytuj' },
  submitError: { en: 'Failed to submit hours', de: 'Stunden konnten nicht gesendet werden', hi: 'घंटे जमा करने में विफल', pl: 'Nie udało się wysłać godzin' },
  loadError: { en: 'Failed to load data', de: 'Daten konnten nicht geladen werden', hi: 'डेटा लोड करने में विफल', pl: 'Nie udało się załadować danych' },

  // Home - success
  reportSubmittedAt: { en: 'Report successfully submitted at', de: 'Bericht erfolgreich gesendet um', hi: 'रिपोर्ट सफलतापूर्वक जमा की गई', pl: 'Raport wysłany pomyślnie o' },

  // Home - people picker
  addPerson: { en: 'Add Person', de: 'Person hinzufügen', hi: 'व्यक्ति जोड़ें', pl: 'Dodaj osobę' },
  search: { en: 'Search...', de: 'Suchen...', hi: 'खोजें...', pl: 'Szukaj...' },
  loading: { en: 'Loading...', de: 'Laden...', hi: 'लोड हो रहा है...', pl: 'Ładowanie...' },
  noMatches: { en: 'No matches', de: 'Keine Ergebnisse', hi: 'कोई मिलान नहीं', pl: 'Brak wyników' },

  // Home - remove sheet
  cancel: { en: 'Cancel', de: 'Abbrechen', hi: 'रद्द करें', pl: 'Anuluj' },
  remove: { en: 'Remove', de: 'Entfernen', hi: 'हटाएं', pl: 'Usuń' },

  // Signature modal
  signTitle: { en: 'Sign', de: 'Unterschrift', hi: 'हस्ताक्षर', pl: 'Podpis' },
  drawHint: { en: 'Draw your signature above', de: 'Zeichnen Sie Ihre Unterschrift oben', hi: 'ऊपर अपना हस्ताक्षर बनाएं', pl: 'Narysuj swój podpis powyżej' },
  clear: { en: 'Clear', de: 'Löschen', hi: 'मिटाएं', pl: 'Wyczyść' },

  // Time picker
  from: { en: 'From', de: 'Von', hi: 'से', pl: 'Od' },
  to: { en: 'To', de: 'Bis', hi: 'तक', pl: 'Do' },
  hr: { en: 'Hr', de: 'Std', hi: 'घंटा', pl: 'Godz' },
  min: { en: 'Min', de: 'Min', hi: 'मिनट', pl: 'Min' },

  // Settings
  settings: { en: 'Settings', de: 'Einstellungen', hi: 'सेटिंग्स', pl: 'Ustawienia' },
  preferences: { en: 'Preferences', de: 'Einstellungen', hi: 'प्राथमिकताएं', pl: 'Preferencje' },
  defaultMarket: { en: 'Default Market', de: 'Standardmarkt', hi: 'डिफ़ॉल्ट बाज़ार', pl: 'Domyślny market' },
  language: { en: 'Language', de: 'Sprache', hi: 'भाषा', pl: 'Język' },
  theme: { en: 'Theme', de: 'Design', hi: 'थीम', pl: 'Motyw' },
  account: { en: 'Account', de: 'Konto', hi: 'खाता', pl: 'Konto' },
  logout: { en: 'Logout', de: 'Abmelden', hi: 'लॉगआउट', pl: 'Wyloguj' },
  about: { en: 'About', de: 'Über', hi: 'के बारे में', pl: 'O aplikacji' },
  version: { en: 'Version', de: 'Version', hi: 'संस्करण', pl: 'Wersja' },
  notSet: { en: 'Not set', de: 'Nicht festgelegt', hi: 'सेट नहीं है', pl: 'Nie ustawiono' },
  none: { en: 'None', de: 'Keine', hi: 'कोई नहीं', pl: 'Brak' },
  dark: { en: 'Dark', de: 'Dunkel', hi: 'डार्क', pl: 'Ciemny' },
  light: { en: 'Light', de: 'Hell', hi: 'लाइट', pl: 'Jasny' },

  // Day names
  sun: { en: 'Sun', de: 'So', hi: 'रवि', pl: 'Ndz' },
  mon: { en: 'Mon', de: 'Mo', hi: 'सोम', pl: 'Pon' },
  tue: { en: 'Tue', de: 'Di', hi: 'मंग', pl: 'Wt' },
  wed: { en: 'Wed', de: 'Mi', hi: 'बुध', pl: 'Śr' },
  thu: { en: 'Thu', de: 'Do', hi: 'गुरु', pl: 'Czw' },
  fri: { en: 'Fri', de: 'Fr', hi: 'शुक्र', pl: 'Pt' },
  sat: { en: 'Sat', de: 'Sa', hi: 'शनि', pl: 'Sob' },

  // Month names
  jan: { en: 'Jan', de: 'Jan', hi: 'जन', pl: 'Sty' },
  feb: { en: 'Feb', de: 'Feb', hi: 'फर', pl: 'Lut' },
  mar: { en: 'Mar', de: 'Mär', hi: 'मार्च', pl: 'Mar' },
  apr: { en: 'Apr', de: 'Apr', hi: 'अप्रै', pl: 'Kwi' },
  may: { en: 'May', de: 'Mai', hi: 'मई', pl: 'Maj' },
  jun: { en: 'Jun', de: 'Jun', hi: 'जून', pl: 'Cze' },
  jul: { en: 'Jul', de: 'Jul', hi: 'जुल', pl: 'Lip' },
  aug: { en: 'Aug', de: 'Aug', hi: 'अग', pl: 'Sie' },
  sep: { en: 'Sep', de: 'Sep', hi: 'सित', pl: 'Wrz' },
  oct: { en: 'Oct', de: 'Okt', hi: 'अक्ट', pl: 'Paź' },
  nov: { en: 'Nov', de: 'Nov', hi: 'नव', pl: 'Lis' },
  dec: { en: 'Dec', de: 'Dez', hi: 'दिस', pl: 'Gru' },
} as const;

type TranslationKey = keyof typeof translations;

function translate(key: TranslationKey, lang: Language): string {
  return translations[key]?.[lang] || translations[key]?.en || key;
}

export const t = derived(settings, ($settings) => {
  return (key: TranslationKey) => translate(key, $settings.language);
});

export const dayNameKeys: TranslationKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
export const monthNameKeys: TranslationKey[] = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
