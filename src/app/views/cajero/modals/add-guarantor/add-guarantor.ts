import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../../../ui/button/button';
import { InputComponent } from '../../../../ui/input/input';
import { ModalComponent } from '../../../../ui/modal/modal';

@Component({
  selector: 'app-cajero-add-guarantor-modal',
  imports: [ButtonComponent, InputComponent, ModalComponent],
  templateUrl: './add-guarantor.html',
})
export class CajeroAddGuarantorModalComponent {
  readonly query = input.required<string>();
  readonly queryChange = output<string>();
  readonly close = output<void>();
  readonly confirm = output<void>();
}
