import { CreditDTO } from "./credit.dto"

export interface GuarantorDTO {
    id: string
    name: string
    shopUuid: string
    credits?: CreditDTO[]
    createdAt: Date | string
}

export interface CreateGuarantorDTO {
    name: string
}