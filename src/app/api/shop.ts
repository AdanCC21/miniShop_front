import axios from 'axios';

import { backendRoute } from '../constants/global';
import { ShopDTO } from '../dto/shop.dto';
import { showError } from '../scripts/error';
import { ToastService } from '../ui/toast/toast.service';

export async function GetShopDetails(uuid: string, toast: ToastService): Promise<ShopDTO | null> {
  try {
    const res = await axios.get(`${backendRoute}/shop/${encodeURIComponent(uuid)}`, {
      withCredentials: true
    });
    return res.data as ShopDTO;
  } catch (error) {
    showError(error, toast);
    return null;
  }
}
