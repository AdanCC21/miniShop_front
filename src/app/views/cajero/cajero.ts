import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { CartLine, SaleRecord, saleCashPortion, salePaymentLines } from './cajero.data';
import { StoreService } from '../../store.service';
import { ButtonComponent } from '../../ui/button/button';
import { ConfirmModalComponent } from '../../ui/confirm-modal/confirm-modal';
import { InputComponent } from '../../ui/input/input';
import { ModalComponent } from '../../ui/modal/modal';
import { SearchSuggestionsComponent } from '../../ui/search-suggestions/search-suggestions';
import { ToastService } from '../../ui/toast/toast.service';
import { GetProducts, updateQuantity } from '../../api/products';
import { ProductDTO } from '../../dto/product.dto';

import { exceedsStock, firstStockError } from './scripts/validations';
import { formatPrice as formatPriceFn, paymentMethodLabel as paymentMethodLabelFn } from './scripts/formatters';
import { nowTime, todayISO } from './scripts/dates';
import { CAJA_COUNT_KEY, CAJA_HISTORY_KEY, CAJA_INITIAL_KEY, CAJA_PRODUCTS_KEY, CAJA_SALES_KEY, closeLocalStorage, loadHistory, loadNumber } from './scripts/storage';
import { cartTotal, cartTotalQuantity } from './scripts/cart';
import { buildStockUpdates } from './scripts/inventory';
import { saleProductCount } from './scripts/sales';
import { PaymentMethod } from '../../entities/PaymentMethod';
import { CreateSaleDetailDTO, CreateSaleDTO, SaleDetail, SaleDTO } from '../../dto/sale.dto';
import { PostSales } from '../../api/sales';
import { GuarantorDTO } from '../../dto/guarantor.dto';
import { CreateGuarantor, GetGuarantors } from '../../api/guarantor';
import { LoaderService } from '../../ui/loader/loader.service';
import { GetCurShopReg, SetOpneningCash } from '../../api/shopRegister';
import { ShopRegisterDTO } from '../../dto/shopRegister.dto';

@Component({
  selector: 'app-cajero',
  imports: [ButtonComponent, ConfirmModalComponent, InputComponent, ModalComponent, SearchSuggestionsComponent],
  templateUrl: './cajero.html'
})
export class CajeroComponent implements OnInit {
  private readonly toast = inject(ToastService);
  private readonly store = inject(StoreService);
  protected readonly loader = inject(LoaderService);

  protected readonly PaymentMethod = PaymentMethod;

  protected readonly fiadoMethodOptions: { id: FiadoMethod; label: string }[] = [
    { id: 'efectivo', label: 'Efectivo' },
    { id: 'tarjeta', label: 'Tarjeta' },
    { id: 'mixto', label: 'Mixto' }
  ];

  protected readonly products = signal<ProductDTO[]>([]);
  protected readonly guarantors = signal<GuarantorDTO[]>([]);

  protected readonly selectedProduct = signal<ProductDTO | null>(null);
  protected readonly productQuery = signal('');
  protected readonly quantity = signal(1);
  protected readonly byWeight = signal(false);
  protected readonly cart = signal<CartLine[]>([]);
  protected readonly regManual = signal(true);

  protected readonly receivedPayment = signal(0);
  protected readonly receivedCard = signal(0);
  protected readonly receivedCash = signal(0);
  protected readonly paymentMethod = signal<PaymentMethod>(PaymentMethod.CASH);
  protected readonly fiadoQuery = signal('');
  protected readonly selectedFiadoPerson = signal<string>('');
  protected readonly fiadoMethod = signal<FiadoMethod>('efectivo');
  protected readonly fiadoCard = signal(0);
  protected readonly fiadoCash = signal(0);
  protected readonly initialCash = signal<number | null>(loadNumber(CAJA_INITIAL_KEY));
  protected readonly initialDraft = signal(this.initialCash() !== null ? String(this.initialCash()) : '');
  protected readonly editingInitial = signal(this.initialCash() === null);
  
  protected readonly productsSold = signal(loadNumber(CAJA_PRODUCTS_KEY) ?? 0);
  protected readonly salesHistory = signal<SaleRecord[]>(loadHistory());
  protected readonly selectedSale = signal<SaleRecord | null>(null);
  protected readonly closeOpen = signal(false);
  protected readonly addFiadoPersonOpen = signal(false);
  protected readonly ventasOpen = signal(false);
  
  // -- Preview de caja -- //
  protected readonly previewShopReg = signal(false);

  // -- Caja Registradora -- //
  protected readonly curShopReg = signal<ShopRegisterDTO | null>(null)
  protected readonly openingShopReg = signal<{ modalOpen: boolean, amount: number }>({ modalOpen: false, amount: 0 });

  async ngOnInit() {
    this.loader.show('Cargando productos...');
    await Promise.all([
      this.loadProducts(),
      this.loadGuarantors(),
      this.loadShopRegister()
    ])
    this.loader.hide();
  }

  // -- Loaders -- //
  async loadProducts() {
    const products = await GetProducts(this.toast);
    this.products.set(products);
  }

  async loadGuarantors() {
    const guarantors = await GetGuarantors(this.toast);
    this.guarantors.set(guarantors);
  }

  async loadShopRegister() {
    const shopReg = await GetCurShopReg(this.toast);
    this.curShopReg.set(shopReg);
  }

  // -- ShopRegister -- //
  toggleShopRegister(state: boolean) {
    const openShop = this.openingShopReg();
    this.openingShopReg.set({ ...openShop, modalOpen: state })
  }

  handleShopRegister(value: string) {
    const openShop = this.openingShopReg();
    this.openingShopReg.set({ ...openShop, amount: Number(value) })
  }

  async openShopReg() {
    await SetOpneningCash(this.openingShopReg().amount, this.toast);
    this.toggleShopRegister(false);
    this.loadShopRegister()
  }

  // -- . -- //
  protected readonly matches = computed(() => {
    const query = this.productQuery().trim().toLowerCase();
    if (!query) return [];

    return this.products().filter(
      (product) =>
        product.name.toLowerCase().includes(query) || product.code.toLowerCase().includes(query)
    );
  });

  protected readonly productEmptyMessage = computed(
    () => `Sin resultados para "${this.productQuery()}"`
  );

  protected readonly totalQuantity = computed(() => cartTotalQuantity(this.cart()));

  protected readonly total = computed(() => cartTotal(this.cart()));

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
    return this.guarantors().filter((person) => person.name.toLowerCase().includes(query))
      .sort((a, b) => a.name.localeCompare(b.name));

  });

  protected readonly fiadoRemaining = computed(() =>
    Math.max(0, this.total() - (this.receivedCard() + this.receivedCash()))
  );

  protected readonly paymentOk = computed(() => {
    if (this.total() <= 0) {
      return false;
    }
    const method = this.paymentMethod();
    if (method === PaymentMethod.CARD) {
      return true;
    }
    if (method === PaymentMethod.MIXED) {
      return this.receivedCash() >= this.cardRemaining();
    }
    if (method === PaymentMethod.CREDIT) {
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

  protected selectProduct(product: ProductDTO): void {
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

  protected async confirmAddFiadoPerson() {
    const name = this.fiadoQuery().trim();
    if (name === '') {
      this.toast.error('Nombre vacío', 'Escribe el nombre de la persona.');
      return;
    }

    this.loader.show('Publicando fiador');
    const result = await CreateGuarantor(name, this.toast);
    if (result) {
      this.toast.success('Persona agregada', `${name} fue registrada.`);
    };

    await this.loadGuarantors();
    this.loader.hide();

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
    const stock = Number(product.quantity);
    if (exceedsStock(quantity, stock)) {
      this.toast.error(
        'Stock insuficiente',
        `${product.name} solo tiene ${stock} en inventario.`
      );
      return;
    }

    this.cart.update((lines) => {
      const existing = lines.find((line) => line.code === product.code);
      if (existing) {
        return lines.map((line) =>
          line.code === product.code ? { ...line, quantity: line.quantity + quantity } : line
        );
      }
      return [...lines, {
        id: product.id,
        code: product.code,
        name: product.name,
        price: Number(product.price),
        quantity: Number(quantity),
        byWeight: this.byWeight()
      }];
    });

    this.selectedProduct.set(null);
    this.productQuery.set('');
    this.quantity.set(1);
  }

  private async updateStock(): Promise<boolean> {
    const ok = await updateQuantity(buildStockUpdates(this.cart(), this.products()), this.toast);
    if (!ok) {
      this.toast.error('No se actualizo el inventario correctamente');
      return false;
    }
    return true
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

  protected selectFiadoMethod(method: FiadoMethod): void {
    this.fiadoMethod.set(method);
  }

  protected onFiadoCardChange(event: Event): void {
    this.fiadoCard.set(Number((event.target as HTMLInputElement).value) || 0);
  }

  protected onFiadoCashChange(event: Event): void {
    this.fiadoCash.set(Number((event.target as HTMLInputElement).value) || 0);
  }

  protected paymentLines(sale: SaleRecord) {
    return salePaymentLines(sale);
  }

  protected async charge() {
    const total = this.total();
    if (total <= 0) {
      this.toast.error('Venta vacía', 'Agrega productos antes de cobrar.');
      return;
    }

    const stockError = firstStockError(this.cart(), this.products());
    if (stockError) {
      this.toast.error(stockError.title, stockError.message);
      return;
    }

    const method = this.paymentMethod();

    let change = 0;
    let receivedCard = 0;
    let receivedCash = 0;
    let fiadoName: string | undefined;
    let fiadoAmount: number | undefined;
    let guarantorId: string | undefined;

    // Tarjeta
    switch (method) {
      case PaymentMethod.CARD:
        receivedCard = total;
        break;
      case PaymentMethod.CASH:
        if (this.receivedPayment() < total) {
          this.toast.error('Pago insuficiente', 'El cliente pagó menos del total.');
          return;
        }
        receivedCash = this.receivedPayment();
        change = this.receivedPayment() - total;
        break;
      case PaymentMethod.MIXED:
        const remaining = this.cardRemaining();
        if (this.receivedCash() < remaining) {
          this.toast.error('Efectivo insuficiente', 'El efectivo no cubre el restante de la venta.');
          return;
        }
        receivedCard = this.receivedCard();
        receivedCash = this.receivedCash();
        change = this.cashChange();
        break;
      case PaymentMethod.CREDIT:
        // Credito
        const name = this.selectedFiadoPerson().trim();
        if (name === '') {
          this.toast.error('Falta la persona', 'Selecciona a quién se le fía.');
          return;
        }
        const guar = this.guarantors().find(cur => cur.name === name);
        if (!guar) {
          this.toast.error(`El fiador ${name} no fue encontrado entre los fiadores registrados. Id del fiador ${guarantorId}`)
          return;
        }

        if (this.receivedPayment() >= total || (this.receivedCard() + this.receivedCash()) >= total) {
          this.toast.error('Pago completo', 'El pago cubre el total, no hay resto para fiar.');
          return;
        }

        fiadoName = name;
        receivedCard = this.receivedCard()
        receivedCash = this.receivedCash();
        guarantorId = guar.id;
        break;
      default:
        this.toast.error("El metodo no es valido");
        return;
    }

    const sale: CreateSaleDTO = {
      total,
      paidCash: receivedCash,
      paidCard: receivedCard,
      method,
      guarantorId
    };

    const saleDetails: CreateSaleDetailDTO[] = [];
    this.cart().forEach((cur) => {
      saleDetails.push({
        productId: cur.id,
        quantity: cur.quantity,
        unitPrice: cur.price
      } as CreateSaleDetailDTO)
    })

    const posted = await PostSales({ sale, details: saleDetails }, this.toast);
    if (!posted) return;

    // actualizar datos
    await this.loadShopRegister();
    await this.loadProducts();
    await this.updateStock();

    // -- Reiniciar datos -- //
    
    this.cart.set([]);
    this.receivedPayment.set(0);
    this.receivedCard.set(0);
    this.receivedCash.set(0);
    this.fiadoQuery.set('');
    this.selectedFiadoPerson.set('');

    
    localStorage.setItem(CAJA_PRODUCTS_KEY, String(this.productsSold()));
    localStorage.setItem(CAJA_HISTORY_KEY, JSON.stringify(this.salesHistory()));

    if (method === PaymentMethod.CREDIT && fiadoName && fiadoAmount !== undefined) {
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

  protected togglePreviewShop(state:boolean){
    this.previewShopReg.set(state);
  }

  protected saleProducts(sale: SaleRecord): number {
    return saleProductCount(sale);
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
    
    this.toast.success('Cierre de caja', 'La caja se cerró y quedó registrada.');
  }

  protected paymentMethodLabel(method: PaymentMethod | undefined): string {
    return paymentMethodLabelFn(method);
  }

  protected formatPrice(value: number): string {
    return formatPriceFn(value);
  }
}

export type FiadoMethod = 'efectivo' | 'tarjeta' | 'mixto';
