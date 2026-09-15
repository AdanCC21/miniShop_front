import axios, { AxiosError } from "axios";
import { ToastService } from "../ui/toast/toast.service";
import { Router } from "@angular/router";

export function showError(e: unknown, toast: ToastService, router?: Router) {
    let msg = "Ocurrió un error inesperado.";

    if (axios.isAxiosError(e)) {
        const err = e as AxiosError<{ message?: string }>;
        if (err.response) {
            msg = handleStatusCode(err, router);

        } else if (err.request) {
            msg = "El servidor no responde, por favor inténtalo de nuevo más tarde.";
        }
        console.error(err.response?.data);
    }

    toast.error(msg);
}

function handleStatusCode(err: AxiosError<{ message?: string }>, router?: Router) {
    let msg = `Error ${err.response?.status}: ${err.response?.data?.message ?? "Error en la petición"}`;

    switch (err.response?.status) {
        case 401:
            router?.navigate(['/auth']);
            msg = err.response?.data?.message ?? `Por favor inicie sesion para continuar`;
            break;
        case 403:
            msg = err.response?.data?.message ?? `No tienes autorizacion para esta pagina`;
            router?.navigate(['/'])
            break;
        case 404:
            msg = err.response?.data?.message ?? `El elemento que busca no existe`;
            break;
    }
    return msg;
}