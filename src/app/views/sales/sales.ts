import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { GetRegisterClosureDetails, GetRegisterClosures } from '../../api/sales';
import { SaleDTO, ShopRegisterClosureDTO, ShopRegisterClosureDetailsDTO } from '../../dto/sale.dto';
import { PaymentMethod } from '../../entities/PaymentMethod';
import { ButtonComponent } from '../../ui/button/button';
import { ModalComponent } from '../../ui/modal/modal';
import { ToastService } from '../../ui/toast/toast.service';

interface ClosureProductLine {
  productId: string;
  code: string;
  name: string;
  unitPrice: number;
  quantity: number;
}

@Component({
  selector: 'app-sales',
  imports: [ModalComponent, ButtonComponent],
  templateUrl: './sales.html'
})
export class SalesComponent implements OnInit {
  private readonly toast = inject(ToastService);

  protected readonly closures = signal<ShopRegisterClosureDTO[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadError = signal(false);
  protected readonly loadingDetails = signal<string | null>(null);
  protected readonly selectedClosure = signal<ShopRegisterClosureDetailsDTO | null>(null);

  protected readonly productLines = computed<ClosureProductLine[]>(() => {
    const products = new Map<string, ClosureProductLine>();
    for (const sale of this.selectedClosure()?.sales ?? []) {
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

  async ngOnInit(): Promise<void> {
    await this.loadClosures();
  }

  protected async loadClosures(): Promise<void> {
    this.loading.set(true);
    this.loadError.set(false);
    const closures = await GetRegisterClosures(48, this.toast);
    if (closures === null) {
      this.loadError.set(true);
    } else {
      this.closures.set([...closures].sort(
        (a, b) => new Date(b.closedAt).getTime() - new Date(a.closedAt).getTime()
      ));
    }
    this.loading.set(false);
  }

  protected async openDetails(closure: ShopRegisterClosureDTO): Promise<void> {
    this.loadingDetails.set(closure.uuid);
    const details = await GetRegisterClosureDetails(closure.uuid, this.toast);
    if (details) {
      this.selectedClosure.set(details);
    }
    this.loadingDetails.set(null);
  }

  protected closeDetails(): void {
    this.selectedClosure.set(null);
  }

  protected formatMoney(value: number): string {
    return Number(value).toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  protected formatDate(value: Date | string): string {
    return new Intl.DateTimeFormat('es-MX', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  protected formatTime(value: Date | string): string {
    return new Intl.DateTimeFormat('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }

  protected saleItemCount(sale: SaleDTO): number {
    return sale.details?.reduce((sum, detail) => sum + Number(detail.quantity), 0) ?? 0;
  }

  protected paymentMethodLabel(method: PaymentMethod): string {
    switch (method) {
      case PaymentMethod.CARD:
        return 'Tarjeta';
      case PaymentMethod.MIXED:
        return 'Mixto';
      case PaymentMethod.CREDIT:
        return 'Fiado';
      default:
        return 'Efectivo';
    }
  }

  protected salePaymentDescription(sale: SaleDTO): string {
    const total = Number(sale.total);
    const paidCash = Number(sale.paidCash);
    const paidCard = Number(sale.paidCard);

    if (sale.method === PaymentMethod.CREDIT) {
      const paid = paidCash + paidCard;
      const outstanding = Math.max(0, total - paid);
      return `Cobrado $${this.formatMoney(paid)} · Pendiente $${this.formatMoney(outstanding)}`;
    }
    if (sale.method === PaymentMethod.MIXED) {
      const card = Math.min(total, paidCard);
      const cash = Math.max(0, total - card);
      return `Tarjeta $${this.formatMoney(card)} · Efectivo $${this.formatMoney(cash)}`;
    }
    return `Cobrado $${this.formatMoney(total)}`;
  }
}
