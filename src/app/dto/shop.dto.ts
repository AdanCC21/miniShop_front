import { UserDTO } from "./user.dto";

export interface ShopDTO {
  uuid: string;
  name: string;
  address: string;

  employees?: UserDTO[]
  waiting?: UserDTO[]

  createdAt: Date | string;
  updatedAt: Date | string;
}
