import axios from "axios";
import { backendRoute } from "../constants/global";
import { showError } from "../scripts/error";
import { ToastService } from "../ui/toast/toast.service";

export async function GetProducts(toast: ToastService) {
    try {
        const user = JSON.parse(localStorage.getItem('minishop_session') || '');
        if (!user) throw new Error("El usuario no tiene una session activa o valida");

        console.log(`${backendRoute}/product/${user.shopUuid}`);
        const res = await axios.get(`${backendRoute}/product?shop${user.shopUuid}`, { withCredentials: true })
        return res.data;
    } catch (e) {
        showError(e, toast);
        return null;
    }
}

export async function GetProductDetails(id: string, toast: ToastService) {
    try {
        const res = await axios.get(`${backendRoute}/product/${id}`,{withCredentials:true});
        return res.data;
    } catch (e) {
        showError(e, toast);
        return null;
    }
}