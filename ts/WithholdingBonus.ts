/* --------------------------------------------------
 * 源泉徴収（ボーナス）
 * --------------------------------------------------*/

import { csvToArray } from './Util';

export class WithholdingBonus
{
  // 賞与の金額に乗ずべき率
  public tax_rate: number;
  // 源泉徴収額
  public tax_value: number;

  constructor (
    bonus_without_premium: number,
    last_salary_without_premium: number,
    is_kou: boolean = true,
    dependents_count: number = 0
  )
  {
    // 賞与の金額に乗ずべき率
    if (is_kou) {
      // 甲
      this.tax_rate = this.calcTaxRateKou (last_salary_without_premium, dependents_count);
    } else {
      // 乙
      this.tax_rate = this.calcTaxRateOtsu (last_salary_without_premium);
    }

    // 源泉徴収額
    this.tax_value = Math.floor(this.tax_rate * bonus_without_premium / 100); // 1円未満の端数は切り捨て
  }

  // 賞与に対する源泉徴収税額の導出にあたっての賞与の金額に乗ずべき率を求める（甲）
  // 賞与に対する源泉徴収税額の算出率の表（令和2年分）
  // https://www.nta.go.jp/publication/pamph/gensen/zeigakuhyo2019/data/15-16.xls
  public calcTaxRateKou (last_salary_without_premium: number = 0, dependents_count: number) : number
  {
    let tax_rate: number = 0;

    const arr: string[][] = csvToArray('./csv/withholding-bonus-2020.csv');

    // 税額表の各行を走査
    for (let i = 0; i < arr.length; i++) {
      // 税額表の最下行以外のポジションで見つけた
      if (last_salary_without_premium < Number(arr[i][Math.min(dependents_count, 7) + 1]) * 1000) {
        tax_rate = Number(arr[i][0]);
        break;
      }
      // 税額表の最下行まできたのに上の条件にヒットしなかった
      if (i == arr.length - 1) {
        tax_rate = Number(arr[arr.length - 1][0]);
        break;
      }
    }

    return tax_rate;
  }

  // 賞与に対する源泉徴収税額の導出にあたっての賞与の金額に乗ずべき率を求める（乙）
  // 賞与に対する源泉徴収税額の算出率の表（令和2年分）
  // https://www.nta.go.jp/publication/pamph/gensen/zeigakuhyo2019/data/15-16.xls
  public calcTaxRateOtsu (last_salary_without_premium: number = 0) : number
  {
    let tax_rate: number = 0;

    if (last_salary_without_premium < 222 * 1000) {
      tax_rate = 10.210;
    } else if (last_salary_without_premium < 293 * 1000) {
      tax_rate = 20.420;
    } else if (last_salary_without_premium < 524 * 1000) {
      tax_rate = 30.630;
    } else if (last_salary_without_premium < 1118 * 1000) {
      tax_rate = 38.798;
    } else { // 1118千円以上
      tax_rate = 45.945;
    }

    return tax_rate;
  }
}
