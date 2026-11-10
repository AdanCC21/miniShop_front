import { Component, input, output } from '@angular/core';

import { SaleDTO } from '../../dto/sale.dto';
import { PaymentMethod } from '../../entities/PaymentMethod';
import { getMethodUsed } from '../../scripts/paymant';

@Component({
  selector: 'app-sales-table',
  templateUrl: './sales-table.html'
})
export class SalesTableComponent {
  readonly sales = input.required<SaleDTO[]>();
  readonly emptyMessage = input('No hay ventas.');
  readonly saleSelected = output<SaleDTO>();

  protected itemCount(sale: SaleDTO): number {
    return sale.details?.reduce((total, detail) => total + Number(detail.quantity), 0) ?? 0;
  }

  protected paymentMethodLabel(method: PaymentMethod): string {
    return getMethodUsed(method);
  }

  protected formatPrice(value: number): string {
    return Number(value).toFixed(2);
  }

  protected saleTime(date: Date): string {
    return new Date(date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
  }
}
