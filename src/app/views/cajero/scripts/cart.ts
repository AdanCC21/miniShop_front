import { CartLine } from '../cajero.data';

export function cartTotalQuantity(cart: CartLine[]): number {
  return cart.reduce((sum, line) => sum + line.quantity, 0);
}

export function cartTotal(cart: CartLine[]): number {
  return cart.reduce((sum, line) => sum + Number(line.price) * Number(line.quantity), 0);
}