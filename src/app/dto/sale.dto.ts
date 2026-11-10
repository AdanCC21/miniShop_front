import { PaymentMethod } from "../entities/PaymentMethod";
import { ProductDTO } from "./product.dto";

export interface SaleDTO {
    id: string;
    shopUuid: string;
    
    paidCash: number;
    paidCard: number;
    credit: SaleCreditDTO | null;
    method: PaymentMethod;
    
    details?: SaleDetail[]
    total: number;
    
    date: Date | string;
}

export interface SaleCreditDTO {
    id: string;
    guarantorId: string;
    saleId: string;
    totalAmount: number;
    paidAmount: number;
    status: string;
    createdAt: Date | string;
    guarantor?: { id: string; name: string };
}

export interface ShopRegisterClosureDTO {
    uuid: string;
    shopUuid: string;
    openingCash: number;
    totalCollected: number;
    currentCash: number;
    openedAt: Date | string;
    closedAt: Date | string;
    salesCount: number;
    productsSold: number;
    totalSales: number;
    cashReceived: number;
    cardReceived: number;
    creditOutstanding: number;
}

export interface ShopRegisterClosureDetailsDTO extends ShopRegisterClosureDTO {
    sales: SaleDTO[];
}

export interface SaleDetail {
    id: string
    saleId: string
    productId: string
    product?:ProductDTO
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
