import { ADMIN_EMAIL } from './auth';

export type LocalAuthRole = 'customer' | 'admin';

export type LocalAuthSession = {
  userId: string;
  email: string;
  role: LocalAuthRole;
  createdAt: string;
  welcomeDiscountPercent: number;
  lastLoginAt: string;
  expiresAt: string;
};

type StoredAccount = {
  id: string;
  email: string;
  passwordHash: string;
  role: LocalAuthRole;
  createdAt: string;
  welcomeDiscountPercent: number;
  lastLoginAt: string;
  expiresAt: string;
};

const SESSION_KEY = 'phulwari-auth-session';
const ACCOUNTS_KEY = 'phulwari-local-accounts';
const DEFAULT_ADMIN_PASSWORD = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined)?.trim() || 'Admin@123';
const SESSION_TTL_DAYS = 30;

function canUseStorage() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function nowIso() {
  return new Date().toISOString();
}

function addDays(days: number, base = new Date()) {
  const date = new Date(base);
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function isExpired(expiresAt?: string | null) {
  if (!expiresAt) return false;
  return new Date(expiresAt).getTime() <= Date.now();
}

function randomId(prefix: string) {
  try {
    return `${prefix}-${crypto.randomUUID()}`;
  } catch {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function sha256(value: string) {
  const encoded = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

function legacyHash(value: string) {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return `legacy-${Math.abs(hash)}`;
}

async function passwordHash(password: string) {
  try {
    return await sha256(`phulwari::${password}`);
  } catch {
    return legacyHash(`phulwari::${password}`);
  }
}

function readJSON<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (!canUseStorage()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

function saveAccounts(accounts: StoredAccount[]) {
  writeJSON(ACCOUNTS_KEY, accounts);
}

function getAccounts() {
  const accounts = readJSON<StoredAccount[]>(ACCOUNTS_KEY, []);
  const validAccounts = accounts.filter((account) => !isExpired(account.expiresAt));
  if (validAccounts.length !== accounts.length) {
    saveAccounts(validAccounts);
  }
  return validAccounts;
}

function broadcast(session: LocalAuthSession | null) {
  if (!canUseStorage()) return;
  try {
    window.dispatchEvent(new CustomEvent('phulwari-auth-change', { detail: session }));
  } catch {
    // ignore
  }
}

export function getLocalSession(): LocalAuthSession | null {
  const session = readJSON<LocalAuthSession | null>(SESSION_KEY, null);
  if (!session) return null;

  const expiry = session.expiresAt || addDays(SESSION_TTL_DAYS, new Date(session.lastLoginAt || session.createdAt || Date.now()));
  if (isExpired(expiry)) {
    signOutLocal();
    return null;
  }

  return { ...session, expiresAt: expiry };
}

export function setLocalSession(session: LocalAuthSession | null) {
  writeJSON(SESSION_KEY, session);
  broadcast(session);
}

export function signOutLocal() {
  setLocalSession(null);
}

export function subscribeAuth(callback: (session: LocalAuthSession | null) => void) {
  if (!canUseStorage()) return () => undefined;

  const handleStorage = (event: StorageEvent) => {
    if (event.key === SESSION_KEY || event.key === null) {
      callback(getLocalSession());
    }
  };

  const handleCustom = () => callback(getLocalSession());

  window.addEventListener('storage', handleStorage);
  window.addEventListener('phulwari-auth-change', handleCustom as EventListener);

  return () => {
    window.removeEventListener('storage', handleStorage);
    window.removeEventListener('phulwari-auth-change', handleCustom as EventListener);
  };
}

function toSession(account: StoredAccount): LocalAuthSession {
  return {
    userId: account.id,
    email: account.email,
    role: account.role,
    createdAt: account.createdAt,
    welcomeDiscountPercent: account.welcomeDiscountPercent,
    lastLoginAt: account.lastLoginAt,
    expiresAt: addDays(SESSION_TTL_DAYS, new Date(account.lastLoginAt)),
  };
}

function refreshAccount(account: StoredAccount) {
  const lastLoginAt = nowIso();
  return {
    ...account,
    lastLoginAt,
    expiresAt: addDays(SESSION_TTL_DAYS, new Date(lastLoginAt)),
  };
}

export async function signUpCustomer(email: string, password: string) {
  const normalized = normalizeEmail(email);

  if (!normalized) {
    throw new Error('Enter your email first.');
  }

  if (normalized === ADMIN_EMAIL) {
    throw new Error('This email is reserved for owner/admin login.');
  }

  if (!password || password.length < 6) {
    throw new Error('Use a password with at least 6 characters.');
  }

  const accounts = getAccounts();
  if (accounts.some((account) => account.email === normalized)) {
    throw new Error('This account already exists. Please sign in instead.');
  }

  const account: StoredAccount = {
    id: randomId('cust'),
    email: normalized,
    passwordHash: await passwordHash(password),
    role: 'customer',
    createdAt: nowIso(),
    welcomeDiscountPercent: 10,
    lastLoginAt: nowIso(),
    expiresAt: addDays(SESSION_TTL_DAYS, new Date(nowIso())),
  };

  saveAccounts([account, ...accounts]);
  const session = toSession(account);
  setLocalSession(session);
  return session;
}

export async function signInCustomer(email: string, password: string) {
  const normalized = normalizeEmail(email);

  if (!normalized) {
    throw new Error('Enter your email first.');
  }

  if (!password) {
    throw new Error('Enter your password.');
  }

  if (normalized === ADMIN_EMAIL) {
    return signInAdmin(email, password);
  }

  const accounts = getAccounts();
  const account = accounts.find((item) => item.email === normalized && item.role === 'customer');

  if (!account) {
    throw new Error('Invalid credentials. Please create an account first.');
  }

  const actual = await passwordHash(password);
  if (account.passwordHash !== actual) {
    throw new Error('Invalid credentials. Please check your password.');
  }

  const updated = refreshAccount(account);
  saveAccounts(accounts.map((item) => (item.id === account.id ? updated : item)));
  const session = toSession(updated);
  setLocalSession(session);
  return session;
}

export async function signInAdmin(email: string, password: string) {
  const normalized = normalizeEmail(email);

  if (normalized !== ADMIN_EMAIL) {
    throw new Error('Only the owner email can access the admin dashboard.');
  }

  if (!password || password.length < 6) {
    throw new Error('Enter the admin password.');
  }

  const actual = await passwordHash(password);
  const expected = await passwordHash(DEFAULT_ADMIN_PASSWORD);

  if (actual !== expected) {
    throw new Error('Invalid admin credentials.');
  }

  const session: LocalAuthSession = {
    userId: 'admin-jsaksham2007',
    email: ADMIN_EMAIL,
    role: 'admin',
    createdAt: nowIso(),
    welcomeDiscountPercent: 0,
    lastLoginAt: nowIso(),
    expiresAt: addDays(SESSION_TTL_DAYS),
  };

  setLocalSession(session);
  return session;
}

export function getAdminPasswordLabel() {
  return DEFAULT_ADMIN_PASSWORD;
}
