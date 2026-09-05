export type PaymentMethod = 'efectivo' | 'tarjeta' | 'multiple' | 'fiar';

export interface CartLine {
  code: string;
  name: string;
  price: number;
  quantity: number;
  byWeight: boolean;
}

export interface SaleRecord {
  id: number;
  time: string;
  products: CartLine[];
  total: number;
  received: number;
  change: number;
  paymentMethod: PaymentMethod;
  receivedCard?: number;
  receivedCash?: number;
  fiadoName?: string;
  fiadoAmount?: number;
}

export interface SalePaymentLine {
  label: string;
  amount: number;
}

export function salePaymentLines(sale: SaleRecord): SalePaymentLine[] {
  const method = sale.paymentMethod ?? 'efectivo';
  if (method === 'multiple') {
    return [
      { label: 'Tarjeta', amount: sale.receivedCard ?? 0 },
      { label: 'Efectivo', amount: (sale.receivedCash ?? 0) - sale.change }
    ];
  }
  if (method === 'fiar') {
    return [
      { label: 'Cobrado', amount: sale.received },
      { label: 'Fiado', amount: sale.fiadoAmount ?? 0 }
    ];
  }
  return [];
}

export function saleCashPortion(sale: SaleRecord): number {
  const method = sale.paymentMethod ?? 'efectivo';
  if (method === 'tarjeta') {
    return 0;
  }
  if (method === 'fiar') {
    return sale.received;
  }
  if (method === 'multiple') {
    return sale.total - (sale.receivedCard ?? 0);
  }
  return sale.total;
}