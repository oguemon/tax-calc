'use strict'

/* --------------------------------------------------
 * 所得税
 * --------------------------------------------------*/

import { round } from './Util';
import { RateAndDeduction, getIncomeTaxRate } from './Data';

export class IncomeTax
{
    // 給与所得
    public taxable_standard_income: number = 0;

    // 基礎控除
    public basic_deduction: number = 0;

    // 社会保険料控除
    public premium_deduction: number = 0;

    // 控除額合計
    public total_deduction: number = 0;

    // 課税所得金額
    public taxable_income: number = 0;

    // 所得税率
    public tax_rate: number = 0;

    // 所得税額
    public tax: number = 0;

    // 復興特別所得税額
    public reconstruction_special: number = 0;

    constructor (
        annual_income: number = 0,
        annual_premium: number = 0,
    )
    {
        // 給与収入から、給与所得を求める
        this.taxable_standard_income = this.calcTaxableIncome(annual_income);

        // 基礎控除
        this.basic_deduction = this.calcBasicDeductionsIncomeTax(this.taxable_standard_income);

        // 社会保険料控除
        this.premium_deduction = annual_premium;

        // 控除額を求める
        this.total_deduction = this.basic_deduction
                             + this.premium_deduction;

        // 課税所得金額を求める（課税所得は千円未満の端数切捨）
        this.taxable_income = round(Math.max(this.taxable_standard_income - this.total_deduction, 0), 1000, 'floor');

        // 所得税率を求める
        const rad: RateAndDeduction = getIncomeTaxRate(this.taxable_income);
        this.tax_rate = rad.rate;

        // 所得税額を求める
        this.tax = this.calcBasicIncomeTax(this.taxable_income, rad);

        // 復興特別所得税額
        this.reconstruction_special = this.calcReconstructionSpecialIncomeTax(this.tax);
    }

    // 課税所得金額を求める（給与所得控除額の計算がいらない）
    private calcTaxableIncome (income: number): number
    {
        // 年調給与額
        let yearend_tax_adj_income: number = 0;

        // 給与所得控除後の給与等の金額
        let taxable_income: number = 0;

        // (1) 年調給与額の算出（令和7年分）
        // https://www.nta.go.jp/publication/pamph/gensen/nencho2025/pdf/204.pdf
        if (income < 190_0000) {
            // 給与の総額をそのまま年調給与額とします
            yearend_tax_adj_income = income;
        } else if (income < 660_0000) {
            // 算式1. 余りの計算
            const remainder = (income - 109_0000) % 4000;
            // 算式2. 年調給与額の計算
            yearend_tax_adj_income = income - remainder;
        } else { // 660万円以上
            // 給与の総額をそのまま年調給与額とします
            yearend_tax_adj_income = income;
        }

        // (2) 給与所得控除後の給与等の金額の計算（令和7年分）
        // https://www.nta.go.jp/publication/pamph/gensen/nencho2025/pdf/204.pdf
        // 給与総額が2000万円を超えると上記資料の範囲外となるが、
        // 次の資料より、2000万円を境に控除金額が変わらないことが判る
        // https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm
        if (yearend_tax_adj_income < 65_1000) {
            taxable_income = 0;
        } else if (yearend_tax_adj_income < 190_0000) {
            taxable_income = yearend_tax_adj_income  - 650000;
        } else if (yearend_tax_adj_income < 360_0000) {
            taxable_income = yearend_tax_adj_income * 0.7 + 8_0000;
        } else if (yearend_tax_adj_income < 660_0000) {
            taxable_income = yearend_tax_adj_income * 0.8 + 44_0000;
        } else if (yearend_tax_adj_income < 850_0000) {
            taxable_income = yearend_tax_adj_income * 0.9 + 110_0000;
        } else { // 850万円以上
            taxable_income = yearend_tax_adj_income - 1950000;
        }

        return Math.floor(taxable_income);
    }

    // 所得税における基礎控除額を求める（令和7、8年分）※令和9年分から変わる
    // https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1199.htm
    private calcBasicDeductionsIncomeTax (income: number) : number
    {
        if (income <= 132_0000) return 95_0000
        if (income <= 336_0000) return 88_0000
        if (income <= 489_0000) return 68_0000
        if (income <= 655_0000) return 63_0000
        if (income <= 2350_0000) return 58_0000
        if (income <= 2400_0000) return 48_0000
        if (income <= 2450_0000) return 32_0000
        if (income <= 2500_0000) return 16_0000

        // 2500万円超
        return 0;
    }

    // 課税所得金額から税額を計算（平成27年分以降）
    // https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm
    private calcBasicIncomeTax (taxable_income: number, rad: RateAndDeduction) : number
    {
        // 端数処理前の税額を格納
        const tax_pre_round: number = taxable_income * rad.rate - rad.deduction;

        // 1000円以下の金額を切り捨て
        const tax: number = round(tax_pre_round, 1000, 'floor');

        return tax;
    }

    // 所得税額から復興特別所得税額を計算（平成25年分〜令和19年分が対象）
    // https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm
    private calcReconstructionSpecialIncomeTax (income_tax: number) : number
    {
        // 復興特別所得税額
        const reconstruction_special_income_tax: number = 0.021 * income_tax;

        return reconstruction_special_income_tax;
    }
}
