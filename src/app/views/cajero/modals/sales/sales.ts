import { Component, input, output } from '@angular/core';
import { SaleDTO } from '../../../../dto/sale.dto';
import { PaymentMethod } from '../../../../entities/PaymentMethod';
import { formatPrice as formatPriceFn, paymentMethodLabel as paymentMethodLabelFn } from '../../scripts/formatters';
import { ButtonComponent } from '../../../../ui/button/button';
import { ModalComponent } from '../../../../ui/modal/modal';
import { SalesTableComponent } from '../../../../ui/sales-table/sales-table';

@Component({
  selector: 'app-cajero-sales-modal',
  imports: [ButtonComponent, ModalComponent, SalesTableComponent],
  templateUrl: './sales.html',
})
export class CajeroSalesModalComponent {
  readonly recentSales = input.required<SaleDTO[]>();
  readonly selectedSale = input<SaleDTO | null>(null);
  readonly close = output<void>();
  readonly selectSale = output<SaleDTO>();
  readonly showSalesList = output<void>();
  protected readonly PaymentMethod = PaymentMethod;

  protected formatPrice(value: number): string {
    return formatPriceFn(value);
  }

  protected paymentMethodLabel(method: PaymentMethod | undefined): string {
    return paymentMethodLabelFn(method);
  }

  protected recentSaleCashChange(sale: SaleDTO): number {
    if (sale.method !== PaymentMethod.CASH && sale.method !== PaymentMethod.MIXED) return 0;
    const cashDue = sale.method === PaymentMethod.MIXED
      ? Math.max(0, Number(sale.total) - Number(sale.paidCard))
      : Number(sale.total);
    return Math.max(0, Number(sale.paidCash) - cashDue);
  }
}
