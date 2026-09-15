export interface CategoryDTO {
    id: string
    name: string
    shopUuid?: string
    createdAt?: string | Date
    updatedAt?: string | Date
}

export interface CreateCategoryDTO {
    name: string
}