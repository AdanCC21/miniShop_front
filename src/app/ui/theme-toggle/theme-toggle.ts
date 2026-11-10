import { Component, computed, inject } from '@angular/core';

import { ThemeService } from './theme.service';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-theme-toggle',
  imports: [ButtonComponent],
  templateUrl: './theme-toggle.html'
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);

  protected readonly dark = computed(() => this.themeService.theme() === 'dark');

  protected toggle(): void {
    this.themeService.toggle();
  }
}
