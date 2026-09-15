import axios from "axios";
import { backendRoute } from "../constants/global";
import { showError } from "../scripts/error";
import { ToastService } from "../ui/toast/toast.service";
import { ProductDTO, UpdateProductDTO } from "../dto/product.dto";

export async function GetProducts(toast: ToastService, category?: string): Promise<ProductDTO[] | []> {
    try {
        const res = await axios.get(`${backendRoute}/product`, { withCredentials: true })
        return res.data;
    } catch (e) {
        showError(e, toast);
        return [];
    }
}

export async function GetProdById(id: string, toast: ToastService) {
    try {
        const res = await axios.get(`${backendRoute}/product/${id}`, { withCredentials: true });
        return res.data;
    } catch (e) {
        showError(e, toast);
        return null;
    }
}

export async function GetProdByCode(code: string, toast: ToastService): Promise<ProductDTO | null> {
    try {
        const res = await axios.get(`${backendRoute}/product/bycode/${code}`, { withCredentials: true });
        return res.data;
    } catch (e) {
        showError(e, toast);
        return null;
    }
}

export interface CreateProductPayload {
    shopUuid: string;
    categoryId: string | null;
    name: string;
    code: string;
    price: number;
    quantity: number;
    image: string | null;
}

export async function CreateProduct(dto: CreateProductPayload, toast: ToastService) {
    try {
        const res = await axios.post(`${backendRoute}/product`, dto, { withCredentials: true });
        return res.data;
    } catch (e) {
        showError(e, toast);
        return null;
    }
}

export async function UpdateProduct(dto: UpdateProductDTO, toast: ToastService) {
    try {
        if(!dto.id) throw new Error("Para actualizar un producto en especifico necesitamos el id de este mismo");

        const res = await axios.patch(`${backendRoute}/product/byid/${dto.id}`, dto, { withCredentials: true });
        return res.data ? true : false;
    } catch (e) {
        showError(e, toast);
        return false
    }
}

export async function updateQuantity(dto: { id: string, quantity: string }[], toast: ToastService) {
    try {
        const res = await axios.patch(`${backendRoute}/product/quantity`, dto, { withCredentials: true });
        return res.data ? true : false;
    } catch (e) {
        showError(e, toast);
        return false
    }
}

export async function DeleteProduct(id:string, toast:ToastService) {
    try {
        const res = await axios.delete(`${backendRoute}/product/${id}`, { withCredentials: true });
        return res.data ? true : false;
    } catch (e) {
        showError(e, toast);
        return false
    }
}