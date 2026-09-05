import { Component, computed, inject, signal } from '@angular/core';

import { CartLine, PaymentMethod, SaleRecord, saleCashPortion, salePaymentLines } from './cajero.data';
import { Product } from '../products/product-card/product-card';
import { PRODUCTS } from '../products/products.data';
import { StoreService } from '../../store.service';
import { ButtonComponent } from '../../ui/button/button';
import { ConfirmModalComponent } from '../../ui/confirm-modal/confirm-modal';
import { InputComponent } from '../../ui/input/input';
import { ModalComponent } from '../../ui/modal/modal';
import { SearchSuggestionsComponent } from '../../ui/search-suggestions/search-suggestions';
import { ToastService } from '../../ui/toast/toast.service';

const CAJA_INITIAL_KEY = 'minishop_caja_initial';
const CAJA_SALES_KEY = 'minishop_caja_sales';
const CAJA_COUNT_KEY = 'minishop_caja_count';
const CAJA_PRODUCTS_KEY = 'minishop_caja_products';
const CAJA_HISTORY_KEY = 'minishop_caja_history';

@Component({
  selector: 'app-cajero',
  imports: [ButtonComponent, ConfirmModalComponent, InputComponent, ModalComponent, SearchSuggestionsComponent],
  templateUrl: './cajero.html'
})
export class CajeroComponent {
  private readonly toast = inject(ToastService);
  private readonly store = inject(StoreService);

  protected readonly productQuery = signal('');
  protected readonly quantity = signal(1);
  protected readonly byWeight = signal(false);
  protected readonly cart = signal<CartLine[]>([]);
  protected readonly regManual = signal(true);

  protected readonly receivedPayment = signal(0);
  protected readonly receivedCard = signal(0);
  protected readonly receivedCash = signal(0);
  protected readonly paymentMethod = signal<PaymentMethod>('efectivo');
  protected readonly fiadoQuery = signal('');
  protected readonly selectedFiadoPerson = signal<string>('');
  protected readonly initialCash = signal<number | null>(this.loadNumber(CAJA_INITIAL_KEY));
  protected readonly initialDraft = signal(this.initialCash() !== null ? String(this.initialCash()) : '');
  protected readonly editingInitial = signal(this.initialCash() === null);
  protected readonly salesTotal = signal(this.loadNumber(CAJA_SALES_KEY) ?? 0);
  protected readonly salesCount = signal(this.loadNumber(CAJA_COUNT_KEY) ?? 0);
  protected readonly productsSold = signal(this.loadNumber(CAJA_PRODUCTS_KEY) ?? 0);
  protected readonly salesHistory = signal<SaleRecord[]>(this.loadHistory());
  protected readonly selectedSale = signal<SaleRecord | null>(null);
  protected readonly closeOpen = signal(false);
  protected readonly addFiadoPersonOpen = signal(false);

  protected getEarnings(): number {
    return this.salesTotal();
  }
  
  protected readonly matches = computed(() => {
    const query = this.productQuery().trim().toLowerCase();
    if (!query) {
      return [];
    }
    return PRODUCTS.filter(
      (product) =>
        product.name.toLowerCase().includes(query) || product.code.toLowerCase().includes(query)
    );
  });

  protected readonly productEmptyMessage = computed(
    () => `Sin resultados para "${this.productQuery()}"`
  );

  protected readonly selectedProduct = signal<Product | null>(null);

  protected readonly totalQuantity = computed(() =>
    this.cart().reduce((sum, line) => sum + line.quantity, 0)
  );

  protected readonly total = computed(() =>
    this.cart().reduce((sum, line) => sum + line.price * line.quantity, 0)
  );

  protected readonly change = computed(() => {
    const diff = this.receivedPayment() - this.total();
    return diff > 0 ? diff : 0;
  });

  protected readonly cardRemaining = computed(() =>
    Math.max(0, this.total() - this.receivedCard())
  );

  protected readonly cashChange = computed(() => {
    const diff = this.receivedCash() - this.cardRemaining();
    return diff > 0 ? diff : 0;
  });

  protected readonly fiadoMatches = computed(() => {
    const query = this.fiadoQuery().trim().toLowerCase();
    return this.store
      .fiados()
      .filter((person) => person.name.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name));
  });

  protected readonly fiadoRemaining = computed(() =>
    Math.max(0, this.total() - this.receivedPayment())
  );

  protected readonly paymentOk = computed(() => {
    if (this.total() <= 0) {
      return false;
    }
    const method = this.paymentMethod();
    if (method === 'tarjeta') {
      return true;
    }
    if (method === 'multiple') {
      return this.receivedCash() >= this.cardRemaining();
    }
    if (method === 'fiar') {
      return this.receivedPayment() < this.total() && this.selectedFiadoPerson() !== '';
    }
    return this.receivedPayment() >= this.total();
  });

  protected readonly cashSalesTotal = computed(() =>
    this.salesHistory().reduce((sum, sale) => sum + saleCashPortion(sale), 0)
  );

  protected readonly expectedCash = computed(
    () => (this.initialCash() ?? 0) + this.cashSalesTotal()
  );

  protected onQueryChange(value: string): void {
    this.productQuery.set(value);
    this.selectedProduct.set(null);
  }

  protected selectProduct(product: Product): void {
    this.selectedProduct.set(product);
    this.productQuery.set(product.name);
  }

  protected onQuantityChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.quantity.set(value === '' ? 0 : Number(value));
  }

  protected onReceivedPaymentChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.receivedPayment.set(value === '' ? 0 : Number(value));
  }

  protected onReceivedCardChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.receivedCard.set(value === '' ? 0 : Number(value));
  }

  protected onReceivedCashChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.receivedCash.set(value === '' ? 0 : Number(value));
  }

  protected onFiadoQueryChange(value: string): void {
    this.fiadoQuery.set(value);
  }

  protected selectFiadoPerson(name: string): void {
    this.selectedFiadoPerson.set(name);
    this.fiadoQuery.set(name);
  }

  protected openAddFiadoPerson(): void {
    this.addFiadoPersonOpen.set(true);
  }

  protected closeAddFiadoPerson(): void {
    this.addFiadoPersonOpen.set(false);
  }

  protected confirmAddFiadoPerson(): void {
    const name = this.fiadoQuery().trim();
    if (name === '') {
      this.toast.error('Nombre vacío', 'Escribe el nombre de la persona.');
      return;
    }
    this.store.addPerson(name);
    this.selectFiadoPerson(name);
    this.addFiadoPersonOpen.set(false);
    this.toast.success('Persona agregada', `${name} fue registrada.`);
  }

  protected onInitialDraftChange(event: Event): void {
    this.initialDraft.set((event.target as HTMLInputElement).value);
  }

  protected startEditInitial(): void {
    this.initialDraft.set(this.initialCash() !== null ? String(this.initialCash()) : '');
    this.editingInitial.set(true);
  }

  protected saveInitial(): void {
    const amount = Number(this.initialDraft());
    if (!Number.isFinite(amount) || amount < 0) {
      this.toast.error('Monto inválido', 'Ingresa una cantidad válida.');
      return;
    }
    this.initialCash.set(amount);
    localStorage.setItem(CAJA_INITIAL_KEY, String(amount));
    this.editingInitial.set(false);
    this.toast.success('Fondo inicial guardado', `La caja abrió con $${this.formatPrice(amount)}.`);
  }

  protected resetInitial(): void {
    this.initialCash.set(null);
    localStorage.removeItem(CAJA_INITIAL_KEY);
    this.editingInitial.set(true);
    this.initialDraft.set('');
    this.toast.info('Fondo inicial eliminado', 'Registra el monto con el que abrió la caja.');
  }

  protected toggleByWeight(): void {
    this.byWeight.set(!this.byWeight());
    if (this.byWeight()) {
      this.quantity.set(1);
    }
  }

  protected addToCart(): void {
    const product = this.selectedProduct() ?? (this.matches().length === 1 ? this.matches()[0] : null);
    if (!product || this.quantity() <= 0) {
      return;
    }

    const quantity = this.byWeight() ? this.quantity() : Math.round(this.quantity());
    this.cart.update((lines) => {
      const existing = lines.find((line) => line.code === product.code);
      if (existing) {
        return lines.map((line) =>
          line.code === product.code ? { ...line, quantity: line.quantity + quantity } : line
        );
      }
      return [...lines, { code: product.code, name: product.name, price: product.price, quantity, byWeight: this.byWeight() }];
    });

    this.selectedProduct.set(null);
    this.productQuery.set('');
    this.quantity.set(1);
  }

  protected removeLine(code: string): void {
    this.cart.update((lines) => lines.filter((line) => line.code !== code));
  }

  protected clearCart(): void {
    this.cart.set([]);
    this.receivedPayment.set(0);
    this.receivedCard.set(0);
    this.receivedCash.set(0);
    this.fiadoQuery.set('');
    this.selectedFiadoPerson.set('');
  }

  protected selectPaymentMethod(method: PaymentMethod): void {
    this.paymentMethod.set(method);
  }

  protected paymentMethodLabel(method: PaymentMethod | undefined): string {
    if (method === 'tarjeta') {
      return 'Tarjeta';
    }
    if (method === 'multiple') {
      return 'Múltiple';
    }
    if (method === 'fiar') {
      return 'Fiado';
    }
    return 'Efectivo';
  }

  protected paymentLines(sale: SaleRecord) {
    return salePaymentLines(sale);
  }

  protected charge(): void {
    const total = this.total();
    if (total <= 0) {
      this.toast.error('Venta vacía', 'Agrega productos antes de cobrar.');
      return;
    }
    const method = this.paymentMethod();

    let received = 0;
    let change = 0;
    let receivedCard = 0;
    let receivedCash = 0;
    let fiadoName: string | undefined;
    let fiadoAmount: number | undefined;

    if (method === 'tarjeta') {
      received = total;
      receivedCard = total;
    } else if (method === 'multiple') {
      const remaining = this.cardRemaining();
      if (this.receivedCash() < remaining) {
        this.toast.error('Efectivo insuficiente', 'El efectivo no cubre el restante de la venta.');
        return;
      }
      receivedCard = this.receivedCard();
      receivedCash = this.receivedCash();
      received = receivedCard + receivedCash;
      change = this.cashChange();
    } else if (method === 'fiar') {
      const name = this.selectedFiadoPerson().trim();
      if (name === '') {
        this.toast.error('Falta la persona', 'Selecciona a quién se le fía.');
        return;
      }
      if (this.receivedPayment() >= total) {
        this.toast.error('Pago completo', 'El pago cubre el total, no hay resto para fiar.');
        return;
      }
      received = this.receivedPayment();
      fiadoName = name;
      fiadoAmount = total - received;
    } else {
      if (this.receivedPayment() < total) {
        this.toast.error('Pago insuficiente', 'El cliente pagó menos del total.');
        return;
      }
      received = this.receivedPayment();
      change = received - total;
    }

    const products = this.cart().reduce((sum, line) => sum + line.quantity, 0);
    const sale: SaleRecord = {
      id: Date.now(),
      time: this.nowTime(),
      products: this.cart().map((line) => ({ ...line })),
      total,
      received,
      change,
      paymentMethod: method,
      receivedCard,
      receivedCash,
      fiadoName,
      fiadoAmount
    };
    if (method === 'fiar' && fiadoName && fiadoAmount !== undefined) {
      this.store.addFiado(fiadoName, fiadoAmount, this.todayISO());
    }
    this.salesHistory.update((list) => [...list, sale]);
    this.salesTotal.update((sum) => sum + total);
    this.salesCount.update((count) => count + 1);
    this.productsSold.update((sum) => sum + products);
    localStorage.setItem(CAJA_SALES_KEY, String(this.salesTotal()));
    localStorage.setItem(CAJA_COUNT_KEY, String(this.salesCount()));
    localStorage.setItem(CAJA_PRODUCTS_KEY, String(this.productsSold()));
    localStorage.setItem(CAJA_HISTORY_KEY, JSON.stringify(this.salesHistory()));
    this.cart.set([]);
    this.receivedPayment.set(0);
    this.receivedCard.set(0);
    this.receivedCash.set(0);
    this.fiadoQuery.set('');
    this.selectedFiadoPerson.set('');
    if (method === 'fiar' && fiadoName && fiadoAmount !== undefined) {
      this.toast.success(
        'Venta fiada',
        `Se fiaron $${this.formatPrice(fiadoAmount)} a ${fiadoName}.`
      );
    } else {
      this.toast.success(
        'Venta cobrada',
        change > 0 ? `Cambio a entregar: $${this.formatPrice(change)}.` : 'Pago exacto.'
      );
    }
  }

  protected openSaleDetails(sale: SaleRecord): void {
    this.selectedSale.set(sale);
  }

  protected closeSaleDetails(): void {
    this.selectedSale.set(null);
  }

  protected saleProducts(sale: SaleRecord): number {
    return sale.products.reduce((sum, line) => sum + line.quantity, 0);
  }

  protected askClose(): void {
    if (this.initialCash() === null) {
      this.toast.error('Sin fondo inicial', 'Registra el monto inicial antes de cerrar la caja.');
      return;
    }
    this.closeOpen.set(true);
  }

  protected cancelClose(): void {
    this.closeOpen.set(false);
  }

  protected confirmClose(): void {
    this.store.addClosure({
      date: this.todayISO(),
      sales: this.salesCount(),
      productsSold: this.productsSold(),
      total: this.salesTotal(),
      initial: this.initialCash() ?? 0,
      history: this.salesHistory()
    });
    this.initialCash.set(null);
    this.salesTotal.set(0);
    this.salesCount.set(0);
    this.productsSold.set(0);
    this.salesHistory.set([]);
    this.selectedSale.set(null);
    localStorage.removeItem(CAJA_INITIAL_KEY);
    localStorage.removeItem(CAJA_SALES_KEY);
    localStorage.removeItem(CAJA_COUNT_KEY);
    localStorage.removeItem(CAJA_PRODUCTS_KEY);
    localStorage.removeItem(CAJA_HISTORY_KEY);
    this.editingInitial.set(true);
    this.initialDraft.set('');
    this.cart.set([]);
    this.receivedPayment.set(0);
    this.closeOpen.set(false);
    this.toast.success('Cierre de caja', 'La caja se cerró y quedó registrada.');
  }

  protected formatPrice(value: number): string {
    return value.toFixed(2);
  }

  private todayISO(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private nowTime(): string {
    return new Intl.DateTimeFormat('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(new Date());
  }

  private loadNumber(key: string): number | null {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return null;
    }
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private loadHistory(): SaleRecord[] {
    const raw = localStorage.getItem(CAJA_HISTORY_KEY);
    if (!raw) {
      return [];
    }
    try {
      return JSON.parse(raw) as SaleRecord[];
    } catch {
      return [];
    }
  }
}
