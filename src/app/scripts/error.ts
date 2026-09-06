import axios, { AxiosError } from "axios";
import { ToastService } from "../ui/toast/toast.service";

export function showError(e: unknown, toast: ToastService) {
    let msg = "Ocurrió un error inesperado.";

    if (axios.isAxiosError(e)) {
        const err = e as AxiosError<{ message?: string }>;
        if (err.response) {
            msg = `Error ${err.response.status}: ${err.response.data?.message ?? "Error en la petición"}`;
        } else if (err.request) {
            msg = "El servidor no responde, por favor inténtalo de nuevo más tarde.";
        }
        console.error(err.response?.data);
    }

    toast.error(msg);
}