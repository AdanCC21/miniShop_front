import { Component, computed, HostListener, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../../auth/auth.service';
import { LogOut } from '../../api/auth';
import { ToastService } from '../toast/toast.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html'
})
export class SidebarComponent {
  readonly open = input(false);
  readonly close = output<void>();
  readonly widthChange = output<number>();

  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly auth = inject(AuthService);

  protected readonly user = computed(() => this.auth.user());

  protected readonly isStoreMember = computed(() => {
    const currentUser = this.auth.user();
    if (!currentUser || currentUser.status !== 'approved') {
      return false;
    }
    return currentUser.role === 'empleado' || currentUser.role === 'encargado';
  });

  protected readonly isManager = computed(() => {
    return this.auth.role === 'encargado';
  });

  protected readonly isAdmin = computed(() => {
    return this.auth.role === 'admin';
  });

  protected async logout() {
    try {
      await LogOut(this.toast);
    } finally {
      this.auth.logout();
      this.router.navigate(['/auth']);
    }
  }

  private readonly minWidthVw = 10;
  private readonly maxWidthVw = 50;

  private dragging = false;

  @HostListener('window:pointermove', ['$event'])
  protected onPointerMove(event: PointerEvent): void {
    if (!this.dragging) {
      return;
    }
    event.preventDefault();
    this.widthChange.emit(this.clampedWidth(event.clientX));
  }

  @HostListener('window:pointerup')
  protected onPointerUp(): void {
    this.dragging = false;
  }

  @HostListener('window:pointercancel')
  protected onPointerCancel(): void {
    this.dragging = false;
  }

  protected startResize(event: PointerEvent): void {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return;
    }
    event.preventDefault();
    this.dragging = true;
  }

  private clampedWidth(clientX: number): number {
    const viewport = window.innerWidth;
    if (viewport <= 0) {
      return this.minWidthVw;
    }
    const vw = (clientX / viewport) * 100;
    return Math.min(this.maxWidthVw, Math.max(this.minWidthVw, Math.round(vw * 10) / 10));
  }
}