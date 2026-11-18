import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../../../ui/button/button';
import { InputComponent } from '../../../../ui/input/input';
import { ModalComponent } from '../../../../ui/modal/modal';

@Component({
  selector: 'app-cajero-open-register-modal',
  imports: [ButtonComponent, InputComponent, ModalComponent],
  templateUrl: './open-register.html',
})
export class CajeroOpenRegisterModalComponent {
  readonly amount = input.required<number>();
  readonly amountChange = output<string>();
  readonly close = output<void>();
  readonly confirm = output<void>();
}
