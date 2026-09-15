import { CategoryDTO } from "./category.dto"

export interface ProductDTO {
    id: string
    name: string
    image: string
    code: string

    price: number
    quantity: number

    shopUuid: string

    categoryId: string
    category?: CategoryDTO

    createdAt: string | Date
    updatedAt: string | Date
}

export interface CreateProductDTO {
    name: string
    code: string
    categoryId: string
    category?: CategoryDTO
    price: number
    quantity: number
}