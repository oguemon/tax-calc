/* --------------------------------------------------
 * 源泉徴収（月々の給料）
 * --------------------------------------------------*/

import { round } from './Util';

export class WithholdingSalary
{
  // 給与控除額
  public deductions_pre_round: number;
  // 基本控除額
  public basic_deductions: number;
  // 配偶者(特別)控除額
  public spouse_deductions: number;
  // 扶養控除額
  public dependents_deductions: number;
  // 課税給与所得金額
  public taxable_income: number;
  // 源泉徴収額
  public tax_value: number;

  constructor (
    income_without_premium: number,
    exist_partner: boolean,
    dependents_count: number
  )
  {
    // 給与控除額
    this.deductions_pre_round = this.calcTaxableIncomeDeductions (income_without_premium);

    // 基本控除額
    this.basic_deductions = this.calcBasicDeductions(income_without_premium);

    // 配偶者(特別)控除額
    this.spouse_deductions = this.calcSpouseDeductions(exist_partner);

    // 扶養控除額
    this.dependents_deductions = this.calcDependentsDeductions(dependents_count);

    // 課税給与所得金額
    this.taxable_income = income_without_premium
                        - this.basic_deductions
                        - this.spouse_deductions
                        - this.dependents_deductions;
    this.taxable_income = Math.max(this.taxable_income, 0); // マイナス防止

    // 源泉徴収額
    this.tax_value = this.calcTaxValue(this.taxable_income);
  }

  // 源泉徴収における給与所得控除額を求める
  // 電子計算機等を使用して源泉徴収税額を計算する方法（令和2年分）別表第一
  // https://www.nta.go.jp/publication/pamph/gensen/zeigakuhyo2019/data/18.pdf
  private calcTaxableIncomeDeductions (income = 0) : number
  {
    // 端数処理前の給与控除額を格納
    let taxable_income_deductions_pre_round: number = 0;

    // 給与控除額の計算
    if (income <= 135416) {
      taxable_income_deductions_pre_round = 45834;
    } else if (income <= 149999) {
      taxable_income_deductions_pre_round = income * 0.4 - 8333;
    } else if (income <= 299999) {
      taxable_income_deductions_pre_round = income * 0.3 + 6667;
    } else if (income <= 549999) {
      taxable_income_deductions_pre_round = income * 0.2 + 36667;
    } else if (income <= 708330) {
      taxable_income_deductions_pre_round = income * 0.1 + 91667;
    } else { // 708331円以上
      taxable_income_deductions_pre_round = 162500;
    }

    // 1円未満の端数を切り上げる
    const taxable_income_deductions: number = Math.ceil(taxable_income_deductions_pre_round);

    return taxable_income_deductions;
  }

  // 源泉徴収における基本控除額を求める
  // 電子計算機等を使用して源泉徴収税額を計算する方法（令和2年分）別表第三
  // https://www.nta.go.jp/publication/pamph/gensen/zeigakuhyo2019/data/18.pdf
  private calcBasicDeductions (income = 0) : number
  {
    // 端数処理前の給与控除額を格納
    let taxable_income_basic_deductions: number = 0;

    if (income <= 2162499) {
      taxable_income_basic_deductions = 40000;
    } else if (income <= 2204166) {
      taxable_income_basic_deductions = 26667;
    } else if (income <= 2245833) {
      taxable_income_basic_deductions = 13334;
    } else { // 2245834円以上
      taxable_income_basic_deductions = 0;
    }

    return taxable_income_basic_deductions;
  }

  // 源泉徴収における配偶者(特別)控除額を求める
  // 電子計算機等を使用して源泉徴収税額を計算する方法（令和2年分）別表第二
  // https://www.nta.go.jp/publication/pamph/gensen/zeigakuhyo2019/data/18.pdf
  private calcSpouseDeductions (exist_partner = false) : number
  {
    return (exist_partner)? 31667 : 0;
  }

  // 源泉徴収における扶養控除額を求める
  // 電子計算機等を使用して源泉徴収税額を計算する方法（令和2年分）別表第二
  // https://www.nta.go.jp/publication/pamph/gensen/zeigakuhyo2019/data/18.pdf
  private calcDependentsDeductions (dependents_count = 0) : number
  {
    // 基礎控除に加えて扶養人数に応じた
    return 31667 * dependents_count;
  }

  // 源泉徴収額を求める
  // 電子計算機等を使用して源泉徴収税額を計算する方法（令和2年分）別表第四
  // https://www.nta.go.jp/publication/pamph/gensen/zeigakuhyo2019/data/18.pdf
  private calcTaxValue (taxable_income = 0) : number
  {
    // 端数処理前の税額を格納
    let tax_pre_round: number = 0;

    if (taxable_income <= 162500) {
      tax_pre_round = taxable_income * 0.05105;
    } else if (taxable_income <= 275000) {
      tax_pre_round = taxable_income * 0.10210 - 8296;
    } else if (taxable_income <= 579166) {
      tax_pre_round = taxable_income * 0.20420 - 36374;
    } else if (taxable_income <= 750000) {
      tax_pre_round = taxable_income * 0.23483 - 54113;
    } else if (taxable_income <= 1500000) {
      tax_pre_round = taxable_income * 0.33693 - 130688;
    } else if (taxable_income <= 3333333) {
      tax_pre_round = taxable_income * 0.40840 - 237893;
    } else { // 3333334円以上
      tax_pre_round = taxable_income * 0.45945 - 408061;
    }

    // 10円未満の金額を四捨五入
    const tax: number = round(tax_pre_round, 10);

    return tax;
  }
}
