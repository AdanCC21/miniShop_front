import { PaymentMethod } from "../entities/PaymentMethod";

export interface SaleDTO {
    id: string;
    shopUuid: string;
    
    paidCash: number;
    paidCard: number;
    credit: number | null;
    method: PaymentMethod;
    
    details?: SaleDetail[]
    total: number;
    
    date: Date;
}

export interface SaleDetail {
    id: string
    saleId: string
    productId: string
    quantity: number
    unitPrice: number
}

export interface CreateSaleDTO {
    total: number
    paidCash: number
    paidCard: number
    method: PaymentMethod
    guarantorId?:string
}

export interface CreateSaleDetailDTO {
    productId: string
    quantity: number
    unitPrice: number
}