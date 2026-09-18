export interface GuarantorDTO {
    id: string
    name: string
    shopUuid: string
    createdAt: Date | string
}

export interface CreateGuarantorDTO {
    name: string
}