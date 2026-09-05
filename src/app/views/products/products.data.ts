import { Product } from './product-card/product-card';

export const PRODUCTS: Product[] = [
  { name: 'Playera Básica', categories: ['Ropa', 'Hombre'], code: 'PRD-001', price: 12.5, dateAdded: '2026-01-05' },
  { name: 'Taza Cerámica', categories: ['Hogar', 'Cocina'], code: 'PRD-002', price: 8.75, dateAdded: '2026-02-18' },
  { name: 'Libreta A5', categories: ['Papelería'], code: 'PRD-003', price: 4.99, dateAdded: '2026-03-02' },
  { name: 'Auriculares BT', categories: ['Electrónica', 'Audio'], code: 'PRD-004', price: 35.0, dateAdded: '2026-04-11' },
  { name: 'Botella Térmica', categories: ['Deportes', 'Outdoor'], code: 'PRD-005', price: 15.5, dateAdded: '2026-05-09' },
  { name: 'Camiseta Deportiva', categories: ['Ropa', 'Deportes'], code: 'PRD-006', price: 18.0, dateAdded: '2026-06-20' },
  { name: 'Mochila Urbana', categories: ['Accesorios', 'Viaje'], code: 'PRD-007', price: 42.75, dateAdded: '2026-07-14' },
  { name: 'Reloj Clásico', categories: ['Accesorios'], code: 'PRD-008', price: 29.99, dateAdded: '2026-08-01' }
];

export function findProductByCode(code: string): Product | undefined {
  return PRODUCTS.find((product) => product.code === code);
}
