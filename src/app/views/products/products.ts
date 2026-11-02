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
import { ProductIconPickerComponent } from './product-icon/product-icon';

export type SortOption = 'date' | 'price' | 'name';

@Component({
  selector: 'app-products',
  imports: [ProductCardComponent, ProductIconPickerComponent, SelectComponent, ButtonComponent, InputComponent, ModalComponent],
  templateUrl: './products.html'
})
export class ProductsComponent implements OnInit {
  protected readonly toast = inject(ToastService);
  protected readonly auth = inject(AuthService);
  protected readonly storeName = 'miniShop';

  protected readonly products = signal<any[]>([]);
  protected readonly searchQuery = signal('');

  // New product
  protected readonly addOpen = signal(false);
  protected readonly addName = signal('');
  protected readonly addCode = signal('');
  protected readonly addPrice = signal('');
  protected readonly addQuantity = signal('1');
  protected readonly selectedIcon = signal('general');

  // Category
  protected readonly categoriesFetch = signal<CategoryDTO[]>([]);
  protected readonly selectedCategoryId = signal<string>('');
  protected readonly newCat = signal(false);
  protected readonly newCatName = signal("");

  async ngOnInit() {
    const [products, categories] = await Promise.all([
      GetProducts(this.toast),
      GetCategories(this.toast)
    ]);
    this.products.set(products);
    this.categoriesFetch.set(categories);
  }

  protected readonly categories = computed(() => {
    return [...new Set(this.categoriesFetch().map((category) => category.name))]
      .sort((a, b) => a.localeCompare(b, 'es'));
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

  protected readonly visibleProducts = computed(() => {
    const query = this.searchQuery().trim().toLocaleLowerCase('es');
    const category = this.selectedCategory();

    return this.products()
      .filter((product) => {
        const matchesCategory = category === 'all' || product.category?.name === category;
        const matchesQuery = !query || [product.name, product.code]
          .some((value) => String(value ?? '').toLocaleLowerCase('es').includes(query));
        return matchesCategory && matchesQuery;
      })
      .sort((a, b) => {
        switch (this.sortBy()) {
          case 'price': return Number(a.price) - Number(b.price);
          case 'name': return String(a.name).localeCompare(String(b.name), 'es');
          case 'date':
          default: return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
  });

  protected onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

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
    this.selectedIcon.set('general');
    this.selectedCategoryId.set('');
    this.newCatName.set('');
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
      this.categoriesFetch.update((categories) => [...categories, category]);
    }

    const product = await CreateProduct({ shopUuid, categoryId, name, code, price, quantity: Math.round(quantity), image: this.selectedIcon() }, this.toast);
    if (!product) return;

    this.products.update((list) => [product, ...list]);
    this.addOpen.set(false);
    this.toast.success('Producto agregado', `${name} se guardó correctamente.`);
  }
}
