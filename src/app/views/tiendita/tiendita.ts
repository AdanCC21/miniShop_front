import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { GetMyShop } from '../../api/shop';
import { GetSales } from '../../api/sales';
import { GetCurShopReg } from '../../api/shopRegister';
import { SessionService } from '../../auth/session.service';
import { SaleDTO } from '../../dto/sale.dto';
import { ShopDTO } from '../../dto/shop.dto';
import { ShopRegisterDTO } from '../../dto/shopRegister.dto';
import { PaymentMethod } from '../../entities/PaymentMethod';
import { ButtonComponent } from '../../ui/button/button';
import { RegisterClosureDetails } from '../../ui/register-closure-details-modal/register-closure-details-modal';
import { RegisterClosureDetailsModalComponent } from '../../ui/register-closure-details-modal/register-closure-details-modal';
import { ToastService } from '../../ui/toast/toast.service';

interface MonthlySummary {
  month: string;
  sales: number;
  productsSold: number;
  total: number;
}

interface TodaySummary {
  date: string;
  sales: number;
  productsSold: number;
  total: number;
  history: SaleDTO[];
}

@Component({
  selector: 'app-tiendita',
  imports: [ButtonComponent, RegisterClosureDetailsModalComponent],
  templateUrl: './tiendita.html',
})
export class TienditaComponent implements OnInit {
  protected readonly session = inject(SessionService);
  protected readonly user = this.session.user;
  protected readonly toast = inject(ToastService);

  protected readonly shopDetails = signal<ShopDTO | null>(null);
  protected readonly shopDetailsLoading = signal(true);
  protected readonly shopInfoExpanded = signal(false);
  protected readonly todayDetailsOpen = signal(false);
  protected readonly sales = signal<SaleDTO[]>([]);
  protected readonly register = signal<ShopRegisterDTO | null>(null);

  protected toggleShopInfo(): void {
    this.shopInfoExpanded.update((expanded) => !expanded);
  }

  async ngOnInit(): Promise<void> {
    await this.loadShop();
  }

  protected async loadShop(): Promise<void> {
    this.shopDetailsLoading.set(true);
    const [shop, sales, register] = await Promise.all([
      GetMyShop(this.toast),
      GetSales(false, this.toast),
      GetCurShopReg(this.toast),
    ]);
    this.shopDetails.set(shop);
    this.sales.set(sales ?? []);
    this.register.set(register);
    this.shopDetailsLoading.set(false);
  }

  protected readonly currentMonth = computed(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });

  protected readonly currentSales = computed<MonthlySummary>(() => {
    let sales = 0;
    let productsSold = 0;
    let total = 0;
    for (const sale of this.sales()) {
      if (!this.saleDayISO(sale).startsWith(this.currentMonth())) continue;
      sales += 1;
      productsSold += this.saleQuantity(sale);
      total += Number(sale.total);
    }
    return { month: this.currentMonth(), sales, productsSold, total };
  });

  protected readonly todayClosure = computed<TodaySummary>(() => {
    const date = this.todayISO();
    const history = this.sales().filter((sale) => this.saleDayISO(sale) === date);
    return {
      date,
      sales: history.length,
      productsSold: history.reduce((sum, sale) => sum + this.saleQuantity(sale), 0),
      total: history.reduce((sum, sale) => sum + Number(sale.total), 0),
      history,
    };
  });

  protected readonly todayCashSales = computed(() =>
    this.todayClosure().history.reduce(
      (sum, sale) => sum + this.saleCashReceived(sale) + this.saleCardReceived(sale),
      0,
    )
  );

  protected readonly todayClosureDetails = computed<RegisterClosureDetails>(() => {
    const summary = this.todayClosure();
    const register = this.register();
    const isSameDayRegister = !!register && this.dateISO(register.openedAt) === summary.date;
    const cashReceived = summary.history.reduce((sum, sale) => sum + this.saleCashReceived(sale), 0);
    const cardReceived = summary.history.reduce((sum, sale) => sum + this.saleCardReceived(sale), 0);
    const creditOutstanding = summary.history.reduce((sum, sale) => {
      if (sale.method !== PaymentMethod.CREDIT) return sum;
      return sum + Math.max(0, Number(sale.total) - Number(sale.paidCash) - Number(sale.paidCard));
    }, 0);

    return {
      date: this.localDate(summary.date),
      openedAt: isSameDayRegister ? register.openedAt : null,
      closedAt: isSameDayRegister && !register.isOpen ? register.closedAt : null,
      isOpen: isSameDayRegister && register.isOpen,
      salesCount: summary.sales,
      productsSold: summary.productsSold,
      totalSales: summary.total,
      totalCollected: cashReceived + cardReceived,
      openingCash: isSameDayRegister ? Number(register.openingCash) : 0,
      cashReceived,
      cardReceived,
      creditOutstanding,
      sales: summary.history,
    };
  });

  protected openTodayDetails(): void {
    this.todayDetailsOpen.set(true);
  }

  protected closeTodayDetails(): void {
    this.todayDetailsOpen.set(false);
  }

  protected monthLabel(month: string): string {
    const [year, monthIndex] = month.split('-').map(Number);
    const name = new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(
      new Date(year, monthIndex - 1, 1),
    );
    return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
  }

  protected formatPrice(value: number): string {
    return value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  protected formatShopDate(value: Date | string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  }

  protected todayLabel(): string {
    const [year, month, day] = this.todayISO().split('-').map(Number);
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(new Date(year, month - 1, day));
  }

  private todayISO(): string {
    return this.dateISO(new Date());
  }

  private dateISO(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private localDate(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private saleDayISO(sale: SaleDTO): string {
    return this.dateISO(sale.date);
  }

  private saleQuantity(sale: SaleDTO): number {
    return (sale.details ?? []).reduce((sum, detail) => sum + Number(detail.quantity), 0);
  }

  private saleCashReceived(sale: SaleDTO): number {
    const total = Number(sale.total);
    switch (sale.method ?? PaymentMethod.CASH) {
      case PaymentMethod.CARD: return 0;
      case PaymentMethod.MIXED: return Math.max(0, total - Number(sale.paidCard));
      case PaymentMethod.CREDIT: return Number(sale.paidCash);
      default: return total;
    }
  }

  private saleCardReceived(sale: SaleDTO): number {
    const total = Number(sale.total);
    switch (sale.method ?? PaymentMethod.CASH) {
      case PaymentMethod.CARD: return total;
      case PaymentMethod.MIXED: return Math.min(total, Number(sale.paidCard));
      case PaymentMethod.CREDIT: return Number(sale.paidCard);
      default: return 0;
    }
  }
}
