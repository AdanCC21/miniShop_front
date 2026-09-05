import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface Product {
  image?: string;
  name: string;
  categories: string[];
  code: string;
  price: number;
  dateAdded: string;
}

export const placeholderImage =
  "data:image/svg+xml;charset=UTF-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">
       <rect width="400" height="300" fill="#e8f4fd"/>
       <g fill="none" stroke="#1a7fd4" stroke-width="2">
         <rect x="140" y="100" width="120" height="100" rx="6"/>
         <path d="M155 155 q10 -15 22 0 q12 -15 24 0" />
       </g>
     </svg>`
  );

@Component({
  selector: 'app-product-card',
  imports: [RouterLink],
  templateUrl: './product-card.html'
})
export class ProductCardComponent {
  readonly image = input(placeholderImage);
  readonly name = input.required<string>();
  readonly categories = input<string[]>([]);
  readonly code = input.required<string>();
  readonly price = input.required<number>();
}
