import axios from "axios";
import { backendRoute } from "../constants/global";
import { showError } from "../scripts/error";
import { ToastService } from "../ui/toast/toast.service";
import { LoginDTO, RegisterDTO } from "../dto/auth";

export async function Login(dto: LoginDTO, toast: ToastService): Promise<any | null> {
    try {
        const response = await axios.post(`${backendRoute}/auth/login`, dto, { withCredentials: true });
        return response.data
    } catch (e) {
        showError(e, toast);
        return null;
    }
}

export async function Register(dto: RegisterDTO, toast: ToastService): Promise<boolean | null> {
    try {
        const res = await axios.post(`${backendRoute}/auth/register`, dto, { withCredentials: true });
        return res.data ? true : false;
    } catch (e) {
        showError(e, toast);
        return null;
    }
}

export async function LogOut(toast: ToastService) {
    try {
        const res = await axios.get(`${backendRoute}/auth/logout`, { withCredentials: true });
        return res ? true : false;
    } catch (e) {
        showError(e, toast);
        return null;
    }
}