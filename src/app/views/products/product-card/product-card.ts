import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProductIconComponent, PRODUCT_ICONS } from '../product-icon/product-icon';

@Component({
  selector: 'app-product-card',
  imports: [RouterLink, ProductIconComponent],
  templateUrl: './product-card.html'
})
export class ProductCardComponent {
  readonly image = input<string | null>(null);
  readonly name = input.required<string>();
  readonly categories = input<string[]>([]);
  readonly code = input.required<string>();
  readonly price = input.required<number>();
  readonly quantity = input.required<number>();

  protected isIcon(value: string | null): boolean {
    return !value || value === 'drink' || PRODUCT_ICONS.some((option) => option.id === value);
  }
}
