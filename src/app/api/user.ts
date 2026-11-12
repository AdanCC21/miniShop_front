import axios from "axios";
import { backendRoute } from "../constants/global";
import { Role } from "../entities/Role";
import { showError } from "../scripts/error";
import { ToastService } from "../ui/toast/toast.service";
import { UserDTO } from "../dto/user.dto";

export interface SessionProfile {
    userId: number | string;
    name?: string;
    email: string;
    role: string;
    shopUuid?: string | null;
}

export async function validateSession(): Promise<SessionProfile | null> {
    try {
        const res = await axios.get(`${backendRoute}/auth/profile`, { withCredentials: true });
        return res.data as SessionProfile;
    } catch {
        return null;
    }
}

export async function IHaveThisRole(rol: Role, toast: ToastService): Promise<boolean> {
    try {
        const res = await axios.get(`${backendRoute}/auth/have-rol/${rol}`, { withCredentials: true });
        return res.data;
    } catch (e) {
        showError(e, toast)
        return false;
    }
}

export async function GetUsers(toast: ToastService): Promise<UserDTO[]> {
    try {
        const res = await axios.get(`${backendRoute}/users`, { withCredentials: true });
        return res.data as UserDTO[];
    } catch (e) {
        showError(e, toast);
        return [];
    }
}

export async function UpdateUserRole(id: string, role: Role, toast: ToastService): Promise<boolean> {
    try {
        await axios.patch(`${backendRoute}/users`, { id, role }, { withCredentials: true });
        return true;
    } catch (e) {
        showError(e, toast);
        return false;
    }
}

export async function DeleteUser(id: string, toast: ToastService): Promise<boolean> {
    try {
        await axios.delete(`${backendRoute}/users/${encodeURIComponent(id)}`, { withCredentials: true });
        return true;
    } catch (e) {
        showError(e, toast);
        return false;
    }
}
