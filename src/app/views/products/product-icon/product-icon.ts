import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../../ui/button/button';

export interface ProductIconOption {
  id: string;
  label: string;
  color: string;
  background: string;
}

export const PRODUCT_ICONS: ProductIconOption[] = [
  { id: 'food', label: 'Comida preparada', color: '#ea580c', background: '#fff7ed' },
  { id: 'snack', label: 'Botanas', color: '#ca8a04', background: '#fefce8' },
  { id: 'tortilla', label: 'Tortillas', color: '#a16207', background: '#fefce8' },
  { id: 'bread', label: 'Panadería', color: '#b45309', background: '#fffbeb' },
  { id: 'beverage', label: 'Bebidas', color: '#0284c7', background: '#f0f9ff' },
  { id: 'fruit', label: 'Frutas y verduras', color: '#16a34a', background: '#f0fdf4' },
  { id: 'dairy', label: 'Lácteos', color: '#0891b2', background: '#ecfeff' },
  { id: 'eggs', label: 'Huevo', color: '#92400e', background: '#fffbeb' },
  { id: 'grains', label: 'Granos y semillas', color: '#65a30d', background: '#f7fee7' },
  { id: 'pantry', label: 'Abarrotes', color: '#9333ea', background: '#faf5ff' },
  { id: 'instant', label: 'Sopas y pasta', color: '#e11d48', background: '#fff1f2' },
  { id: 'candy', label: 'Dulces', color: '#db2777', background: '#fdf2f8' },
  { id: 'meat', label: 'Carnes y embutidos', color: '#dc2626', background: '#fef2f2' },
  { id: 'frozen', label: 'Congelados', color: '#4f46e5', background: '#eef2ff' },
  { id: 'condiments', label: 'Salsas y condimentos', color: '#c2410c', background: '#fff7ed' },
  { id: 'paper', label: 'Papel y desechables', color: '#64748b', background: '#f8fafc' },
  { id: 'hygiene', label: 'Higiene personal', color: '#7c3aed', background: '#f5f3ff' },
  { id: 'medicine', label: 'Medicina', color: '#2563eb', background: '#eff6ff' },
  { id: 'can', label: 'Enlatados', color: '#7c3aed', background: '#f5f3ff' },
  { id: 'cleaning', label: 'Limpieza', color: '#0f766e', background: '#f0fdfa' },
  { id: 'pet', label: 'Mascotas', color: '#c026d3', background: '#fdf4ff' },
  { id: 'general', label: 'Otros', color: '#475569', background: '#f8fafc' },
];

export function isProductIcon(id: string | null | undefined): boolean {
  return !id || id === 'drink' || PRODUCT_ICONS.some((option) => option.id === id);
}

@Component({
  selector: 'app-product-icon',
  templateUrl: './product-icon.html',
})
export class ProductIconComponent {
  readonly icon = input('general');
  readonly size = input<'card' | 'picker' | 'detail'>('card');

  protected normalizedIcon(): string {
  return this.icon() === 'drink' ? 'medicine' : this.icon();
  }

  protected option(id: string): ProductIconOption {
    return PRODUCT_ICONS.find((item) => item.id === id) ?? PRODUCT_ICONS.at(-1)!;
  }
}

@Component({
  selector: 'app-product-icon-picker',
  imports: [ProductIconComponent, ButtonComponent],
  templateUrl: './product-icon-picker.html',
})
export class ProductIconPickerComponent {
  readonly value = input('general');
  readonly valueChange = output<string>();
  readonly options = PRODUCT_ICONS;

  protected select(id: string): void {
    this.valueChange.emit(id);
  }
}
