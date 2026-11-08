import axios from 'axios';

import { backendRoute } from '../constants/global';
import { showError } from '../scripts/error';
import { ToastService } from '../ui/toast/toast.service';
import { ShopDTO } from '../dto/shop.dto';
import { UserDTO } from '../dto/user.dto';

export interface MyShopDTO extends ShopDTO {
  employees?: UserDTO[];
  waiting?: UserDTO[];
}

export async function GetMyShop(toast: ToastService, employees = false, waiting = false): Promise<MyShopDTO | null> {
  try {
    const res = await axios.get(`${backendRoute}/shop/myshop`, { params: { employees, waiting }, withCredentials: true })
    return res.data as MyShopDTO;
  } catch (e) {
    showError(e, toast);
    return null
  }
}

export async function HireEmployee(userUuid: string, toast: ToastService) {
  try {
    const res = await axios.patch(`${backendRoute}/shop/hire`, { userUuid }, { withCredentials: true })
    return res.data;
  } catch (e) {
    showError(e, toast);
    return null
  }
}

export async function RejectEmployee(userUuid: string, toast: ToastService) {
  try {
    const res = await axios.patch(`${backendRoute}/shop/reject`, { userUuid }, { withCredentials: true })
    return res.data;
  } catch (e) {
    showError(e, toast);
    return null
  }
}

export async function RemoveEmployee(userUuid: string, toast: ToastService): Promise<boolean> {
  try {
    const res = await axios.delete(`${backendRoute}/shop/employee/${encodeURIComponent(userUuid)}`, {
      withCredentials: true
    });
    return Boolean(res.data);
  } catch (e) {
    showError(e, toast);
    return false;
  }
}
