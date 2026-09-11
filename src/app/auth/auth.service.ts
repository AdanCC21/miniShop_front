import { Injectable, signal } from '@angular/core';

export type UserRole = 'encargado' | 'empleado' | 'admin';

export type AccountStatus = 'pending' | 'approved';

export interface SessionUser {
  id: number | string;
  name: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  shopUuid?: string;
  shopName?: string;
}

export interface BackendSessionUser {
  id?: number | string;
  name?: string;
  email: string;
  role: string;
  shopUuid?: string | null;
  shop?: { name?: string } | null;
}

export interface BackendSessionProfile {
  userId: number | string;
  email: string;
  role: string;
  shopUuid?: string | null;
}

interface StoredUser extends Omit<SessionUser, 'id'> {
  id: number;
  password: string;
  createdAt: string;
  joinedAt?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'encargado' | 'empleado';
  shopUuid?: string;
  shopName?: string;
  shopAddress?: string;
}

export interface PendingEmployee {
  id: number;
  name: string;
  email: string;
  requestedAt: string;
}

export interface StoreEmployee {
  id: number;
  name: string;
  email: string;
  role: 'Encargado' | 'Empleado';
  joinedAt: string;
}

const SESSION_KEY = 'minishop_session';
const USERS_KEY = 'minishop_users';
const USERS_VERSION_KEY = 'minishop_users_version';
const USERS_VERSION = 2;

const DEMO_USERS: StoredUser[] = [
  {
    id: 1,
    name: 'Carlos Ruiz',
    email: 'carlos.ruiz@ejemplo.com',
    password: 'encargado123',
    role: 'encargado',
    status: 'approved',
    shopUuid: 'ST-0001',
    shopName: 'miniShop Centro',
    createdAt: '2026-01-15',
    joinedAt: '2026-01-15'
  },
  {
    id: 2,
    name: 'Laura Gómez',
    email: 'laura.gomez@ejemplo.com',
    password: 'empleado123',
    role: 'empleado',
    status: 'approved',
    shopUuid: 'ST-0001',
    shopName: 'miniShop Centro',
    createdAt: '2026-03-02',
    joinedAt: '2026-03-02'
  },
  {
    id: 3,
    name: 'Ana Torres',
    email: 'ana.torres@ejemplo.com',
    password: 'pendiente123',
    role: 'empleado',
    status: 'pending',
    shopUuid: 'ST-0001',
    shopName: 'miniShop Centro',
    createdAt: '2026-08-12'
  },
  {
    id: 0,
    name: 'Administrador',
    email: 'admin@minishop.com',
    password: 'admin123',
    role: 'admin',
    status: 'approved',
    createdAt: '2026-01-01'
  }
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUser = signal<SessionUser | null>(this.readSession());

  readonly user = this.currentUser.asReadonly();

  get isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  get role(): UserRole | null {
    return this.currentUser()?.role ?? null;
  }

  get isPending(): boolean {
    return this.currentUser()?.status === 'pending';
  }

  login(email: string, password: string): SessionUser | null {
    const stored = this.findStoredUser(email.trim().toLowerCase());
    if (!stored || stored.password !== password) {
      return null;
    }
    const user = this.toSessionUser(stored);
    this.setSession(user);
    return user;
  }

  register(data: RegisterData): SessionUser {
    const users = this.readUsers();
    const user: StoredUser = {
      ...data,
      email: data.email.trim().toLowerCase(),
      shopUuid: data.shopUuid?.trim(),
      shopName: data.shopName?.trim(),
      status: data.role === 'empleado' ? 'pending' : 'approved',
      createdAt: this.todayISO(),
      id: users.reduce((max, item) => Math.max(max, item.id), 0) + 1
    };
    users.push(user);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const session = this.toSessionUser(user);
    this.setSession(session);
    return session;
  }

  logout(): void {
    this.currentUser.set(null);
    localStorage.removeItem(SESSION_KEY);
  }

  setSessionFromBackend(user: BackendSessionUser): void {
    const { role: userRole, status } = this.mapBackendRole(user.role);
    this.setSession({
      id: user.id ?? '',
      name: user.name?.trim() || 'Usuario',
      email: user.email,
      role: userRole,
      status,
      shopUuid: user.shopUuid?.trim() || undefined,
      shopName: user.shop?.name?.trim() || undefined
    });
  }

  syncFromBackend(profile: BackendSessionProfile): void {
    const current = this.currentUser();
    const { role, status } = this.mapBackendRole(profile.role);
    this.setSession({
      id: current?.id ?? profile.userId,
      name: current?.name?.trim() ?? profile.email,
      email: profile.email,
      role,
      status,
      shopUuid: profile.shopUuid?.trim() || current?.shopUuid,
      shopName: current?.shopName
    });
  }

  private mapBackendRole(backendRole: string): { role: UserRole; status: AccountStatus } {
    switch ((backendRole ?? '').toUpperCase()) {
      case 'MANAGER':
        return { role: 'encargado', status: 'approved' };
      case 'WAITING':
        return { role: 'empleado', status: 'pending' };
      case 'ADMIN':
        return { role: 'admin', status: 'approved' };
      case 'EMPLOYEE':
      default:
        return { role: 'empleado', status: 'approved' };
    }
  }

  pendingEmployees(): PendingEmployee[] {
    const storeUid = this.currentUser()?.shopName;
    if (!storeUid) {
      return [];
    }
    return this.readUsers()
      .filter((user) => user.shopUuid === storeUid && user.role === 'empleado' && user.status === 'pending')
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        requestedAt: user.createdAt
      }));
  }

  storeEmployees(): StoreEmployee[] {
    const storeUid = this.currentUser()?.shopUuid;
    if (!storeUid) {
      return [];
    }
    return this.readUsers()
      .filter((user) => user.shopUuid === storeUid && user.status === 'approved')
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role === 'encargado' ? 'Encargado' : 'Empleado',
        joinedAt: user.joinedAt ?? user.createdAt
      }));
  }

  approveEmployee(email: string): void {
    const normalized = email.trim().toLowerCase();
    const users = this.readUsers();
    const index = users.findIndex((user) => user.email === normalized);
    if (index === -1) {
      return;
    }
    users[index] = { ...users[index], status: 'approved', joinedAt: this.todayISO() };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const session = this.currentUser();
    if (session?.email === normalized) {
      this.setSession({ ...session, status: 'approved' });
    }
  }

  removeUser(email: string): void {
    const normalized = email.trim().toLowerCase();
    const users = this.readUsers().filter((user) => user.email !== normalized);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    const session = this.currentUser();
    if (session?.email === normalized) {
      this.logout();
    }
  }

  private setSession(user: SessionUser): void {
    this.currentUser.set(user);
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }

  private readSession(): SessionUser | null {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as Partial<SessionUser>;
      if (!parsed || typeof parsed.role !== 'string') {
        return null;
      }
      return { ...(parsed as SessionUser), status: parsed.status ?? 'approved' };
    } catch {
      return null;
    }
  }

  private readUsers(): StoredUser[] {
    const version = localStorage.getItem(USERS_VERSION_KEY);
    if (version !== String(USERS_VERSION)) {
      localStorage.setItem(USERS_KEY, JSON.stringify(DEMO_USERS));
      localStorage.setItem(USERS_VERSION_KEY, String(USERS_VERSION));
      return [...DEMO_USERS];
    }
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) {
      return [...DEMO_USERS];
    }
    try {
      return JSON.parse(raw) as StoredUser[];
    } catch {
      return [...DEMO_USERS];
    }
  }

  private findStoredUser(email: string): StoredUser | undefined {
    return this.readUsers().find((user) => user.email.toLowerCase() === email);
  }

  private toSessionUser(stored: StoredUser): SessionUser {
    const { password: _password, createdAt: _createdAt, joinedAt: _joinedAt, ...session } = stored;
    return session;
  }

  private todayISO(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
