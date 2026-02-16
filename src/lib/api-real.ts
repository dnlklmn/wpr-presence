const API_BASE = '/api';

export interface User {
  id: string;
  username: string;
  zugriff: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  expires: number;
  user: User;
}

export interface Mitarbeiter {
  ma_id: number;
  name: string;
  vorname: string;
  active: boolean;
}

export interface MitarbeiterResponse {
  success: boolean;
  count: number;
  mitarbeiter: Mitarbeiter[];
}

export interface Filiale {
  f_id: number;
  name: string;
  address: string;
}

export interface FilialeResponse {
  success: boolean;
  count: number;
  filialen: Filiale[];
}

export interface HoursData {
  ma_id: number;
  f_id: number;
  datum: string;
  schicht_start: string;
  schicht_ende: string;
  signature?: string | null;
}

export interface HoursRecord extends HoursData {
  id: number;
  mitarbeiter_name?: string;
  filiale_name?: string;
}

export interface HoursHistoryResponse {
  success: boolean;
  count: number;
  records: HoursRecord[];
}

function getToken(): string | null {
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function clearToken(): void {
  localStorage.removeItem('token');
}

export function isLoggedIn(): boolean {
  const token = getToken();
  const expires = localStorage.getItem('tokenExpires');
  if (!token || !expires) return false;
  return Date.now() < parseInt(expires) * 1000;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  if (data.success) {
    setToken(data.token);
    localStorage.setItem('tokenExpires', data.expires.toString());
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  return data;
}

export async function getMitarbeiter(): Promise<MitarbeiterResponse> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/mitarbeiter.php`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function getFilialen(): Promise<FilialeResponse> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/filialen.php`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export async function submitHours(data: HoursData): Promise<{ success: boolean }> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/hours.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getHoursHistory(startDate?: string, endDate?: string): Promise<HoursHistoryResponse> {
  const token = getToken();
  const params = new URLSearchParams();
  if (startDate) params.set('start', startDate);
  if (endDate) params.set('end', endDate);
  const res = await fetch(`${API_BASE}/hours.php?${params}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return res.json();
}

export function logout(): void {
  clearToken();
  localStorage.removeItem('tokenExpires');
  localStorage.removeItem('user');
}
