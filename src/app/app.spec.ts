import { TestBed } from '@angular/core/testing';
import { computed, signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';

import { App } from './app';
import type { SessionProfile } from './api/user';
import { SessionService } from './auth/session.service';
import { routes } from './app.routes';

let mockedProfile: SessionProfile | null = null;
const mockedUser = signal<SessionProfile | null>(null);
const sessionServiceMock = {
  current: vi.fn(async () => {
    mockedUser.set(mockedProfile);
    return mockedProfile;
  }),
  user: mockedUser.asReadonly(),
  isStoreMember: computed(() => ['EMPLOYEE', 'MANAGER'].includes(mockedUser()?.role ?? '')),
  isManager: computed(() => mockedUser()?.role === 'MANAGER'),
  isAdmin: computed(() => mockedUser()?.role === 'ADMIN'),
  clear: vi.fn(() => mockedUser.set(null)),
  logout: vi.fn(async () => true)
};

describe('App', () => {
  beforeEach(async () => {
    mockedProfile = null;
    mockedUser.set(null);
    sessionServiceMock.current.mockReset();
    sessionServiceMock.current.mockImplementation(async () => {
      mockedUser.set(mockedProfile);
      return mockedProfile;
    });
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter(routes),
        { provide: SessionService, useValue: sessionServiceMock }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the backend profile for a logged-in store member', async () => {
    mockedProfile = {
      userId: '1',
      email: 'carlos.ruiz@ejemplo.com',
      role: 'MANAGER',
      shopUuid: 'ST-0001'
    };
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-sidebar')?.textContent).toContain('carlos.ruiz@ejemplo.com');
  });

  it('should hide sidebar and header on the auth page', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    await router.navigate(['/auth']);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-sidebar')).toBeNull();
    expect(compiled.querySelector('app-header')).toBeNull();
  });

  it('should hide sidebar and header on the esperando page', async () => {
    mockedProfile = {
      userId: '3',
      email: 'ana.torres@ejemplo.com',
      role: 'WAITING',
      shopUuid: 'ST-0001'
    };
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    await router.navigate(['/esperando']);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-sidebar')).toBeNull();
    expect(compiled.querySelector('app-header')).toBeNull();
  });

  it('redirects a user without a valid session to /auth', async () => {
    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(App);
    await router.navigate(['/dashboard']);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(router.url).toContain('/auth');
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-sidebar')).toBeNull();
  });
});
