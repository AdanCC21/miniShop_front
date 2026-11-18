import { Component, computed, input, output, signal } from '@angular/core';
import { SaleDTO } from '../../dto/sale.dto';
import { PaymentMethod } from '../../entities/PaymentMethod';
import { ButtonComponent } from '../button/button';
import { ModalComponent } from '../modal/modal';

export interface RegisterClosureDetails {
  date?: Date | string;
  openedAt?: Date | string | null;
  closedAt?: Date | string | null;
  isOpen?: boolean;
  salesCount: number;
  productsSold: number;
  totalSales: number;
  totalCollected: number;
  openingCash: number;
  cashReceived: number;
  cardReceived: number;
  creditOutstanding: number;
  sales: SaleDTO[];
}

interface ProductLine {
  productId: string;
  code: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

@Component({
  selector: 'app-register-closure-details-modal',
  imports: [ButtonComponent, ModalComponent],
  templateUrl: './register-closure-details-modal.html',
})
export class RegisterClosureDetailsModalComponent {
  readonly closure = input.required<RegisterClosureDetails>();
  readonly title = input('Detalles del cierre de caja');
  readonly close = output<void>();
  protected readonly selectedSale = signal<SaleDTO | null>(null);
  protected readonly PaymentMethod = PaymentMethod;
  protected readonly productLines = computed<ProductLine[]>(() => {
    const products = new Map<string, ProductLine>();
    for (const sale of this.closure().sales) {
      for (const detail of sale.details ?? []) {
        const existing = products.get(detail.productId);
        if (existing) {
          existing.quantity += Number(detail.quantity);
        } else {
          products.set(detail.productId, {
            productId: detail.productId,
            code: detail.product?.code ?? detail.productId,
            name: detail.product?.name ?? 'Producto',
            unitPrice: Number(detail.unitPrice),
            quantity: Number(detail.quantity),
          });
        }
      }
    }
    return [...products.values()];
  });

  protected closeModal(): void {
    this.selectedSale.set(null);
    this.close.emit();
  }

  protected returnToClosure(): void {
    this.selectedSale.set(null);
  }

  protected openSale(sale: SaleDTO): void {
    this.selectedSale.set(sale);
  }

  protected formatMoney(value: number): string {
    return Number(value).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  protected formatDate(value: Date | string): string {
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' }).format(new Date(value));
  }

  protected closureDate(): Date | string {
    const closure = this.closure();
    return closure.date ?? closure.closedAt ?? closure.openedAt ?? new Date();
  }

  protected formatTime(value: Date | string): string {
    return new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit' }).format(new Date(value));
  }

  protected saleItemCount(sale: SaleDTO): number {
    return sale.details?.reduce((sum, detail) => sum + Number(detail.quantity), 0) ?? 0;
  }

  protected paymentMethodLabel(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.CARD: return 'Tarjeta';
      case PaymentMethod.MIXED: return 'Mixto';
      case PaymentMethod.CREDIT: return 'Fiado';
      default: return 'Efectivo';
    }
  }

  protected salePaymentDescription(sale: SaleDTO): string {
    const total = Number(sale.total);
    const paidCash = Number(sale.paidCash);
    const paidCard = Number(sale.paidCard);
    if (sale.method === PaymentMethod.CREDIT) {
      const paid = paidCash + paidCard;
      return `Cobrado $${this.formatMoney(paid)} · Pendiente $${this.formatMoney(Math.max(0, total - paid))}`;
    }
    if (sale.method === PaymentMethod.MIXED) {
      const card = Math.min(total, paidCard);
      return `Tarjeta $${this.formatMoney(card)} · Efectivo $${this.formatMoney(Math.max(0, total - card))}`;
    }
    return `Cobrado $${this.formatMoney(total)}`;
  }
}
