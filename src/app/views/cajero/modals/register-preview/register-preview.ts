import { Component, input, output } from '@angular/core';
import { ShopRegisterDTO } from '../../../../dto/shopRegister.dto';
import { formatPrice as formatPriceFn } from '../../scripts/formatters';
import { ModalComponent } from '../../../../ui/modal/modal';

@Component({
  selector: 'app-cajero-register-preview-modal',
  imports: [ModalComponent],
  templateUrl: './register-preview.html',
})
export class CajeroRegisterPreviewModalComponent {
  readonly register = input<ShopRegisterDTO | null>(null);
  readonly close = output<void>();

  protected formatPrice(value: number): string {
    return formatPriceFn(value);
  }
}
