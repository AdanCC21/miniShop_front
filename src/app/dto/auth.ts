export interface LoginDTO {
    email: string
    password: string
}

export interface RegisterDTO {
    user: RegUserDto
    shop: string | RegShopDTO
}

export interface RegUserDto {
    name: string
    email: string
    password: string
}

export interface RegShopDTO {
    name: string
    address: string
}