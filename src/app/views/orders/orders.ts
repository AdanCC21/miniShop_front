import { Component, computed, inject, signal } from '@angular/core';

import {
  findSupplierByName,
  formatDate,
  Order,
  OrderProduct,
  RecurrenceType,
  Supplier,
  SupplierProduct,
  SUPPLIERS
} from './orders.data';
import { dayOfMonth, nextOccurrence, recurrenceLabel as getRecurrenceLabel, weekdayName } from './recurrence';
import { ModalComponent } from '../../ui/modal/modal';
import { ButtonComponent } from '../../ui/button/button';
import { ConfirmModalComponent } from '../../ui/confirm-modal/confirm-modal';
import { InputComponent } from '../../ui/input/input';
import { SearchSuggestionsComponent } from '../../ui/search-suggestions/search-suggestions';
import { SelectComponent, SelectOption } from '../../ui/select/select';
import { ToastService } from '../../ui/toast/toast.service';
import { StoreService } from '../../store.service';

export type OrdersTab = 'waiting' | 'unconfirmed' | 'finalized';
export type DateFilter = 'todos' | 'hoy' | 'semana';
export type OrderSort = 'fecha' | 'proveedor' | 'total';

@Component({
  selector: 'app-orders',
  imports: [ButtonComponent, ConfirmModalComponent, InputComponent, ModalComponent, SearchSuggestionsComponent, SelectComponent],
  templateUrl: './orders.html'
})
export class OrdersComponent {
  protected readonly toast = inject(ToastService);
  private readonly store = inject(StoreService);
  protected readonly orders = this.store.orders;
  protected readonly tab = signal<OrdersTab>('waiting');
  protected readonly selectedOrder = signal<Order | null>(null);
  protected readonly cancelTarget = signal<Order | null>(null);
  protected readonly finalizeTarget = signal<Order | null>(null);
  protected readonly deliveryTarget = signal<Order | null>(null);
  protected readonly receivedSaveConfirm = signal(false);

  protected readonly upcoming = signal(true);

  protected readonly tabs: { id: OrdersTab; label: string }[] = [
    { id: 'waiting', label: 'En espera' },
    { id: 'unconfirmed', label: 'Pedidos no confirmados' },
    { id: 'finalized', label: 'Finalizados' }
  ];

  protected readonly dateFilters: { id: DateFilter; label: string }[] = [
    { id: 'todos', label: 'Todos' },
    { id: 'hoy', label: 'Llega hoy' },
    { id: 'semana', label: 'Llega esta semana' }
  ];

  protected readonly sortOptions: SelectOption[] = [
    { value: 'fecha', label: 'Fecha de entrega' },
    { value: 'proveedor', label: 'Proveedor (A-Z)' },
    { value: 'total', label: 'Total de productos' }
  ];

  protected readonly dateFilter = signal<DateFilter>('todos');
  protected readonly supplierFilter = signal('');
  protected readonly sortBy = signal<OrderSort>('fecha');

  protected readonly newOrderOpen = signal(false);
  protected readonly providerQuery = signal('');
  protected readonly productQuery = signal('');
  protected readonly addQty = signal(1);
  protected readonly manualName = signal('');
  protected readonly manualQty = signal(1);
  protected readonly manualUnit = signal<'unidad' | 'kg'>('unidad');
  protected readonly manualPrice = signal(0);
  protected readonly expectedDate = signal(this.defaultExpectedDate());
  protected readonly recurrence = signal<RecurrenceType | null>(null);
  protected readonly recurrenceDays = signal<number[]>([]);
  protected readonly cart = signal<OrderProduct[]>([]);
  protected readonly editingOrderId = signal<string | null>(null);
  protected readonly receivedOrder = signal<Order | null>(null);
  protected readonly receivedProducts = signal<OrderProduct[]>([]);

  protected readonly weekDays: { value: number; label: string }[] = [
    { value: 0, label: 'Dom' },
    { value: 1, label: 'Lun' },
    { value: 2, label: 'Mar' },
    { value: 3, label: 'Mié' },
    { value: 4, label: 'Jue' },
    { value: 5, label: 'Vie' },
    { value: 6, label: 'Sáb' }
  ];

  getWeekDay(): string {
    return weekdayName(this.expectedDate());
  }

  getDaySelected(): string {
    return String(dayOfMonth(this.expectedDate()));
  }

  protected readonly waitingOrders = computed(() =>
    this.orders().filter(
      (order) =>
        !order.recurrence && order.status !== 'finalizado' && order.expectedDate >= this.todayISO()
    )
  );

  protected readonly unconfirmedOrders = computed(() =>
    this.orders().filter(
      (order) => !order.recurrence && order.status !== 'finalizado' && order.expectedDate < this.todayISO()
    )
  );

  protected readonly finalizedOrders = computed(() =>
    this.orders().filter((order) => !order.recurrence && order.status === 'finalizado')
  );

  protected readonly scheduledOrders = computed(() => {
    const today = this.todayISO();
    return this.orders()
      .filter((order) => order.recurrence && order.status !== 'finalizado')
      .map((order) => ({ ...order, expectedDate: this.nextDeliveryDate(order, today) }));
  });

  protected readonly visibleOrders = computed(() => {
    let base: Order[];
    switch (this.tab()) {
      case 'unconfirmed':
        base = this.unconfirmedOrders();
        break;
      case 'finalized':
        base = this.finalizedOrders();
        break;
      case 'waiting':
      default:
        base = this.waitingOrders();
    }
    return this.applySort(this.applyFilter(base));
  });

  protected readonly supplierOptions = computed<SelectOption[]>(() => {
    const companies = [...new Set(this.orders().map((order) => order.company))].sort((a, b) =>
      a.localeCompare(b)
    );
    return [{ value: '', label: 'Todos' }, ...companies.map((company) => ({ value: company, label: company }))];
  });

  protected readonly emptyMessage = computed(() => {
    switch (this.tab()) {
      case 'unconfirmed':
        return 'No hay pedidos sin confirmar.';
      case 'finalized':
        return 'Aún no hay pedidos finalizados.';
      case 'waiting':
      default:
        return 'No hay pedidos en espera.';
    }
  });

  protected readonly suggestions = computed(() => {
    const query = this.providerQuery().trim().toLowerCase();
    if (!query) {
      return [];
    }
    return SUPPLIERS.filter((supplier) => supplier.name.toLowerCase().includes(query));
  });

  protected readonly matchedSupplier = computed<Supplier | undefined>(() =>
    findSupplierByName(this.providerQuery())
  );

  protected readonly providerNotFound = computed(() => {
    const query = this.providerQuery().trim();
    return query.length > 0 && !this.matchedSupplier();
  });

  protected readonly visibleCatalogProducts = computed<SupplierProduct[]>(() => {
    const supplier = this.matchedSupplier();
    if (!supplier) {
      return [];
    }
    const query = this.productQuery().trim().toLowerCase();
    if (!query) {
      return supplier.products;
    }
    return supplier.products.filter((product) => product.name.toLowerCase().includes(query));
  });

  protected readonly cartTotal = computed(() =>
    this.cart().reduce((sum, item) => sum + item.price * item.quantity, 0)
  );

  protected lineTotal(item: OrderProduct): number {
    return item.price * item.quantity;
  }

  protected selectTab(tab: OrdersTab): void {
    this.tab.set(tab);
    this.resetFilters();
  }

  protected selectDateFilter(filter: DateFilter): void {
    this.dateFilter.set(filter);
  }

  protected onSupplierFilterChange(value: string): void {
    this.supplierFilter.set(value);
  }

  protected onSortChange(value: string): void {
    this.sortBy.set(value as OrderSort);
  }

  private resetFilters(): void {
    this.dateFilter.set('todos');
    this.supplierFilter.set('');
  }

  private applyFilter(orders: Order[]): Order[] {
    const supplier = this.supplierFilter();
    if (supplier) {
      orders = orders.filter((order) => order.company === supplier);
    }
    const today = this.todayISO();
    switch (this.dateFilter()) {
      case 'hoy':
        return orders.filter((order) => order.expectedDate === today);
      case 'semana':
        return orders.filter((order) => order.expectedDate >= today && order.expectedDate <= this.weekEndISO());
      default:
        return orders;
    }
  }

  private applySort(orders: Order[]): Order[] {
    switch (this.sortBy()) {
      case 'proveedor':
        return [...orders].sort((a, b) => a.company.localeCompare(b.company));
      case 'total':
        return [...orders].sort((a, b) => this.totalProducts(b) - this.totalProducts(a));
      case 'fecha':
      default:
        return [...orders].sort((a, b) => a.expectedDate.localeCompare(b.expectedDate));
    }
  }

  protected openDetails(order: Order): void {
    this.selectedOrder.set(order);
  }

  protected closeDetails(): void {
    this.selectedOrder.set(null);
  }

  protected askFinalize(order: Order): void {
    this.finalizeTarget.set(order);
  }

  protected cancelFinalize(): void {
    this.finalizeTarget.set(null);
  }

  protected markAsFinalized(): void {
    const order = this.finalizeTarget();
    this.finalizeTarget.set(null);
    if (!order) {
      return;
    }
    this.orders.update((list) =>
      list.map((item) => (item.id === order.id ? { ...item, status: 'finalizado' as const } : item))
    );
    this.closeDetails();
    this.toast.success('Pedido finalizado', `${order.company} se marcó como finalizado.`);
  }

  protected askDelivery(order: Order): void {
    this.deliveryTarget.set(order);
  }

  protected cancelDelivery(): void {
    this.deliveryTarget.set(null);
  }

  protected confirmDelivery(): void {
    const order = this.deliveryTarget();
    this.deliveryTarget.set(null);
    if (!order) {
      return;
    }
    this.registerDelivery(order);
  }

  protected registerDelivery(order: Order): void {
    const today = this.todayISO();
    const current = this.nextDeliveryDate(order, today);
    const next = nextOccurrence(current, order.recurrence!.type, order.recurrence?.days);
    this.orders.update((list) =>
      list.map((item) =>
        item.id === order.id
          ? {
              ...item,
              expectedDate: next,
              products: item.products.map(({ received: _received, ...rest }) => rest)
            }
          : item
      )
    );
    this.closeDetails();
    this.toast.success('Entrega registrada', `Próxima entrega: ${formatDate(next)}`);
  }

  protected askCancelScheduled(order: Order): void {
    this.cancelTarget.set(order);
  }

  protected cancelCancel(): void {
    this.cancelTarget.set(null);
  }

  protected cancelScheduled(): void {
    const order = this.cancelTarget();
    this.cancelTarget.set(null);
    if (!order) {
      return;
    }
    this.orders.update((list) => list.filter((item) => item.id !== order.id));
    this.closeDetails();
    this.toast.warning('Programación cancelada', `${order.company} ya no se repetirá.`);
  }

  protected editScheduled(order: Order): void {
    this.editingOrderId.set(order.id);
    this.providerQuery.set(order.company);
    this.productQuery.set('');
    this.addQty.set(1);
    this.manualName.set('');
    this.manualQty.set(1);
    this.manualUnit.set('unidad');
    this.manualPrice.set(0);
    this.expectedDate.set(order.expectedDate);
    this.recurrence.set(order.recurrence?.type ?? null);
    this.recurrenceDays.set(order.recurrence?.days ?? []);
    this.cart.set(order.products.map((product) => ({ ...product })));
    this.closeDetails();
    this.newOrderOpen.set(true);
  }

  protected openReceived(order: Order): void {
    this.receivedProducts.set(
      order.products.map((product) => ({
        ...product,
        received: product.received ?? product.quantity
      }))
    );
    this.receivedOrder.set(order);
  }

  protected closeReceived(): void {
    this.receivedOrder.set(null);
    this.receivedProducts.set([]);
  }

  protected onReceivedChange(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const amount = value === '' ? 0 : Number(value);
    this.receivedProducts.update((items) =>
      items.map((item, i) => (i === index ? { ...item, received: amount } : item))
    );
  }

  protected askSaveReceived(): void {
    this.receivedSaveConfirm.set(true);
  }

  protected cancelSaveReceived(): void {
    this.receivedSaveConfirm.set(false);
  }

  protected confirmSaveReceived(): void {
    this.receivedSaveConfirm.set(false);
    this.saveReceived();
  }

  protected saveReceived(): void {
    const order = this.receivedOrder();
    if (!order) {
      return;
    }
    const products = this.receivedProducts();
    this.orders.update((list) =>
      list.map((item) => (item.id === order.id ? { ...item, products } : item))
    );
    this.selectedOrder.update((current) =>
      current && current.id === order.id ? { ...current, products } : current
    );
    this.closeReceived();
    this.toast.success('Recibido registrado', 'Las cantidades recibidas se actualizaron.');
  }

  protected selectRecurrence(type: RecurrenceType | null): void {
    this.recurrence.set(this.recurrence() === type ? null : type);
    if (this.recurrence() !== 'dias_semana') {
      this.recurrenceDays.set([]);
    }
  }

  protected toggleRecurrenceDay(day: number): void {
    this.recurrenceDays.update((days) =>
      days.includes(day) ? days.filter((item) => item !== day) : [...days, day]
    );
  }

  protected openNewOrder(): void {
    this.editingOrderId.set(null);
    this.expectedDate.set(this.defaultExpectedDate());
    this.recurrence.set(null);
    this.recurrenceDays.set([]);
    this.newOrderOpen.set(true);
  }

  protected closeNewOrder(): void {
    this.newOrderOpen.set(false);
    this.resetNewOrder();
  }

  protected onProviderChange(value: string): void {
    this.providerQuery.set(value);
  }

  protected selectSupplier(supplier: Supplier): void {
    this.providerQuery.set(supplier.name);
    this.productQuery.set('');
    this.addQty.set(1);
  }

  protected onProductQueryChange(value: string): void {
    this.productQuery.set(value);
  }

  protected onAddQtyChange(value: string): void {
    this.addQty.set(value === '' ? 0 : Number(value));
  }

  protected onManualNameChange(value: string): void {
    this.manualName.set(value);
  }

  protected onManualQtyChange(value: string): void {
    this.manualQty.set(value === '' ? 0 : Number(value));
  }

  protected onManualUnitChange(unit: 'unidad' | 'kg'): void {
    this.manualUnit.set(unit);
  }

  protected onManualPriceChange(value: string): void {
    this.manualPrice.set(value === '' ? 0 : Number(value));
  }

  protected onExpectedDateChange(value: string): void {
    this.expectedDate.set(value);
  }

  protected addFromCatalog(product: SupplierProduct, amount?: number): void {
    if (typeof amount === 'number' && amount <= 0) {
      console.log(amount);
      this.toast.error("Cantidad incorrecta", "La cantidad del producto no puede ser 0 o negativa")
      return;
    }
    const quantity = this.addQty();
    if (quantity <= 0) {
      this.toast.error("Cantidad incorrecta", "La cantidad del producto no puede ser 0 o negativa")
      return;
    }
    this.cart.update((items) => [...items, { name: product.name, quantity: amount ?? quantity, price: product.price }]);
    this.toast.success("Exito", `${product.name} agregado correctamente`);

    this.addQty.set(1);
  }

  protected addManualWithCatalog(productName: string, amount: number = 1) {
    const product = this.visibleCatalogProducts().find(pr => pr.name === productName) || null;
    if (amount <= 0) {
      this.toast.error("Cantidad incorrecta", "La cantidad del producto no puede ser 0 o negativa")
      return
    };
    if (!product) {
      this.toast.error("Cantidad incorrecta", "El producto es invalido");
      return
    };
    this.cart.update((items) => [...items, { name: product.name, quantity: amount, price: product.price }]);
    this.toast.success("Exito", `${product.name} agregado correctamente`);

    this.addQty.set(1);
    this.productQuery.set("");
  }

  protected addManual(): void {
    const name = this.manualName().trim();
    const quantity = this.manualQty();
    if (!name || quantity <= 0) {
      return;
    }
    this.cart.update((items) => [
      ...items,
      { name, quantity, price: this.manualPrice(), unit: this.manualUnit() }
    ]);
    this.manualName.set('');
    this.manualQty.set(1);
    this.manualUnit.set('unidad');
    this.manualPrice.set(0);
  }

  protected removeCartItem(index: number): void {
    this.cart.update((items) => items.filter((_, i) => i !== index));
  }

  protected createOrder(): void {
    const provider = this.providerQuery().trim();
    if (!provider || this.cart().length === 0 || !this.expectedDate()) {
      return;
    }
    if (this.recurrence() === 'dias_semana' && this.recurrenceDays().length === 0) {
      this.toast.error('Selecciona al menos un día', 'Debes marcar qué días de la semana se repite.');
      return;
    }
    const closedError = this.validateDeliveryDays();
    if (closedError) {
      this.toast.error('Tiendita cerrada', closedError);
      return;
    }
    const supplier = findSupplierByName(provider);
    const recurrence = this.recurrence();
    const editingId = this.editingOrderId();
    const recurrenceData = recurrence
      ? recurrence === 'dias_semana'
        ? { type: recurrence, days: this.recurrenceDays() }
        : { type: recurrence }
      : undefined;

    if (editingId) {
      this.orders.update((list) =>
        list.map((order) =>
          order.id === editingId
            ? {
                ...order,
                company: provider,
                companyColor: supplier?.color ?? '#6b7280',
                products: this.cart(),
                expectedDate: this.expectedDate(),
                recurrence: recurrenceData
              }
            : order
        )
      );
      this.closeNewOrder();
      this.toast.success('Pedido actualizado', 'Cambios guardados correctamente.');
      return;
    }

    const order: Order = {
      id: `ORD-${String(this.orders().length + 1).padStart(3, '0')}`,
      company: provider,
      companyColor: supplier?.color ?? '#6b7280',
      products: this.cart(),
      createdDate: this.todayISO(),
      expectedDate: this.expectedDate(),
      status: 'pendiente',
      recurrence: recurrenceData
    };
    this.orders.update((list) => [...list, order]);
    this.closeNewOrder();
    this.toast.success(
      'Pedido creado',
      recurrence
        ? `Se repetirá ${getRecurrenceLabel(recurrence, order.expectedDate, this.recurrenceDays()).toLowerCase()}.`
        : 'Pedido registrado.'
    );
  }

  private validateDeliveryDays(): string | null {
    if (this.recurrence() === 'dias_semana') {
      const closed = this.recurrenceDays().filter((day) => !this.store.isOpenDay(day));
      if (closed.length > 0) {
        const names = closed
          .map((day) => ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][day])
          .join(', ');
        return `La tienda está cerrada los ${names}. Ajusta los días de repetición.`;
      }
      return null;
    }
    if (!this.store.isOpen(this.expectedDate())) {
      const [year, month, day] = this.expectedDate().split('-').map(Number);
      const name = new Intl.DateTimeFormat('es-MX', { weekday: 'long' }).format(
        new Date(year, month - 1, day)
      );
      return `La tienda está cerrada el día ${name}. Elige otra fecha de entrega.`;
    }
    return null;
  }

  private resetNewOrder(): void {
    this.providerQuery.set('');
    this.productQuery.set('');
    this.addQty.set(1);
    this.manualName.set('');
    this.manualQty.set(1);
    this.manualUnit.set('unidad');
    this.manualPrice.set(0);
    this.expectedDate.set(this.defaultExpectedDate());
    this.recurrence.set(null);
    this.recurrenceDays.set([]);
    this.editingOrderId.set(null);
    this.cart.set([]);
  }

  private defaultExpectedDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return this.toISODate(date);
  }

  private todayISO(): string {
    return this.toISODate(new Date());
  }

  private weekEndISO(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return this.toISODate(date);
  }

  private nextDeliveryDate(order: Order, today: string): string {
    let date = order.expectedDate;
    const type = order.recurrence!.type;
    while (date < today) {
      date = nextOccurrence(date, type, order.recurrence?.days);
    }
    return date;
  }

  private toISODate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  protected companyInitial(order: Order): string {
    return order.company.charAt(0);
  }

  protected totalProducts(order: Order): number {
    return order.products.reduce((sum, product) => sum + product.quantity, 0);
  }

  protected orderTotal(order: Order): number {
    return order.products.reduce((sum, product) => sum + product.price * product.quantity, 0);
  }

  protected formatPrice(value: number): string {
    return value.toFixed(2);
  }

  protected recurrenceLabel(type: RecurrenceType, date: string, days?: number[]): string {
    return getRecurrenceLabel(type, date, days);
  }

  protected unitSuffix(unit: 'unidad' | 'kg' | undefined): string {
    return unit === 'kg' ? 'kg' : 'uds';
  }

  protected priceSuffix(unit: 'unidad' | 'kg' | undefined): string {
    return unit === 'kg' ? '/kg' : '/ud';
  }

  protected priceLabel(unit: 'unidad' | 'kg'): string {
    return unit === 'kg' ? 'Precio por kg' : 'Precio por unidad';
  }

  protected formatDate(date: string): string {
    return formatDate(date);
  }
}
