import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { findProductByCode } from '../products.data';
import { placeholderImage } from '../product-card/product-card';
import { ModalComponent } from '../../../ui/modal/modal';
import { ButtonComponent } from '../../../ui/button/button';
import { InputComponent } from '../../../ui/input/input';

@Component({
  selector: 'app-product-details',
  imports: [ButtonComponent, InputComponent, ModalComponent, RouterLink],
  templateUrl: './product-details.html'
})
export class ProductDetailsComponent {
  private readonly route = inject(ActivatedRoute);

  protected readonly product = findProductByCode(this.route.snapshot.paramMap.get('code') ?? '');
  protected readonly fallbackImage = placeholderImage;

  protected readonly editOpen = signal(false);
  protected readonly editName = signal('');
  protected readonly editPrice = signal('');

  protected openEdit(): void {
    if (!this.product) {
      return;
    }
    this.editName.set(this.product.name);
    this.editPrice.set(String(this.product.price));
    this.editOpen.set(true);
  }

  protected closeEdit(): void {
    this.editOpen.set(false);
  }

  protected onNameChange(value: string): void {
    this.editName.set(value);
  }

  protected onPriceChange(value: string): void {
    this.editPrice.set(value);
  }

  protected saveEdit(): void {
    if (!this.product || !this.editName().trim()) {
      return;
    }
    const price = Number(this.editPrice());
    if (Number.isNaN(price) || price < 0) {
      return;
    }
    this.product.name = this.editName().trim();
    this.product.price = price;
    this.editOpen.set(false);
  }
}
