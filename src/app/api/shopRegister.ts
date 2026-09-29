import axios from "axios";
import { showError } from "../scripts/error";
import { ToastService } from "../ui/toast/toast.service";
import { backendRoute } from "../constants/global";

export async function GetCurShopReg(toast: ToastService) {
    try {
        const res = await axios.get(`${backendRoute}/shopregister/myshop`, { withCredentials: true });
        return res.data;
    } catch (e) {
        showError(e, toast);
        return null
    }
}

export async function SetOpneningCash(openingCash: number, toast: ToastService) {
    try {
        const res = await axios.patch(`${backendRoute}/shopregister/open`, { openingCash }, { withCredentials: true });
        return res.data;
    } catch (e) {
        showError(e, toast);
        return null
    }
}

export async function CloseShopReg(openingCash: number, toast: ToastService) {
    try {
        const res = await axios.patch(`${backendRoute}/shopregister/clode`, { openingCash }, { withCredentials: true });
        return res.data;
    } catch (e) {
        showError(e, toast);
        return null
    }
}

