import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';

import { HeaderComponent } from './ui/header/header';
import { SidebarComponent } from './ui/sidebar/sidebar';
import { ToastComponent } from './ui/toast/toast';
import { LoaderComponent } from './ui/loader/loader';
import { registerAuthErrorHandler } from './api/auth-errors';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, ToastComponent, LoaderComponent],
  templateUrl: './app.html'
})
export class App {
  private readonly currentUrl = signal('');
  protected readonly sidebarOpen = signal(false);
  protected readonly sidebarWidth = signal(this.defaultSidebarWidth());

  protected readonly isBarePage = computed(() => {
    const url = this.currentUrl();
    return url.startsWith('/auth') || url.startsWith('/esperando');
  });

  constructor(private readonly router: Router) {
    const auth = inject(AuthService);
    registerAuthErrorHandler(auth, this.router);

    this.currentUrl.set(this.router.url);
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.currentUrl.set(this.router.url);
        this.sidebarOpen.set(false);
      });
  }

  protected openSidebar(): void {
    this.sidebarOpen.set(true);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected onSidebarWidthChange(value: number): void {
    this.sidebarWidth.set(value);
  }

  private defaultSidebarWidth(): number {
    const viewport = window.innerWidth;
    if (viewport <= 0) {
      return 20;
    }
    const vw = (256 / viewport) * 100;
    return Math.min(50, Math.max(10, Math.round(vw * 10) / 10));
  }
}