import { SaleRecord } from '../cajero.data';

export function saleProductCount(sale: SaleRecord): number {
  return sale.products.reduce((sum, line) => sum + line.quantity, 0);
}