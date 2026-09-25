import { Component, input, output } from '@angular/core';
import { GuarantorDTO } from '../../dto/guarantor.dto';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-guarantor-card',
  imports: [ButtonComponent],
  templateUrl: './guarantor-card.html'
})
export class GuarantorCardComponent {
  readonly person = input.required<GuarantorDTO>();
  readonly totalAmount = input.required<number>();
  readonly lastCreditDate = input.required<string>();

  readonly viewDetails = output<GuarantorDTO>();

  protected handleViewDetails(): void {
    this.viewDetails.emit(this.person());
  }
}
