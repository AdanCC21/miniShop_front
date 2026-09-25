import { Component, OnInit, computed, inject, signal } from '@angular/core';

import { StoreService } from '../../store.service';
import { PaymentMethod } from '../../entities/PaymentMethod';
import { formatDate, Order } from '../orders/orders.data';
import { ButtonComponent } from '../../ui/button/button';
import { InputComponent } from '../../ui/input/input';
import { ModalComponent } from '../../ui/modal/modal';
import { ToastService } from '../../ui/toast/toast.service';
import { GetSales } from '../../api/sales';
import { SaleDTO } from '../../dto/sale.dto';

interface DailySummary {
  date: string;
  sales: number;
  productsSold: number;
  total: number;
}

interface MonthlySummary {
  month: string;
  sales: number;
  productsSold: number;
  total: number;
}

interface TodayProductLine {
  id: string;
  code: string;
  name: string;
  price: number;
  quantity: number;
}

interface PaymentLine {
  label: string;
  amount: number;
}

@Component({
  selector: 'app-tiendita',
  imports: [ButtonComponent, InputComponent, ModalComponent],
  templateUrl: './tiendita.html'
})
export class TienditaComponent implements OnInit {
  private readonly store = inject(StoreService);
  protected readonly toast = inject(ToastService);

  protected readonly PaymentMethod = PaymentMethod;

  protected readonly storeUid = 'ST-0001';
  protected readonly storeName = signal('miniShop');
  protected readonly saved = signal(false);

  protected readonly draftOpenDays = signal<number[]>([...this.store.openDays()]);

  protected readonly weekDays: { value: number; label: string }[] = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' }
  ];

  protected readonly currentMonth = computed(() => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  });

  protected readonly closuresPage = signal(0);
  protected readonly closuresPageSize = 5;

  protected readonly sales = signal<SaleDTO[]>([]);

  protected readonly loading = signal(true);

  async ngOnInit() {
    const sales = await GetSales(false, this.toast);
    if (sales) {
      this.sales.set(sales);
    }
    this.loading.set(false);
  }

  protected readonly currentMonthClosures = computed<DailySummary[]>(() => {
    const [year, month] = this.currentMonth().split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const byDay = new Map<string, { sales: number; productsSold: number; total: number }>();
    for (const sale of this.sales()) {
      const day = this.saleDayISO(sale);
      if (!day.startsWith(this.currentMonth())) {
        continue;
      }
      const entry = byDay.get(day) ?? { sales: 0, productsSold: 0, total: 0 };
      entry.sales += 1;
      entry.productsSold += this.saleQuantity(sale);
      entry.total += Number(sale.total);
      byDay.set(day, entry);
    }
    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const date = `${this.currentMonth()}-${String(day).padStart(2, '0')}`;
      const { sales, productsSold, total } = byDay.get(date) ?? { sales: 0, productsSold: 0, total: 0 };
      return { date, sales, productsSold, total };
    });
  });

  protected readonly closuresPages = computed(() =>
    Math.ceil(this.currentMonthClosures().length / this.closuresPageSize)
  );

  protected readonly visibleClosures = computed(() => {
    const start = this.closuresPage() * this.closuresPageSize;
    return this.currentMonthClosures().slice(start, start + this.closuresPageSize);
  });

  protected readonly closuresPageLabel = computed(() => {
    const total = this.currentMonthClosures().length;
    const start = this.closuresPage() * this.closuresPageSize + 1;
    const end = Math.min(this.closuresPage() * this.closuresPageSize + this.closuresPageSize, total);
    return `${start}-${end} de ${total}`;
  });

  protected prevClosuresPage(): void {
    this.closuresPage.update((page) => Math.max(0, page - 1));
  }

  protected nextClosuresPage(): void {
    this.closuresPage.update((page) => Math.min(this.closuresPages() - 1, page + 1));
  }

  protected readonly todayClosure = computed(() => {
    const today = this.todayISO();
    const history = this.sales().filter((sale) => this.saleDayISO(sale) === today);
    return {
      date: today,
      initial: 0,
      sales: history.length,
      productsSold: history.reduce((sum, sale) => sum + this.saleQuantity(sale), 0),
      total: history.reduce((sum, sale) => sum + Number(sale.total), 0),
      history
    };
  });

  protected readonly todayProducts = computed<TodayProductLine[]>(() => {
    const byId = new Map<string, TodayProductLine>();
    for (const sale of this.todayClosure()?.history ?? []) {
      for (const detail of sale.details ?? []) {
        const existing = byId.get(detail.productId);
        if (existing) {
          existing.quantity += detail.quantity;
        } else {
          byId.set(detail.productId, {
            id: detail.productId,
            code: detail.product?.code ?? '-',
            name: detail.product?.name ?? 'Producto',
            price: detail.unitPrice,
            quantity: detail.quantity
          });
        }
      }
    }
    return [...byId.values()];
  });

  protected readonly todaySales = computed(() =>
    (this.todayClosure()?.history ?? []).reduce((sum, sale) => sum + Number(sale.total), 0)
  );

  protected readonly todayCashSales = computed(() => {
    const history = this.todayClosure()?.history ?? [];
    if (history.length === 0) {
      return this.todayClosure()?.total ?? 0;
    }
    return history.reduce((sum, sale) => sum + this.saleCashPortion(sale), 0);
  });

  protected readonly todayTotalProducts = computed(() =>
    this.todayProducts().reduce((sum, line) => sum + line.quantity, 0)
  );

  protected readonly todayTotalsByMethod = computed<Record<PaymentMethod, number>>(() => {
    const history = this.todayClosure()?.history ?? [];
    return history.reduce(
      (acc, sale) => {
        const method = sale.method ?? PaymentMethod.CASH;
        acc[method] += Number(sale.total);
        return acc;
      },
      {
        [PaymentMethod.CASH]: 0,
        [PaymentMethod.CARD]: 0,
        [PaymentMethod.MIXED]: 0,
        [PaymentMethod.CREDIT]: 0
      }
    );
  });

  protected readonly todayCountByMethod = computed<Record<PaymentMethod, number>>(() => {
    const history = this.todayClosure()?.history ?? [];
    return history.reduce(
      (acc, sale) => {
        const method = sale.method ?? PaymentMethod.CASH;
        acc[method] += 1;
        return acc;
      },
      {
        [PaymentMethod.CASH]: 0,
        [PaymentMethod.CARD]: 0,
        [PaymentMethod.MIXED]: 0,
        [PaymentMethod.CREDIT]: 0
      }
    );
  });

  protected readonly todayFiadoTotal = computed(() => {
    const history = this.todayClosure()?.history ?? [];
    return history.reduce(
      (sum, sale) =>
        sum +
        (sale.method === PaymentMethod.CREDIT
          ? Number(sale.total) - Number(sale.paidCard) - Number(sale.paidCash)
          : 0),
      0
    );
  });

  protected readonly todayFiadoCount = computed(() => {
    const history = this.todayClosure()?.history ?? [];
    return history.filter((sale) => (sale.method ?? PaymentMethod.CASH) === PaymentMethod.CREDIT).length;
  });

  protected paymentLines(sale: SaleDTO): PaymentLine[] {
    const method = sale.method ?? PaymentMethod.CASH;
    if (method === PaymentMethod.MIXED) {
      return [
        { label: 'Tarjeta', amount: Number(sale.paidCard) },
        { label: 'Efectivo', amount: Number(sale.total) - Number(sale.paidCard) }
      ];
    }
    if (method === PaymentMethod.CREDIT) {
      const paid = Number(sale.paidCard) + Number(sale.paidCash);
      return [
        { label: 'Cobrado', amount: paid },
        { label: 'Fiado', amount: Number(sale.total) - paid }
      ];
    }
    return [];
  }

  private saleCashPortion(sale: SaleDTO): number {
    const method = sale.method ?? PaymentMethod.CASH;
    if (method === PaymentMethod.CARD) {
      return 0;
    }
    if (method === PaymentMethod.CREDIT) {
      return Number(sale.paidCard) + Number(sale.paidCash);
    }
    if (method === PaymentMethod.MIXED) {
      return Number(sale.total) - Number(sale.paidCard);
    }
    return Number(sale.total);
  }

  protected paymentMethodLabel(method: PaymentMethod | undefined): string {
    if (method === PaymentMethod.CARD) {
      return 'Tarjeta';
    }
    if (method === PaymentMethod.MIXED) {
      return 'Múltiple';
    }
    if (method === PaymentMethod.CREDIT) {
      return 'Fiado';
    }
    return 'Efectivo';
  }

  protected saleProducts(sale: SaleDTO): number {
    return (sale.details ?? []).reduce((sum, line) => sum + line.quantity, 0);
  }

  protected saleTime(sale: SaleDTO): string {
    const date = this.saleDate(sale);
    return new Intl.DateTimeFormat('es-MX', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  protected readonly todayDetailsOpen = signal(false);

  protected openTodayDetails(): void {
    this.todayDetailsOpen.set(true);
  }

  protected closeTodayDetails(): void {
    this.todayDetailsOpen.set(false);
  }

  protected readonly currentSales = computed<MonthlySummary>(() => {
    let sales = 0;
    let productsSold = 0;
    let total = 0;
    for (const sale of this.sales()) {
      if (!this.saleDayISO(sale).startsWith(this.currentMonth())) {
        continue;
      }
      sales += 1;
      productsSold += this.saleQuantity(sale);
      total += Number(sale.total);
    }
    return { month: this.currentMonth(), sales, productsSold, total };
  });

  protected readonly lastMonths = computed<MonthlySummary[]>(() => {
    const today = new Date();
    const months: string[] = [];
    for (let index = 0; index < 3; index += 1) {
      const date = new Date(today.getFullYear(), today.getMonth() - index, 1);
      months.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
    }
    return months.map((month) => {
      let sales = 0;
      let productsSold = 0;
      let total = 0;
      for (const sale of this.sales()) {
        if (!this.saleDayISO(sale).startsWith(month)) {
          continue;
        }
        sales += 1;
        productsSold += this.saleQuantity(sale);
        total += Number(sale.total);
      }
      return { month, sales, productsSold, total };
    });
  });

  protected readonly averageTicket = computed(() => {
    const summary = this.currentSales();
    return summary.sales > 0 ? summary.total / summary.sales : 0;
  });

  protected readonly conflicts = computed<Order[]>(() => {
    const days = this.draftOpenDays();
    const today = this.todayISO();
    return this.store.orders().filter((order) => {
      if (order.status === 'finalizado') {
        return false;
      }
      if (order.recurrence) {
        if (order.recurrence.type === 'dias_semana') {
          return (order.recurrence.days ?? []).some((day) => !days.includes(day));
        }
        if (order.recurrence.type === 'diario') {
          return days.length < 7;
        }
        const [year, month, day] = order.expectedDate.split('-').map(Number);
        return !days.includes(new Date(year, month - 1, day).getDay());
      }
      if (order.expectedDate < today) {
        return false;
      }
      const [year, month, day] = order.expectedDate.split('-').map(Number);
      return !days.includes(new Date(year, month - 1, day).getDay());
    });
  });

  protected onNameChange(value: string): void {
    this.storeName.set(value);
    this.saved.set(false);
  }

  protected toggleOpenDay(day: number): void {
    this.saved.set(false);
    this.draftOpenDays.update((days) =>
      days.includes(day) ? days.filter((item) => item !== day) : [...days, day]
    );
  }

  protected closeConflicts(): void {
    this.draftOpenDays.set([...this.store.openDays()]);
  }

  protected resolveFinalize(order: Order): void {
    this.store.orders.update((list) =>
      list.map((item) => (item.id === order.id ? { ...item, status: 'finalizado' as const } : item))
    );
    this.toast.success('Pedido finalizado', `${order.company} se marcó como finalizado.`);
  }

  protected resolveCancel(order: Order): void {
    this.store.orders.update((list) => list.filter((item) => item.id !== order.id));
    this.toast.warning('Pedido cancelado', `${order.company} fue cancelado.`);
  }

  protected save(): void {
    if (this.conflicts().length > 0) {
      this.toast.error(
        'Conflicto de horario',
        'Resuelve los pedidos que se reciben en días cerrados antes de guardar.'
      );
      return;
    }
    this.store.openDays.set([...this.draftOpenDays()]);
    this.storeName.set(this.storeName().trim());
    this.saved.set(true);
    this.toast.success('Cambios guardados', 'El horario de tu tiendita se actualizó.');
  }

  protected monthLabel(month: string): string {
    const [year, monthIndex] = month.split('-').map(Number);
    const name = new Intl.DateTimeFormat('es-MX', { month: 'long' }).format(
      new Date(year, monthIndex - 1, 1)
    );
    return `${name.charAt(0).toUpperCase()}${name.slice(1)} ${year}`;
  }

  protected formatPrice(value: number): string {
    return value.toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  protected formatDate(date: string): string {
    return formatDate(date);
  }

  protected todayLabel(): string {
    const today = this.todayISO();
    const [year, month, day] = today.split('-').map(Number);
    return new Intl.DateTimeFormat('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    }).format(new Date(year, month - 1, day));
  }

  private todayISO(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private saleDate(sale: SaleDTO): Date {
    return sale.date instanceof Date ? sale.date : new Date(sale.date);
  }

  private saleDayISO(sale: SaleDTO): string {
    const date = this.saleDate(sale);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private saleQuantity(sale: SaleDTO): number {
    return (sale.details ?? []).reduce((sum, line) => sum + line.quantity, 0);
  }

  protected deliveryDay(order: Order): string {
    const [year, month, day] = order.expectedDate.split('-').map(Number);
    const name = new Intl.DateTimeFormat('es-MX', { weekday: 'long' }).format(
      new Date(year, month - 1, day)
    );
    return `${name.charAt(0).toUpperCase()}${name.slice(1)}`;
  }
}