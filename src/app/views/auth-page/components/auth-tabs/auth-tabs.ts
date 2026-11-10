import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../../../ui/button/button';


export type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth-tabs',
  imports: [ButtonComponent],
  templateUrl: './auth-tabs.html'
})
export class AuthTabsComponent {
  readonly mode = input.required<AuthMode>();
  readonly switchMode = output<AuthMode>();
}
