import { Component, computed, inject, OnInit, signal } from '@angular/core';

import { ProductCardComponent } from './product-card/product-card';
import { SelectComponent, SelectOption } from '../../ui/select/select';
import { PRODUCTS } from './products.data';
import { ButtonComponent } from "../../ui/button/button";
import { GetProducts } from '../../api/products';
import { ToastService } from '../../ui/toast/toast.service';

export type SortOption = 'date' | 'price' | 'name';

@Component({
  selector: 'app-products',
  imports: [ProductCardComponent, SelectComponent, ButtonComponent],
  templateUrl: './products.html'
})
export class ProductsComponent implements OnInit{
  protected readonly toast = inject(ToastService);
  protected readonly storeName = 'miniShop';

  protected readonly productss = PRODUCTS;
  protected readonly products = signal<any[]>([]);

  async ngOnInit(){
    const products = await GetProducts(this.toast);
    if(products) this.products.set(products);
    console.log(products);
  }

  protected readonly categories = computed(() => {
    const all = new Set(this.products().flatMap((product) => product.categories));
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

  protected readonly visibleProducts = computed(() => {
    // const filtered =
    //   this.selectedCategory() === 'all'
    //     ? [...this.products()]
    //     : this.products().filter((product) => product.categories.includes(this.selectedCategory()));

    // switch (this.sortBy()) {
    //   case 'price':
    //     return filtered.sort((a, b) => a.price - b.price);
    //   case 'name':
    //     return filtered.sort((a, b) => a.name.localeCompare(b.name));
    //   case 'date':
    //   default:
    //     return filtered.sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
    // }
  });

  protected onCategoryChange(value: string): void {
    this.selectedCategory.set(value);
  }

  protected onSortChange(value: string): void {
    this.sortBy.set(value as SortOption);
  }
}
