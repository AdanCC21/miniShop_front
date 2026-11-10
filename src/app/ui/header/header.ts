import { Component, OnInit, output, signal } from '@angular/core';

import { ThemeToggleComponent } from '../theme-toggle/theme-toggle';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-header',
  imports: [ThemeToggleComponent, ButtonComponent],
  templateUrl: './header.html'
})
export class HeaderComponent implements OnInit {
  readonly menuClick = output<void>();
  protected readonly shopName = signal("");

  async ngOnInit() {
    
  }
}
