import { inject } from "@angular/core";
import { ToastService } from "../ui/toast/toast.service";

export function showError(e: any, toast: ToastService) {
    console.error(e);
    console.error(e.status);
    toast.error(e);
}