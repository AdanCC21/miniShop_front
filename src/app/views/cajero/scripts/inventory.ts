import { ProductDTO } from '../../../dto/product.dto';
import { CartLine } from '../cajero.data';

export function buildStockUpdates(
  cart: CartLine[],
  products: ProductDTO[]
): { id: string; quantity: string }[] {
  const updates: { id: string; quantity: string }[] = [];
  for (const line of cart) {
    const product = products.find((p) => p.code === line.code);
    if (!product) {
      continue;
    }
    const remaining = Number(product.quantity) - line.quantity;
    updates.push({ id: product.id, quantity: String(remaining) });
  }
  return updates;
}