import { Component, HostListener, inject, input, OnInit, output, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ConfirmModalComponent } from '../confirm-modal/confirm-modal';
import { ButtonComponent } from '../button/button';
import { ToastService } from '../toast/toast.service';
import { GetMyShop } from '../../api/shop';
import { SessionService } from '../../auth/session.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, ConfirmModalComponent, ButtonComponent],
  templateUrl: './sidebar.html'
})
export class SidebarComponent implements OnInit {
  readonly open = input(false);
  readonly close = output<void>();
  readonly widthChange = output<number>();

  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly session = inject(SessionService);

  protected readonly user = this.session.user;
  protected readonly isStoreMember = this.session.isStoreMember;
  protected readonly isManager = this.session.isManager;
  protected readonly isAdmin = this.session.isAdmin;
  protected readonly shop = signal<{uuid:string, name:string} | null>(null);
  protected readonly showLogoutConfirmation = signal(false);

  async ngOnInit() {
    const user = await this.session.current();
    if (user && this.session.isStoreMember()) {
      const shop = await GetMyShop(this.toast, false, false, true);
      if (shop) this.shop.set(shop);
    }
  }

  protected requestLogout(): void {
    this.showLogoutConfirmation.set(true);
  }

  protected cancelLogout(): void {
    this.showLogoutConfirmation.set(false);
  }

  protected async logout() {
    this.showLogoutConfirmation.set(false);
    const loggedOut = await this.session.logout(this.toast);
    if (!loggedOut) return;
    this.router.navigate(['/auth']);
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
