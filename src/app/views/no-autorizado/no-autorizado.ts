import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { ButtonComponent } from '../../ui/button/button';
import { ThemeToggleComponent } from '../../ui/theme-toggle/theme-toggle';

@Component({
  selector: 'app-no-autorizado',
  imports: [ButtonComponent, ThemeToggleComponent],
  templateUrl: './no-autorizado.html'
})
export class NoAutorizadoComponent {
  private readonly router = inject(Router);

  protected returnToDashboard(): void {
    void this.router.navigate(['/dashboard']);
  }
}
