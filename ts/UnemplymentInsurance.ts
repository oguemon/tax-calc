'use strict'

/* --------------------------------------------------
 * 雇用保険料
 * --------------------------------------------------*/

import * as Data from './Data';
import { round } from './Util';
import { InsurancePremium } from './InsurancePremium';

// union型を使う場合
const IndustryType = {
    '一般の事業': 0,
    '農林水産・清酒製造の事業': 1,
    '建設の事業': 2
} as const;
export type IndustryType = typeof IndustryType[keyof typeof IndustryType];

export class UnemplymentInsurance extends InsurancePremium
{
    constructor (
        industry_type: IndustryType = 0,
        income: number = 0
    )
    {
        // 親クラスのコンストラクタ（形式上のものなので処理なし）
        super();

        let premium_you: number;
        let premium_company: number;

        // 事業のタイプにより税率が異なる
        switch (industry_type) {
            // 一般の事業
            case IndustryType['一般の事業']:
                premium_you     = round(income * Data.UI_RATE_LIST[0].you, 1, 'roundhd');
                premium_company = round(income * Data.UI_RATE_LIST[0].company);
                break;
            // 農林水産・清酒製造の事業
            case IndustryType['農林水産・清酒製造の事業']:
                premium_you     = round(income * Data.UI_RATE_LIST[1].you, 1, 'roundhd');
                premium_company = round(income * Data.UI_RATE_LIST[1].company);
                break;
            // 建設の事業
            case IndustryType['建設の事業']:
                premium_you     = round(income * Data.UI_RATE_LIST[2].you, 1, 'roundhd');
                premium_company = round(income * Data.UI_RATE_LIST[2].company);
                break;
        }

        this.premium = {
            you:     premium_you,
            company: premium_company,
            total:   premium_you + premium_company,
        }
    }
}
