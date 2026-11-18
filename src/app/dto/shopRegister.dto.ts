export interface ShopRegisterDTO {
    uuid: string
    shopUuid: string
    
    openingCash: number
    totalSales: number
    currentCash: number
    
    isOpen: boolean

    openedAt: Date | string
    closedAt: Date | string | null
    updatedAt: Date | string
}
