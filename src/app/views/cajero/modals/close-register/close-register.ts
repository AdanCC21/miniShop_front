import { Component, output } from '@angular/core';
import { ConfirmModalComponent } from '../../../../ui/confirm-modal/confirm-modal';

@Component({
  selector: 'app-cajero-close-register-modal',
  imports: [ConfirmModalComponent],
  templateUrl: './close-register.html',
})
export class CajeroCloseRegisterModalComponent {
  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
