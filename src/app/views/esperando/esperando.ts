import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { SessionService } from '../../auth/session.service';
import { ButtonComponent } from '../../ui/button/button';
import { ThemeToggleComponent } from '../../ui/theme-toggle/theme-toggle';
import { ToastService } from '../../ui/toast/toast.service';

@Component({
  selector: 'app-esperando',
  imports: [ButtonComponent, ThemeToggleComponent],
  templateUrl: './esperando.html'
})
export class EsperandoComponent {
  private readonly session = inject(SessionService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly user = this.session.user;

  protected async logout(): Promise<void> {
    const loggedOut = await this.session.logout(this.toast);
    if (loggedOut) this.router.navigate(['/auth']);
  }
}
