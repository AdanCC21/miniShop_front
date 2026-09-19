import axios from "axios";
import { ToastService } from "../ui/toast/toast.service";
import { backendRoute } from "../constants/global";
import { showError } from "../scripts/error";

export async function AdjustCredit(amount: number, creditId: string, toast: ToastService) {
    try {
        const res = await axios.patch(`${backendRoute}/credit/${creditId}?adjust=true`, { paidAmount: amount }, { withCredentials: true })
        console.log(res.data);
        return res.data ? true : false
    } catch (e) {
        showError(e, toast);
        return false;
    }
}