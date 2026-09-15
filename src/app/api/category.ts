import axios from "axios";
import { showError } from "../scripts/error";
import { ToastService } from "../ui/toast/toast.service";
import { backendRoute } from "../constants/global";
import { CategoryDTO, CreateCategoryDTO } from "../dto/category.dto";

export async function GetCategory(id:string, toast: ToastService): Promise<CategoryDTO | null> {
    try {
        const res = await axios.get(`${backendRoute}/category/${id}`, { withCredentials: true });
        return res.data;
    } catch (e) {
        showError(e, toast);
        return null;
    }
}

export async function GetCategories(toast: ToastService): Promise<CategoryDTO[]> {
    try {
        const res = await axios.get(`${backendRoute}/category`, { withCredentials: true });
        console.log(res.data);
        return res.data;
    } catch (e) {
        showError(e, toast);
        return [];
    }
}

export async function CreateCategory(dto: CreateCategoryDTO, toast: ToastService) {
    try {
        const res = await axios.post(`${backendRoute}/category`, dto, { withCredentials: true });
        console.log(res.data);
        return res.data;
    } catch (e) {
        showError(e, toast);
        return null;
    }
}