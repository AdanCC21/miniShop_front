import axios from "axios";
import { backendRoute } from "../constants/global";
import { showError } from "../scripts/error";
import { ToastService } from "../ui/toast/toast.service";
import {
    CreateSaleDetailDTO,
    CreateSaleDTO,
    SaleDTO,
    ShopRegisterClosureDTO,
    ShopRegisterClosureDetailsDTO,
} from "../dto/sale.dto";

export async function GetSales(today: boolean = false, toast: ToastService):Promise<SaleDTO[] | null> {
    try {
        const res = await axios.get(`${backendRoute}/sale/myshop?today=${today}`, { withCredentials: true })
        return res.data;
    } catch (e) {
        showError(e, toast);
        return null;
    }
}

export async function GetRegisterClosures(
    hours: number,
    toast: ToastService,
): Promise<ShopRegisterClosureDTO[] | null> {
    try {
        const res = await axios.get(`${backendRoute}/shopregister/closures`, {
            params: { hours },
            withCredentials: true,
        });
        return res.data;
    } catch (e) {
        showError(e, toast);
        return null;
    }
}

export async function GetRegisterClosureDetails(
    uuid: string,
    toast: ToastService,
): Promise<ShopRegisterClosureDetailsDTO | null> {
    try {
        const res = await axios.get(`${backendRoute}/shopregister/closures/${encodeURIComponent(uuid)}`, {
            withCredentials: true,
        });
        return res.data;
    } catch (e) {
        showError(e, toast);
        return null;
    }
}

export async function PostSales(dto: { sale: CreateSaleDTO, details: CreateSaleDetailDTO[] }, toast: ToastService) {
    try {
        const res = await axios.post(`${backendRoute}/sale`, dto, { withCredentials: true })
        return true;
    } catch (e) {
        showError(e, toast);
        return false;
    }
}
