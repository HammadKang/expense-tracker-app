export type Expense = {
  id?: string;
  // Missing on expenses saved before currencies were added (treated as PKR).
  currency?: string;
  amount: number | string;
  description: string;
  // Local wall-clock time stored as an ISO string (read it with UTC getters).
  datetime: string;
  category: string;
  // Local calendar day, YYYY-MM-DD.
  date: string;
};

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const toAmount = (v: number | string): number => {
  const n = typeof v === 'number' ? v : parseFloat(v);
  return Number.isFinite(n) ? n : 0;
};

export const formatMoney = (n: number, currency = 'PKR') =>
  `${currency} ${n.toLocaleString('en-US', {
    minimumFractionDigits: Number.isInteger(n) ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;

const parseDay = (date: string) => {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate(),
  ).padStart(2, '0')}`;

export const formatDayTitle = (date: string) => {
  const d = parseDay(date);
  const now = new Date();
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  if (date === dayKey(now)) return 'Today';
  if (date === dayKey(yesterday)) return 'Yesterday';
  const year = d.getFullYear() !== now.getFullYear() ? ` ${d.getFullYear()}` : '';
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}${year}`;
};

export const formatTime = (datetime: string) => {
  const d = new Date(datetime);
  if (isNaN(d.getTime())) return '';
  let h = d.getUTCHours();
  const m = String(d.getUTCMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
};

// Month keys look like "2026-10" and match the first 7 chars of Expense.date.
export const monthKey = (d: Date = new Date()) => dayKey(d).slice(0, 7);

const parseMonthKey = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return { y, m: (m || 1) - 1 };
};

export const monthName = (key: string) => {
  const { y, m } = parseMonthKey(key);
  return `${MONTHS_LONG[m]} ${y}`;
};

export const monthOnly = (key: string) => MONTHS_LONG[parseMonthKey(key).m];

export const monthRange = (key: string) => {
  const { y, m } = parseMonthKey(key);
  const last = new Date(y, m + 1, 0).getDate();
  return `${MONTHS[m]} 01 - ${MONTHS[m]} ${String(last).padStart(2, '0')}`;
};

export const localNowParts = () => {
  const shifted = new Date(Date.now() - new Date().getTimezoneOffset() * 60000);
  const iso = shifted.toISOString();
  return { datetime: iso, date: iso.slice(0, 10) };
};

const MAX_INT_DIGITS = 9;

// Keeps only a valid amount: digits, one dot, max 2 decimals, no stray zeros.
export const sanitizeAmount = (input: string): string => {
  let v = input.replace(/[^0-9.]/g, '');
  const dot = v.indexOf('.');
  if (dot !== -1) {
    const int = v.slice(0, dot).replace(/^0+(?=\d)/, '').slice(0, MAX_INT_DIGITS);
    const dec = v.slice(dot + 1).replace(/\./g, '').slice(0, 2);
    return `${int === '' ? '0' : int}.${dec}`;
  }
  v = v.replace(/^0+(?=\d)/, '').slice(0, MAX_INT_DIGITS);
  return v;
};

// "1234567.5" -> "1,234,567.5" (keeps a trailing dot while typing).
export const formatAmountInput = (raw: string): string => {
  if (!raw) return '';
  const [int, dec] = raw.split('.');
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return dec === undefined ? grouped : `${grouped}.${dec}`;
};
