import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { App } from './app';
import { AuthService } from './auth/auth.service';
import { SessionService } from './auth/session.service';
import { routes } from './app.routes';

const sessionServiceMock = {
  current: vi.fn()
};

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionServiceMock.current.mockReset();
    sessionServiceMock.current.mockResolvedValue(null);
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

  it('should render the brand for a logged-in store member', async () => {
    sessionServiceMock.current.mockResolvedValue({
      userId: '1',
      email: 'carlos.ruiz@ejemplo.com',
      role: 'MANAGER',
      shopUuid: 'ST-0001'
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-sidebar')?.textContent).toContain('miniShop');
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
    sessionServiceMock.current.mockResolvedValue({
      userId: '3',
      email: 'ana.torres@ejemplo.com',
      role: 'WAITING',
      shopUuid: 'ST-0001'
    });
    TestBed.inject(AuthService).login('ana.torres@ejemplo.com', 'pendiente123');
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