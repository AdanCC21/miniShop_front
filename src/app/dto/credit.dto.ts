import { CreditStatus } from "../entities/creditStatus";

export interface CreditDTO {
    id: string;
    guarantorId: string;
    saleId: string;
    totalAmount: number;
    paidAmount: number;
    status: CreditStatus;
    createdAt: Date;
}