import { PaymentMethod } from '../../entities/PaymentMethod';

export { PaymentMethod };

export interface CartLine {
  id:string
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
  const method = sale.paymentMethod ?? PaymentMethod.CASH;
  if (method === PaymentMethod.MIXED) {
    return [
      { label: 'Tarjeta', amount: sale.receivedCard ?? 0 },
      { label: 'Efectivo', amount: (sale.receivedCash ?? 0) - sale.change }
    ];
  }
  if (method === PaymentMethod.CREDIT) {
    return [
      { label: 'Cobrado', amount: sale.received },
      { label: 'Fiado', amount: sale.fiadoAmount ?? 0 }
    ];
  }
  return [];
}

export function saleCashPortion(sale: SaleRecord): number {
  const method = sale.paymentMethod ?? PaymentMethod.CASH;
  if (method === PaymentMethod.CARD) {
    return 0;
  }
  if (method === PaymentMethod.CREDIT) {
    return sale.received;
  }
  if (method === PaymentMethod.MIXED) {
    return sale.total - (sale.receivedCard ?? 0);
  }
  return sale.total;
}