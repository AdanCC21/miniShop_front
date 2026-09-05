import axios from "axios";
import { backendRoute } from "../constants/global";
import { showError } from "../scripts/error";
import { ToastService } from "../ui/toast/toast.service";

export async function Login(email: string, password: string, toast:ToastService): Promise<boolean | null> {
    try {
        const { data } = await axios.post(`http://localhost:3000/auth/login`, { email, password });
        return data ? true : false
    } catch (e) {
        showError(e,toast);
        return null;
    }
}