import axios from "axios";
import { backendRoute } from "../constants/global";
import { ToastService } from "../ui/toast/toast.service";
import { showError } from "../scripts/error";
import { GuarantorDTO } from "../dto/guarantor";

export async function GetGuarantors(toast: ToastService): Promise<GuarantorDTO[]> {
    try {
        const res = await axios.get(`${backendRoute}/guarantor/myshop`, { withCredentials: true });
        console.log(res.data);
        return res.data;
    } catch (e) {
        showError(e, toast);
        return []
    }
}

export async function CreateGuarantor(name: string, toast: ToastService) {
    try {
        const res = await axios.post(`${backendRoute}/guarantor`, { name }, { withCredentials: true });
        return res.data ? true : false;
    } catch (e) {
        showError(e, toast);
        return null
    }
}

export async function AddCreditToGuarantor(id: string, amount: number, toast: ToastService) {
    try {
        const res = await axios.patch(`${backendRoute}/guarantor/add`, { id, amount }, { withCredentials: true });
        return res.data ? true : false;
    } catch (e) {
        showError(e, toast);
        return false;
    }
}

export async function ReduceCreditToGuarantor(id: string, amount: number, toast: ToastService) {
    try {
        const res = await axios.patch(`${backendRoute}/guarantor/reduce`, { id, amount }, { withCredentials: true });
        return res.data ? true : false;
    } catch (e) {
        showError(e, toast);
        return false;
    }
}