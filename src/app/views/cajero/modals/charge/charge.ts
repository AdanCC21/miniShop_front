import { Component, input, output } from '@angular/core';
import { PaymentMethod } from '../../../../entities/PaymentMethod';
import { formatPrice as formatPriceFn } from '../../scripts/formatters';
import { ButtonComponent } from '../../../../ui/button/button';
import { ModalComponent } from '../../../../ui/modal/modal';

@Component({
  selector: 'app-cajero-charge-modal',
  imports: [ButtonComponent, ModalComponent],
  templateUrl: './charge.html',
})
export class CajeroChargeModalComponent {
  protected readonly PaymentMethod = PaymentMethod;
  readonly method = input.required<PaymentMethod>();
  readonly total = input.required<number>();
  readonly receivedPayment = input.required<number>();
  readonly change = input.required<number>();
  readonly receivedCard = input.required<number>();
  readonly receivedCash = input.required<number>();
  readonly cashChange = input.required<number>();
  readonly fiadoMethod = input.required<'efectivo' | 'tarjeta' | 'mixto'>();
  readonly fiadoPerson = input.required<string>();
  readonly fiadoPaid = input.required<{ cash: number; card: number }>();
  readonly fiadoRemaining = input.required<number>();
  readonly close = output<void>();
  readonly confirm = output<void>();

  protected formatPrice(value: number): string {
    return formatPriceFn(value);
  }
}
