import { Component, OnInit, output, signal } from '@angular/core';

import { ThemeToggleComponent } from '../theme-toggle/theme-toggle';

@Component({
  selector: 'app-header',
  imports: [ThemeToggleComponent],
  templateUrl: './header.html'
})
export class HeaderComponent implements OnInit {
  readonly menuClick = output<void>();
  protected readonly shopName = signal("");

  async ngOnInit() {
    
  }
}
