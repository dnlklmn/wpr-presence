import type {
  User,
  LoginResponse,
  Mitarbeiter,
  MitarbeiterResponse,
  Filiale,
  FilialeResponse,
  HoursData,
  HoursRecord,
  HoursHistoryResponse,
} from "./api-real";

// ============ MOCK DATA ============

const MOCK_FILIALEN: Filiale[] = [
  {
    f_id: 1,
    name: "REWE Alexanderplatz",
    address: "Alexanderplatz 5, 10178 Berlin",
  },
  {
    f_id: 2,
    name: "REWE Friedrichstraße",
    address: "Friedrichstraße 90, 10117 Berlin",
  },
  {
    f_id: 3,
    name: "REWE Prenzlauer Berg",
    address: "Schönhauser Allee 80, 10439 Berlin",
  },
  {
    f_id: 4,
    name: "REWE Kreuzberg",
    address: "Oranienstraße 25, 10999 Berlin",
  },
  {
    f_id: 5,
    name: "REWE Charlottenburg",
    address: "Wilmersdorfer Str. 46, 10627 Berlin",
  },
  {
    f_id: 6,
    name: "Penny Neukölln",
    address: "Karl-Marx-Straße 112, 12043 Berlin",
  },
  { f_id: 7, name: "Penny Wedding", address: "Müllerstraße 55, 13349 Berlin" },
  {
    f_id: 8,
    name: "Penny Lichtenberg",
    address: "Frankfurter Allee 200, 10365 Berlin",
  },
  {
    f_id: 9,
    name: "Penny Spandau",
    address: "Carl-Schurz-Straße 18, 13597 Berlin",
  },
  {
    f_id: 10,
    name: "Penny Tempelhof",
    address: "Tempelhofer Damm 150, 12099 Berlin",
  },
];

const MOCK_MITARBEITER: Mitarbeiter[] = [
  // German names (12)
  { ma_id: 1, name: "Müller", vorname: "Thomas", active: true },
  { ma_id: 2, name: "Schmidt", vorname: "Anna", active: true },
  { ma_id: 3, name: "Schneider", vorname: "Michael", active: true },
  { ma_id: 4, name: "Fischer", vorname: "Sarah", active: true },
  { ma_id: 5, name: "Weber", vorname: "Klaus", active: true },
  { ma_id: 6, name: "Meyer", vorname: "Julia", active: true },
  { ma_id: 7, name: "Wagner", vorname: "Stefan", active: true },
  { ma_id: 8, name: "Becker", vorname: "Laura", active: true },
  { ma_id: 9, name: "Hoffmann", vorname: "Martin", active: true },
  { ma_id: 10, name: "Schulz", vorname: "Lisa", active: true },
  { ma_id: 11, name: "Koch", vorname: "Daniel", active: true },
  { ma_id: 12, name: "Richter", vorname: "Christina", active: true },

  // Polish names (12)
  { ma_id: 13, name: "Kowalski", vorname: "Piotr", active: true },
  { ma_id: 14, name: "Nowak", vorname: "Agnieszka", active: true },
  { ma_id: 15, name: "Wiśniewski", vorname: "Tomasz", active: true },
  { ma_id: 16, name: "Wójcik", vorname: "Katarzyna", active: true },
  { ma_id: 17, name: "Kowalczyk", vorname: "Michał", active: true },
  { ma_id: 18, name: "Kamiński", vorname: "Anna", active: true },
  { ma_id: 19, name: "Lewandowski", vorname: "Paweł", active: true },
  { ma_id: 20, name: "Zieliński", vorname: "Magdalena", active: true },
  { ma_id: 21, name: "Szymański", vorname: "Jakub", active: true },
  { ma_id: 22, name: "Woźniak", vorname: "Monika", active: true },
  { ma_id: 23, name: "Dąbrowski", vorname: "Krzysztof", active: true },
  { ma_id: 24, name: "Kozłowski", vorname: "Ewa", active: true },

  // Indian names (11)
  { ma_id: 25, name: "Sharma", vorname: "Rahul", active: true },
  { ma_id: 26, name: "Patel", vorname: "Priya", active: true },
  { ma_id: 27, name: "Singh", vorname: "Amit", active: true },
  { ma_id: 28, name: "Kumar", vorname: "Sunita", active: true },
  { ma_id: 29, name: "Gupta", vorname: "Vikram", active: true },
  { ma_id: 30, name: "Reddy", vorname: "Anjali", active: true },
  { ma_id: 31, name: "Rao", vorname: "Sanjay", active: true },
  { ma_id: 32, name: "Verma", vorname: "Deepa", active: true },
  { ma_id: 33, name: "Joshi", vorname: "Arjun", active: true },
  { ma_id: 34, name: "Nair", vorname: "Kavitha", active: true },
  { ma_id: 35, name: "Mehta", vorname: "Rohan", active: true },
];

const MOCK_USER: User = {
  id: "1",
  username: "demo",
  zugriff: "admin",
};

// Storage keys
const STORAGE_KEY_HOURS = "mock_hours_records_v2";
const STORAGE_KEY_NEXT_ID = "mock_hours_next_id_v2";

// ============ HELPER FUNCTIONS ============

function getStoredHours(): HoursRecord[] {
  const stored = localStorage.getItem(STORAGE_KEY_HOURS);
  if (stored) {
    return JSON.parse(stored);
  }
  // Initialize with mock historical data
  const historical = generateHistoricalData();
  localStorage.setItem(STORAGE_KEY_HOURS, JSON.stringify(historical));
  localStorage.setItem(STORAGE_KEY_NEXT_ID, String(historical.length + 1));
  return historical;
}

function saveHours(records: HoursRecord[]): void {
  localStorage.setItem(STORAGE_KEY_HOURS, JSON.stringify(records));
}

function getNextId(): number {
  const id = parseInt(localStorage.getItem(STORAGE_KEY_NEXT_ID) || "1");
  localStorage.setItem(STORAGE_KEY_NEXT_ID, String(id + 1));
  return id;
}

function generateScribbleSvg(): string {
  const w = 100;
  const h = 50;
  const parts: string[] = [];
  let x = 5 + Math.random() * 10;
  let y = 20 + Math.random() * 10;
  parts.push(`M${x.toFixed(1)},${y.toFixed(1)}`);
  const steps = 5 + Math.floor(Math.random() * 4);
  for (let i = 0; i < steps; i++) {
    x += 8 + Math.random() * 12;
    y = 10 + Math.random() * 30;
    const cx = x - 5 + Math.random() * 10;
    const cy = 10 + Math.random() * 30;
    parts.push(
      `Q${cx.toFixed(1)},${cy.toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`,
    );
  }
  const d = parts.join(" ");
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} ${h}'><path d='${d}' fill='none' stroke='white' stroke-width='2' stroke-linecap='round'/></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

function generateHistoricalData(): HoursRecord[] {
  const records: HoursRecord[] = [];
  const today = new Date();
  let id = 1;

  // Generate data for the last 7 days
  for (let daysAgo = 7; daysAgo >= 1; daysAgo--) {
    const date = new Date(today);
    date.setDate(date.getDate() - daysAgo);
    const dateStr = date.toISOString().split("T")[0];

    // Skip weekends for more realistic data
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0) continue; // Sunday

    // Each day, 2-4 markets had shifts
    const numMarkets = 2 + Math.floor(Math.random() * 3);
    const shuffledMarkets = [...MOCK_FILIALEN]
      .sort(() => Math.random() - 0.5)
      .slice(0, numMarkets);

    for (const market of shuffledMarkets) {
      // 3-6 employees per market per day
      const numEmployees = 3 + Math.floor(Math.random() * 4);
      const shuffledEmployees = [...MOCK_MITARBEITER]
        .sort(() => Math.random() - 0.5)
        .slice(0, numEmployees);

      for (const employee of shuffledEmployees) {
        // Realistic shift times
        const shiftTypes = [
          { start: "06:00", end: "14:00" },
          { start: "08:00", end: "16:00" },
          { start: "09:00", end: "17:00" },
          { start: "10:00", end: "18:00" },
          { start: "12:00", end: "20:00" },
          { start: "14:00", end: "22:00" },
        ];
        const shift = shiftTypes[Math.floor(Math.random() * shiftTypes.length)];

        records.push({
          id: id++,
          ma_id: employee.ma_id,
          f_id: market.f_id,
          datum: dateStr,
          schicht_start: shift.start,
          schicht_ende: shift.end,
          signature: generateScribbleSvg(),
          mitarbeiter_name: `${employee.vorname} ${employee.name}`,
          filiale_name: market.name,
        });
      }
    }
  }

  return records;
}

function delay(ms: number = 100): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ============ API FUNCTIONS ============

export function setToken(token: string): void {
  localStorage.setItem("token", token);
}

export function clearToken(): void {
  localStorage.removeItem("token");
}

export function isLoggedIn(): boolean {
  const token = localStorage.getItem("token");
  const expires = localStorage.getItem("tokenExpires");
  if (!token || !expires) return false;
  return Date.now() < parseInt(expires) * 1000;
}

export async function login(
  username: string,
  password: string,
): Promise<LoginResponse> {
  await delay(300); // Simulate network delay

  // Accept any credentials for demo
  if (username && password) {
    const token = "mock_token_" + Date.now();
    const expires = Math.floor(Date.now() / 1000) + 86400; // 24 hours

    setToken(token);
    localStorage.setItem("tokenExpires", expires.toString());
    localStorage.setItem("user", JSON.stringify(MOCK_USER));

    return {
      success: true,
      token,
      expires,
      user: MOCK_USER,
    };
  }

  return {
    success: false,
    token: "",
    expires: 0,
    user: MOCK_USER,
  };
}

export async function getMitarbeiter(): Promise<MitarbeiterResponse> {
  await delay(150);
  return {
    success: true,
    count: MOCK_MITARBEITER.length,
    mitarbeiter: MOCK_MITARBEITER,
  };
}

export async function getFilialen(): Promise<FilialeResponse> {
  await delay(150);
  return {
    success: true,
    count: MOCK_FILIALEN.length,
    filialen: MOCK_FILIALEN,
  };
}

export async function submitHours(
  data: HoursData,
): Promise<{ success: boolean }> {
  await delay(200);

  const records = getStoredHours();
  const employee = MOCK_MITARBEITER.find((m) => m.ma_id === data.ma_id);
  const market = MOCK_FILIALEN.find((f) => f.f_id === data.f_id);

  const newRecord: HoursRecord = {
    ...data,
    id: getNextId(),
    mitarbeiter_name: employee
      ? `${employee.vorname} ${employee.name}`
      : undefined,
    filiale_name: market?.name,
  };

  records.push(newRecord);
  saveHours(records);

  return { success: true };
}

export async function getHoursHistory(
  startDate?: string,
  endDate?: string,
): Promise<HoursHistoryResponse> {
  await delay(150);

  let records = getStoredHours();

  if (startDate) {
    records = records.filter((r) => r.datum >= startDate);
  }
  if (endDate) {
    records = records.filter((r) => r.datum <= endDate);
  }

  // Sort by date descending, then by id descending
  records.sort((a, b) => {
    const dateCompare = b.datum.localeCompare(a.datum);
    if (dateCompare !== 0) return dateCompare;
    return b.id - a.id;
  });

  return {
    success: true,
    count: records.length,
    records,
  };
}

export function logout(): void {
  clearToken();
  localStorage.removeItem("tokenExpires");
  localStorage.removeItem("user");
}

// Re-export types
export type {
  User,
  LoginResponse,
  Mitarbeiter,
  MitarbeiterResponse,
  Filiale,
  FilialeResponse,
  HoursData,
  HoursRecord,
  HoursHistoryResponse,
};
