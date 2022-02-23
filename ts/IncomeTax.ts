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

    // 給与所得控除額を計算（令和2年分以降）
    // https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm
    /*
    private calcTaxableIncomeDeductions (income = 0): number
    {
        // 給与所得控除額
        let taxable_income_deductions: number = 0;

        if (income <= 1800000) {
            // 最低でも55万は控除される
            taxable_income_deductions = Math.max(income * 0.4 - 100000, 550000);
        }
        if (income <= 3600000) {
            taxable_income_deductions = income * 0.3 + 80000;
        }
        if (income <= 6600000) {
            taxable_income_deductions = income * 0.2 + 440000;
        }
        if (income <= 8500000) {
            taxable_income_deductions = income * 0.1 + 1100000;
        } else {
            taxable_income_deductions = 1950000;
        }

        return taxable_income_deductions;
    }
    */

    // 課税所得金額を求める（給与所得控除額の計算がいらない）
    private calcTaxableIncome (income: number): number
    {
        // 年調給与額
        let yearend_tax_adj_income: number = 0;

        // 給与所得控除後の給与等の金額
        let taxable_income: number = 0;

        // (1) 年調給与額の算出（令和元年分より・令和2年分は変更なし）
        // https://www.nta.go.jp/publication/pamph/gensen/nencho2019/pdf/82-83.pdf
        if (income < 1619000) {
            // 給与の総額をそのまま年調給与額とします
            yearend_tax_adj_income = income;
        } else if (income < 6600000) {
            // 階差と同一階差の最小値の設定
            let rank_width: number = 0;
            let rank_min: number = 0;

            if (income < 1620000) {
            rank_width = 1000;
            rank_min = 1619000;
            } else if (income < 1624000) {
            rank_width = 2000;
            rank_min = 1620000;
            } else { // 162万4000円以上
            rank_width = 1000;
            rank_min = 1624000;
            }

            // 算式1. 余りの計算
            const remainder: number = (income - rank_min) % rank_width;

            // 算式2. 年調給与額の計算
            yearend_tax_adj_income = income - remainder;
        } else { // 660万円以上
            // 給与の総額をそのまま年調給与額とします
            yearend_tax_adj_income = income;
        }

        // (2) 給与所得控除後の給与等の金額の計算（令和2年分事前の情報提供より）
        // https://www.nta.go.jp/users/gensen/nenmatsu/denshikeisan.htm
        if (yearend_tax_adj_income < 551000) {
            taxable_income = 0;
        } else if (yearend_tax_adj_income < 1619000) {
            taxable_income = yearend_tax_adj_income  - 550000;
        } else if (yearend_tax_adj_income < 1620000) {
            taxable_income = yearend_tax_adj_income * 0.6 + 97600;
        } else if (yearend_tax_adj_income < 1622000) {
            taxable_income = yearend_tax_adj_income * 0.6 + 98000;
        } else if (yearend_tax_adj_income < 1624000) {
            taxable_income = yearend_tax_adj_income * 0.6 + 98800;
        } else if (yearend_tax_adj_income < 1628000) {
            taxable_income = yearend_tax_adj_income * 0.6 + 99600;
        } else if (yearend_tax_adj_income < 1800000) {
            taxable_income = yearend_tax_adj_income * 0.6 + 100000;
        } else if (yearend_tax_adj_income < 3600000) {
            taxable_income = yearend_tax_adj_income * 0.7 - 80000;
        } else if (yearend_tax_adj_income < 6600000) {
            taxable_income = yearend_tax_adj_income * 0.8 - 440000;
        } else if (yearend_tax_adj_income < 8500000) {
            taxable_income = yearend_tax_adj_income * 0.9 - 1100000;
        } else { // 850万円以上
            taxable_income = yearend_tax_adj_income - 1950000;
        }

        return Math.floor(taxable_income);
    }

    // 所得税における基礎控除額を求める（令和2年分以降）
    // https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1199.htm
    private calcBasicDeductionsIncomeTax (income: number) : number
    {
        // 基本控除額を格納
        let basic_deductions: number = 0;

        if (income <= 2400 * 10000) {
            basic_deductions = 48 * 10000;
        } else if (income <= 2450 * 10000) {
            basic_deductions = 32 * 10000;
        } else if (income <= 2500 * 10000) {
            basic_deductions = 16 * 10000;
        } else { // 2500万円超
            basic_deductions = 0;
        }

        return basic_deductions;
    }

    // 課税所得金額から税額を計算（平成27年分以降・令和2年分は変更なし）
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
