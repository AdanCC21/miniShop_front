import { Role } from "../entities/Role"

export interface UserDTO {
    id:string
    name:string
    email:string
    role:Role
    createdAt:Date | string
    updatedAt:Date | string
}