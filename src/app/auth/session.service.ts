import { computed, Injectable, signal } from '@angular/core';

import { validateSession } from '../api/user';
import type { SessionProfile } from '../api/user';
import { Role } from '../entities/Role';
import { LogOut } from '../api/auth';
import { ToastService } from '../ui/toast/toast.service';

@Injectable({ providedIn: 'root' })
export class SessionService {
  private readonly currentUser = signal<SessionProfile | null>(null);

  readonly user = this.currentUser.asReadonly();
  readonly isStoreMember = computed(() => {
    const role = this.currentUser()?.role?.toUpperCase();
    return role === Role.EMPLOYEE || role === Role.MANAGER;
  });
  readonly isManager = computed(() => this.currentUser()?.role?.toUpperCase() === Role.MANAGER);
  readonly isAdmin = computed(() => this.currentUser()?.role?.toUpperCase() === Role.ADMIN);

  async current(): Promise<SessionProfile | null> {
    const user = await validateSession();
    this.currentUser.set(user);
    return user;
  }

  setFromLogin(user: {
    id?: number | string;
    userId?: number | string;
    name?: string;
    email: string;
    role: string;
    shopUuid?: string | null;
  }): void {
    this.currentUser.set({
      userId: user.userId ?? user.id ?? '',
      name: user.name,
      email: user.email,
      role: user.role,
      shopUuid: user.shopUuid,
    });
  }

  clear(): void {
    this.currentUser.set(null);
  }

  async logout(toast: ToastService): Promise<boolean> {
    const loggedOut = await LogOut(toast);
    if (loggedOut) this.currentUser.set(null);
    return Boolean(loggedOut);
  }
}
