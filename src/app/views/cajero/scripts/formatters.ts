import { PaymentMethod } from '../../../entities/PaymentMethod';

export function formatPrice(value: number): string {
  return Number(value).toFixed(2);
}

export function paymentMethodLabel(method: PaymentMethod | undefined): string {
  if (method === PaymentMethod.CARD) {
    return 'Tarjeta';
  }
  if (method === PaymentMethod.MIXED) {
    return 'Múltiple';
  }
  if (method === PaymentMethod.CREDIT) {
    return 'Fiado';
  }
  return 'Efectivo';
}