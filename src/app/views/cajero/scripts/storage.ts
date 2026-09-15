import { SaleRecord } from '../cajero.data';

export const CAJA_INITIAL_KEY = 'minishop_caja_initial';
export const CAJA_SALES_KEY = 'minishop_caja_sales';
export const CAJA_COUNT_KEY = 'minishop_caja_count';
export const CAJA_PRODUCTS_KEY = 'minishop_caja_products';
export const CAJA_HISTORY_KEY = 'minishop_caja_history';

export function loadNumber(key: string): number | null {
  const raw = localStorage.getItem(key);
  if (raw === null) {
    return null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function loadHistory(): SaleRecord[] {
  const raw = localStorage.getItem(CAJA_HISTORY_KEY);
  if (!raw) {
    return [];
  }
  try {
    return JSON.parse(raw) as SaleRecord[];
  } catch {
    return [];
  }
}

export function closeLocalStorage() {
  localStorage.removeItem(CAJA_INITIAL_KEY);
  localStorage.removeItem(CAJA_SALES_KEY);
  localStorage.removeItem(CAJA_COUNT_KEY);
  localStorage.removeItem(CAJA_PRODUCTS_KEY);
  localStorage.removeItem(CAJA_HISTORY_KEY);
}