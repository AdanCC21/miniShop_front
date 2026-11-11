import axios from 'axios';
import { backendRoute } from '../constants/global';
import { showError } from '../scripts/error';
import { ToastService } from '../ui/toast/toast.service';
import { ShopDTO } from '../dto/shop.dto';
import { Role } from '../entities/Role';

export async function GetShops(toast: ToastService) {
  try {
    const res = await axios.get(`${backendRoute}/shop`, { withCredentials: true });
    return res.data;
  } catch (e) {
    showError(e, toast);
    return [];
  }
}

export async function GetShop(toast: ToastService, uuid:string) {
  try {
    const res = await axios.get(`${backendRoute}/shop/byid/${uuid}`, { withCredentials: true });
    return res.data;
  } catch (e) {
    showError(e, toast);
    return [];
  }
}

export async function GetMyShop(toast: ToastService, employees = false, waiting = false, onlyname = false): Promise<ShopDTO | null> {
  try {
    const res = await axios.get(`${backendRoute}/shop/myshop`, { params: { employees, waiting, onlyname }, withCredentials: true })
    return res.data as ShopDTO;
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

export async function SetShopActive(uuid: string, active: boolean, toast: ToastService): Promise<boolean> {
  try {
    await axios.patch(`${backendRoute}/shop/byid/${encodeURIComponent(uuid)}/status`, { active }, { withCredentials: true });
    return true;
  } catch (e) {
    showError(e, toast);
    return false;
  }
}

export async function UpdateShopMemberRole(shopUuid: string, userUuid: string, role: Role, toast: ToastService): Promise<boolean> {
  try {
    await axios.patch(`${backendRoute}/shop/byid/${encodeURIComponent(shopUuid)}/member/${encodeURIComponent(userUuid)}/role`, { role }, { withCredentials: true });
    return true;
  } catch (e) {
    showError(e, toast);
    return false;
  }
}

export async function RemoveShopMember(shopUuid: string, userUuid: string, toast: ToastService): Promise<boolean> {
  try {
    await axios.delete(`${backendRoute}/shop/byid/${encodeURIComponent(shopUuid)}/member/${encodeURIComponent(userUuid)}`, { withCredentials: true });
    return true;
  } catch (e) {
    showError(e, toast);
    return false;
  }
}
