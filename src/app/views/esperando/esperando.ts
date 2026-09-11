import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../auth/auth.service';
import { ButtonComponent } from '../../ui/button/button';
import { ThemeToggleComponent } from '../../ui/theme-toggle/theme-toggle';
import { LogOut } from '../../api/auth';
import { ToastService } from '../../ui/toast/toast.service';

@Component({
  selector: 'app-esperando',
  imports: [ButtonComponent, ThemeToggleComponent],
  templateUrl: './esperando.html'
})
export class EsperandoComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly user = this.auth.user;

  protected async logout(): Promise<void> {
    try {
      await LogOut(this.toast);
    } finally {
      this.auth.logout();
      this.router.navigate(['/auth']);
    }
  }
}
