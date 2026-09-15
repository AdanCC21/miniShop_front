import { ProductDTO } from '../../../dto/product.dto';
import { CartLine } from '../cajero.data';

export function exceedsStock(quantity: number, stock: number): boolean {
  return quantity > Number(stock);
}

export interface StockError {
  title: string;
  message: string;
}

export function firstStockError(cart: CartLine[], products: ProductDTO[]): StockError | null {
  for (const line of cart) {
    const product = products.find((p) => p.code === line.code);
    if (!product) {
      return { title: 'Producto no disponible', message: `${line.name} ya no está en el inventario.` };
    }
    if (Number(product.quantity) < line.quantity) {
      return {
        title: 'Stock insuficiente',
        message: `${line.name} tiene ${product.quantity} en inventario y llevas ${line.quantity}.`
      };
    }
  }
  return null;
}