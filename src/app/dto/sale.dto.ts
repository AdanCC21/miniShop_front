import { PaymentMethod } from "../entities/PaymentMethod";

export interface SaleDTO {
    id: string;
    shopUuid: string;
    total: number;
    paidCash: number;
    paidCard: number;
    method: PaymentMethod;
    date: Date;
}

export interface SaleDetail{
    id:string
    saleId:string
    productId:string
    quantity:number
    unitPrice:number
}

export interface CreateSaleDTO {
    total:number
    paidCash:number
    paidCard:number
    method:PaymentMethod
}

export interface CreateSaleDetailDTO {
    productId:string
    quantity:number
    unitPrice:number
}