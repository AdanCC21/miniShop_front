import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { ProductCardComponent } from './product-card/product-card';
import { SelectComponent, SelectOption } from '../../ui/select/select';
import { ButtonComponent } from "../../ui/button/button";
import { InputComponent } from "../../ui/input/input";
import { ModalComponent } from "../../ui/modal/modal";
import { CreateProduct, GetProducts } from '../../api/products';
import { ToastService } from '../../ui/toast/toast.service';
import { AuthService } from '../../auth/auth.service';
import { CreateCategory, GetCategories } from '../../api/category';
import { CategoryDTO } from '../../dto/category.dto';

export type SortOption = 'date' | 'price' | 'name';

@Component({
  selector: 'app-products',
  imports: [ProductCardComponent, SelectComponent, ButtonComponent, InputComponent, ModalComponent],
  templateUrl: './products.html'
})
export class ProductsComponent implements OnInit {
  protected readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);
  protected readonly storeName = 'miniShop';

  protected readonly products = signal<any[]>([]);

  // New product
  protected readonly addOpen = signal(false);
  protected readonly addName = signal('');
  protected readonly addCode = signal('');
  protected readonly addPrice = signal('');
  protected readonly addQuantity = signal('1');

  // Category
  protected readonly categoriesFetch = signal<CategoryDTO[]>([]);
  protected readonly selectedCategoryId = signal<string>('');
  protected readonly newCat = signal(false);
  protected readonly newCatName = signal("");

  async ngOnInit() {
    const products = await GetProducts(this.toast);
    if (products) this.products.set(products);
    console.log(products);
  }

  protected readonly categories = computed(() => {
    const all = new Set(this.products().flatMap((product) => product.categories ?? []));
    return [...all].sort((a, b) => a.localeCompare(b));
  });

  protected readonly categoryOptions = computed<SelectOption[]>(() => [
    { value: 'all', label: 'Todas' },
    ...this.categories().map((category) => ({ value: category, label: category }))
  ]);

  protected readonly sortOptions: SelectOption[] = [
    { value: 'date', label: 'Fecha de agregado' },
    { value: 'price', label: 'Precio' },
    { value: 'name', label: 'Alfabético' }
  ];

  protected readonly selectedCategory = signal<string>('all');

  protected readonly sortBy = signal<SortOption>('date');

  protected onCategoryChange(value: string): void {
    this.selectedCategory.set(value);
  }

  protected onSortChange(value: string): void {
    this.sortBy.set(value as SortOption);
  }

  protected async openAdd() {
    this.addName.set('');
    this.addCode.set('');
    this.addPrice.set('');
    this.addQuantity.set('1');
    this.newCat.set(false);

    const cat = await GetCategories(this.toast);
    this.categoriesFetch.set(cat);

    this.addOpen.set(true);
  }

  protected setNewCat() {
    this.newCat.set(!this.newCat())
  }

  protected readonly categoryOptionsForFetch = computed<SelectOption[]>(() => [
    { value: '', label: 'Selecciona una categoría' },
    ...this.categoriesFetch().map((c) => ({ value: String(c.id), label: c.name }))
  ]);

  protected onCategoryIdChange(value: string): void {
    this.selectedCategoryId.set(value);
  }

  protected onChangeNewCategoryName(value: string) {
    this.newCatName.set(value);
  }

  protected closeAdd(): void {
    this.addOpen.set(false);
  }

  protected onAddNameChange(value: string): void {
    this.addName.set(value);
  }

  protected onAddCodeChange(value: string): void {
    this.addCode.set(value);
  }

  protected onAddPriceChange(value: string): void {
    this.addPrice.set(value);
  }

  protected onAddQuantityChange(value: string): void {
    this.addQuantity.set(value);
  }

  protected async saveProduct(): Promise<void> {
    const name = this.addName().trim();
    const code = this.addCode().trim();
    const price = Number(this.addPrice());
    const quantity = Number(this.addQuantity());

    if (!name) {
      this.toast.error('Nombre requerido', 'Escribe el nombre del producto.');
      return;
    }
    if (!code) {
      this.toast.error('Código requerido', 'Escribe el código del producto.');
      return;
    }
    if (!Number.isFinite(price) || price < 0) {
      this.toast.error('Precio inválido', 'Ingresa un precio válido.');
      return;
    }
    if (!Number.isFinite(quantity) || quantity < 0) {
      this.toast.error('Cantidad inválida', 'Ingresa una cantidad válida.');
      return;
    }

    const shopUuid = this.auth.user()?.shopUuid;
    if (!shopUuid) {
      this.toast.error('Sin tienda', 'No se pudo determinar la tienda de la sesión.');
      return;
    }

    let categoryId = this.selectedCategoryId() === '' ? null : this.selectedCategoryId();
    if (this.newCat()) {
      const category = await CreateCategory({ name: this.newCatName() }, this.toast);
      if (!category) return;
      categoryId = category.id;
    }

    const product = await CreateProduct({ shopUuid, categoryId, name, code, price, quantity: Math.round(quantity), image: null }, this.toast);
    if (!product) return;

    this.products.update((list) => [product, ...list]);
    this.addOpen.set(false);
    this.toast.success('Producto agregado', `${name} se guardó correctamente.`);
  }
}
