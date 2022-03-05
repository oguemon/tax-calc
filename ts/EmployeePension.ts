'use strict'

/* --------------------------------------------------
 * 厚生年金保険料
 * --------------------------------------------------*/

import * as Data from './Data';
import { round } from './Util';
import { InsurancePremium } from './InsurancePremium';

export class EmployeePension extends InsurancePremium
{
    constructor (
        basic_income: number = 0,
        get_income: number = 0,
        bonus_number: number = 0,
    )
    {
        // 親クラスのコンストラクタ（形式上のものなので処理なし）
        super();

        // 厚生年金の加入条件を満たすかチェック
        if (basic_income < Data.INSURANCE_MIN_INCOME) {
            // 一定金額以下の基本給なら以降の計算をしない
            return;
        }

        // 税率を掛ける収入額
        let target_income: number = 0;

        // 月給かボーナスかチェック
        if (bonus_number == 0) // ボーナスでない
        {
            // 等級情報を取得
            const rank = this.getInsuranceRank(get_income, false);

            // 等級情報に基づく月額決定
            target_income = rank.monthly_income;
        }
        else if (bonus_number > 0) // ボーナスである
        {
            // 賞与標準は千円未満の端数切捨で月額150万円が上限
            const standard: number = Math.min(get_income / bonus_number, 1500000);

            // 計算対象のボーナス額を求める
            target_income = round(standard, 1000, 'floor')
        }

        // 厚生年金保険料を求める
        const premium_basic: number = target_income * Data.EP_RATE / 100;

        this.premium = {
            you:     round(premium_basic / 2, 1, 'roundhd'),
            company: round(premium_basic / 2),
            total:   round(premium_basic),
        };
    }
}
