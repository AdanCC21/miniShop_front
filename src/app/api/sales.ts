import axios from "axios";
import { backendRoute } from "../constants/global";
import { showError } from "../scripts/error";
import { ToastService } from "../ui/toast/toast.service";

export async function GetSales(today: boolean = false, toast: ToastService) {
    try {
        const res = await axios.get(`${backendRoute}/sales/myshop?today=${today}`, { withCredentials: true })
        return res.data;
    } catch (e) {
        showError(e, toast);
        return null;
    }
}