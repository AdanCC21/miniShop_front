import { CreditDTO } from "../dto/credit.dto";

export function getAllAmountAndPaid(credits: CreditDTO[]): { amount: number, paid: number } {
    let amount = 0;
    let paid = 0;
    credits.forEach(cred => {
        paid += Number(cred.paidAmount);
        amount += Number(cred.totalAmount)
    })
    return { amount, paid };
}