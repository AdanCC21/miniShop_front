export interface ShopRegisterDTO {
    uuid: string
    shopUuid: string
    
    openingCash: number
    totalSales: number
    currentCash: number
    
    isOpen: boolean

    closedAt: Date | string
    openingAt: Date | string
    updatedAt: Date | string
}