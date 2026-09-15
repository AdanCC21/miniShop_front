import { PaymentMethod } from "../entities/PaymentMethod";

export function comparePaymant(base: PaymentMethod, text: string): boolean {
    return base == text;
}