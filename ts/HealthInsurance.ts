/* --------------------------------------------------
 * 健康保険料
 * --------------------------------------------------*/

import * as Data from './Data';
import { round } from './Util';
import { InsurancePremium } from './InsurancePremium';

export class HealthInsurance extends InsurancePremium
{
    constructor (
        company_pref: number = 0,
        basic_income: number = 0,
        get_income: number = 0,
        bonus_number: number = 0,
        over_40_age: boolean = false
    )
    {
        // 親クラスのコンストラクタ（形式上のものなので処理なし）
        super();

        // 税率を掛ける収入額
        let target_income: number = 0;

        // 健康保険料率を求める
        let hi_rate: number = Data.HI_GENERAL_RATE_LIST[company_pref][0];

        // 介護保険料が必要かチェック
        if (over_40_age) {
            hi_rate += Data.LI_RATE;
        }

        // 健康保険の加入条件を満たすかチェック
        if (basic_income < Data.INSURANCE_MIN_INCOME) {
            // 一定金額以下の基本給なら以降の計算をしない
            return;
        }

        // 月給かボーナスかチェック
        if (bonus_number == 0) // ボーナスでない
        {
            // 等級情報を取得
            const rank = this.getInsuranceRank(get_income);

            // 等級情報に基づく月額決定
            target_income = rank.monthly_price;
        }
        else if (bonus_number > 0) // ボーナスである
        {
            // 標準賞与額の上限は、健康保険は年間573万円（毎年4月1日から翌年3月31日までの累計額）
            const standard: number = Math.min(get_income, 5730000);

            // 計算対象のボーナス額（1回あたりの対象額）を求める（千円未満の端数切捨）
            target_income = round(standard / bonus_number, 1000, 'floor');
        }

        // 健康保険料を求める
        const premium_basic: number = target_income * hi_rate / 100;

        this.premium = {
            you:     round(premium_basic / 2, 1, 'roundhd'),
            company: round(premium_basic / 2),
            total:   round(premium_basic),
        };
    }
}
