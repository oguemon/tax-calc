/* --------------------------------------------------
 * 住民税
 * --------------------------------------------------*/

import * as Data from './Data';
import { round } from './Util';

export interface DataSetForResidentTax {
    pref: number,
    city: number,
    total: number,
}

export class ResidentTax
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

    // 均等割
    public capitation: DataSetForResidentTax = {pref: 0, city: 0, total: 0};

    // 所得割税率
    public income_tax_rate: DataSetForResidentTax = {pref: 0, city: 0, total: 0};

    // 所得割
    public income_tax: DataSetForResidentTax = {pref: 0, city: 0, total: 0};

    // 住民税合計
    public tax: DataSetForResidentTax = {pref: 0, city: 0, total: 0};

    // 住民税月額（7月〜翌5月）
    public tax_monthly: number = 0;

    // 住民税月額（7月〜翌5月）
    public tax_monthly_june: number = 0;

    constructor (
        annual_income: number = 0,
        annual_premium: number = 0,
        resident_pref: number = 0,
        resident_city: number = 0
    )
    {
        // 給与収入から、給与所得を求める
        this.taxable_standard_income = this.calcTaxableIncome(annual_income);

        // 基礎控除
        this.basic_deduction = this.calcTaxableIncomeDeductions() // 基礎控除（所得税と多少異なるのに注意）

        // 社会保険料控除
        this.premium_deduction = annual_premium;

        // 控除額を求める
        this.total_deduction = this.basic_deduction
                             + this.premium_deduction;

        // 課税所得金額（千円未満の端数切捨）
        this.taxable_income = round(Math.max(this.taxable_standard_income - this.total_deduction, 0), 1000, 'floor');

        // 均等割
        this.capitation = this.calcCapitation(resident_pref, resident_city);

        //所得割
        const is_taxable: boolean = this.isTaxable(this.taxable_standard_income);
        if (is_taxable) {
            // 所得割の税率を求める
            this.income_tax_rate = this.calcResidentTaxRate(resident_pref, resident_city);

            // 調整控除
            const adjust_deduction: DataSetForResidentTax = this.calcAdjustDeduction(this.taxable_income, this.income_tax_rate);

            // 調整控除済の最終的な所得割額
            this.income_tax = this.calcIncomeTax(this.taxable_income, this.income_tax_rate, adjust_deduction);
        }

        // 住民税
        this.tax.pref = this.capitation.pref + this.income_tax.pref;
        this.tax.city = this.capitation.city + this.income_tax.city;
        this.tax.total = this.tax.pref + this.tax.city;

        // 月あたりの住民税額
        this.tax_monthly = round(this.tax.total / 12, 100, 'floor');
        this.tax_monthly_june = this.tax.total - 11 * this.tax_monthly; // 6月分は端数の切捨額を含むため少し多い
    }

    // 給与所得金額を求める（給与所得控除額の計算がいらない）
    private calcTaxableIncome (income = 0): number
    {
        if (income < 651000) {
            return 0;
        }
        else if (income < 1619000) {
            return (income - 650000);
        }
        else if (income < 1620000) {
            return 969000;
        }
        else if (income < 1622000) {
            return 970000;
        }
        else if (income < 1624000) {
            return 972000;
        }
        else if (income < 1628000) {
            return 974000
        }
        else if (income < 6600000) {
            // これを給与収入とみなす調整後金額
            const income_adjusted: number = Math.floor(income / 4000) * 4000

            if (income < 1800000) {
                return (income_adjusted * 0.6);
            }
            else if (income < 3600000) {
                return (income_adjusted * 0.7 - 180000);
            }
            else if (income < 6600000) {
                return (income_adjusted * 0.8 - 540000);
            }
        }
        else if (income < 10000000) {
            return (income * 0.9 - 1200000);
        }
        else { // 1000万円以上
            return (income - 2200000);
        }
    }

    // 給与所得控除額を計算（令和2年分以降）
    private calcTaxableIncomeDeductions (): number
    {
        return 330000;
    }

    /* --------------------------------------------------
     * 住民税（均等割）
     * --------------------------------------------------*/
    private calcCapitation (pref_code = 0, city_code = 0) : DataSetForResidentTax
    {

        // 都道府県税（2023年まで500円増し）
        const capitation_pref: number = Data.RT_RATE_LIST_PREF[pref_code][0];

        // 市町村税（2023年まで500円増し）
        let capitation_city: number = 3500;

        // 特定の市は市町村税が異なる
        if (pref_code == 13 && city_code == 1) { // 神奈川県横浜市
            capitation_city = Data.RT_RATE_LIST_CITY['神奈川県横浜市'][0];
        } else if (pref_code == 22 && city_code == 1) { // 愛知県名古屋市
            capitation_city = Data.RT_RATE_LIST_CITY['愛知県名古屋市'][0];
        }

        const capitation: DataSetForResidentTax = {
            pref: capitation_pref,
            city: capitation_city,
            total: capitation_pref + capitation_city
        };

        return capitation;
    }

    /* --------------------------------------------------
     * 住民税（所得割）
     * --------------------------------------------------*/
    // 課税有無の判定
    private isTaxable (taxable_standard_income: number = 0, dependents_count: number = 0): boolean
    {
        // 所得割の課税基準額（初期値は扶養者が0人の場合の額）
        let tax_criteria: number = 350000;

        // 扶養者がいると人数に応じて基準額が増額
        if (dependents_count > 0) {
            tax_criteria += dependents_count * 350000 + 320000;
        }

        return (taxable_standard_income > tax_criteria);
    }

    // 所得割の税率
    private calcResidentTaxRate (pref_code: number = 0, city_code: number = 0): DataSetForResidentTax
    {
        // 都道府県税（デフォルト値）
        let rate_pref: number = Data.RT_RATE_LIST_PREF[pref_code][1];

        // 市町村税（デフォルト値）
        let rate_city: number = Data.RT_RATE_LIST_CITY['一般市町村'][1];

        // 普通の市町村でない場合の調整
        if (city_code > 0) {
            if(pref_code == 22) { // 愛知県名古屋市
                rate_pref -= 0.02;
                rate_city = Data.RT_RATE_LIST_CITY['愛知県名古屋市'][1];
                rate_city += 0.02;
            } else if (pref_code == 27 && city_code == 2) { // 兵庫県豊岡市
                rate_city = Data.RT_RATE_LIST_CITY['兵庫県豊岡市'][1];
            } else { // ただの政令指定都市たち
                rate_pref -= 0.02;
                rate_city += 0.02;
            }
        }

        const rate: DataSetForResidentTax = {
            pref: rate_pref,
            city: rate_city,
            total: rate_pref + rate_city
        };

        return rate;
    }

    /* --------------------------------------------------
     * 住民税の調整控除を計算
     * --------------------------------------------------*/
    private calcAdjustDeduction (income: number = 0, tax_rate: DataSetForResidentTax): DataSetForResidentTax
    {
        // 調整控除額（合計）
        let deduction_total: number;

        // 人的控除差の合計額
        const diff_personal_deduction: number = 50000; // 基礎控除の人的控除差のみを比較

        if (income <= 2000000) { // 住民税の合計課税所得金額が200万円を超える場合
            // 人的控除差の合計と住民税の合計課税所得金額のいずれか小さい額×5％（市民税と県民税の％合計）を控除
            deduction_total = Math.min(income, diff_personal_deduction) * 0.05;
        } else { // 住民税の合計課税所得金額が200万円以下の場合
            //｛人的控除差の合計－（住民税の合計課税所得金額－200万円）｝×5％（市民税と県民税の％合計）を控除
            deduction_total = (diff_personal_deduction - (income - 2000000)) * 0.05;
            // 2500円未満の場合は2500円とする（元々は0.05を掛ける前の金額を最低5万にする）
            deduction_total = Math.max(deduction_total, 2500);
        }

        // 調整控除額（都道府県と市区町村）
        const deduction_pref: number = deduction_total * tax_rate.pref / tax_rate.total;
        const deduction_city: number = deduction_total * tax_rate.city / tax_rate.total;

        const deduction: DataSetForResidentTax = {
            pref: deduction_pref,
            city: deduction_city,
            total: deduction_pref + deduction_city
        };

        return deduction;
    }

    /* --------------------------------------------------
     * 住民税の調整控除を実行
     * --------------------------------------------------*/
    private calcIncomeTax (taxable_income: number, income_tax_rate: DataSetForResidentTax, deduction: DataSetForResidentTax): DataSetForResidentTax
    {
        const tax_pref: number = Math.max(round(taxable_income * income_tax_rate.pref - deduction.pref, 100, 'floor'), 0);
        const tax_city: number = Math.max(round(taxable_income * income_tax_rate.city - deduction.city, 100, 'floor'), 0);

        // 調整控除済の最終的な所得割額
        const tax: DataSetForResidentTax = {
            pref: tax_pref,
            city: tax_city,
            total: tax_pref + tax_city
        };

        return tax;
    }
}
