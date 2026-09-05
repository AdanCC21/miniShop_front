export interface MonthlySales {
  month: string;
  sales: number;
  productsSold: number;
  total: number;
}

export const MONTHLY_SALES: MonthlySales[] = [
  { month: '2026-06', sales: 214, productsSold: 612, total: 48250.5 },
  { month: '2026-07', sales: 238, productsSold: 689, total: 51380.25 },
  { month: '2026-08', sales: 96, productsSold: 254, total: 21300.75 }
];