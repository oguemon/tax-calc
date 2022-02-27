/* --------------------------------------------------
 * 社会保険料
 * --------------------------------------------------*/

import { HI_STANDARD_INCOME, EP_STANDARD_INCOME } from './Data'

export interface DataSetForInsurancePremium {
    you: number,
    company: number,
    total: number,
}

export function sum (...premium: DataSetForInsurancePremium[])
{
    let sum_you: number = 0;
    let sum_company: number = 0;

    // 引数の数だけ回す
    for (let i = 0; i < premium.length; i++)
    {
        sum_you += premium[i].you;
        sum_company += premium[i].company;
    }

    const sum: DataSetForInsurancePremium = {
        you: sum_you,
        company: sum_company,
        total: sum_you + sum_company,
    }

    return sum;
}

export class InsurancePremium
{
    // 負担額
    public premium: DataSetForInsurancePremium = {you: 0, company: 0, total: 0};

    // 社会保険料の等級を求める
    // is_health_insuranceがfalseのときは厚生年金保険の等級を求める
    protected getInsuranceRank (income: number, is_health_insurance: boolean) {

        // 等級と標準報酬月額が格納される
        let standard_income = {
            rank: 0,
            monthly_income: 0,
        }

        const standard_income_list = is_health_insurance? HI_STANDARD_INCOME : EP_STANDARD_INCOME
        standard_income_list.some((e, index) => {
            if (income < e.less_than_income || index == standard_income_list.length - 1) {
                standard_income = e
                return true
            }
            return false
        });

        return standard_income
    }
}
