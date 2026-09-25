import { PaymentMethod } from "../entities/PaymentMethod";

export function comparePaymant(base: PaymentMethod, text: string): boolean {
    return base == text;
}

export function getMethodUsed(method: PaymentMethod): string {
    switch (method) {
        case PaymentMethod.CARD:
            return "Tarjeta"
        case PaymentMethod.CASH:
            return "Efectivo"
        case PaymentMethod.CREDIT:
            return "Fiado"
        case PaymentMethod.MIXED:
            return "Mixto"
        default:
            console.error(method)
            return "Metodo no reconocido"
    }
}