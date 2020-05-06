/* --------------------------------------------------
 * 社会保険料
 * --------------------------------------------------*/

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
    protected getInsuranceRank (income = 0) {
        // 等級などを格納する配列（順に健康保険等級・厚生年金等級・月額）
        let rank: number[] = new Array();

        // 怒涛の条件文
        if (income < 63000) { rank = [1, 1, 58000]; }
        else if (income < 73000) { rank = [2, 1, 68000]; }
        else if (income < 83000) { rank = [3, 1, 78000]; }
        else if (income < 93000) { rank = [4, 1, 88000]; }
        else if (income < 101000) { rank = [5, 2, 98000]; }
        else if (income < 107000) { rank = [6, 3, 104000]; }
        else if (income < 114000) { rank = [7, 4, 110000]; }
        else if (income < 122000) { rank = [8, 5, 118000]; }
        else if (income < 130000) { rank = [9, 6, 126000]; }
        else if (income < 138000) { rank = [10, 7, 134000]; }
        else if (income < 146000) { rank = [11, 8, 142000]; }
        else if (income < 155000) { rank = [12, 9, 150000]; }
        else if (income < 165000) { rank = [13, 10, 160000]; }
        else if (income < 175000) { rank = [14, 11, 170000]; }
        else if (income < 185000) { rank = [15, 12, 180000]; }
        else if (income < 195000) { rank = [16, 13, 190000]; }
        else if (income < 210000) { rank = [17, 14, 200000]; }
        else if (income < 230000) { rank = [18, 15, 220000]; }
        else if (income < 250000) { rank = [19, 16, 240000]; }
        else if (income < 270000) { rank = [20, 17, 260000]; }
        else if (income < 290000) { rank = [21, 18, 280000]; }
        else if (income < 310000) { rank = [22, 19, 300000]; }
        else if (income < 330000) { rank = [23, 20, 320000]; }
        else if (income < 350000) { rank = [24, 21, 340000]; }
        else if (income < 370000) { rank = [25, 22, 360000]; }
        else if (income < 395000) { rank = [26, 23, 380000]; }
        else if (income < 425000) { rank = [27, 24, 410000]; }
        else if (income < 455000) { rank = [28, 25, 440000]; }
        else if (income < 485000) { rank = [29, 26, 470000]; }
        else if (income < 515000) { rank = [30, 27, 500000]; }
        else if (income < 545000) { rank = [31, 28, 530000]; }
        else if (income < 575000) { rank = [32, 29, 560000]; }
        else if (income < 605000) { rank = [33, 30, 590000]; }
        else if (income < 635000) { rank = [34, 31, 620000]; }
        else if (income < 665000) { rank = [35, 31, 650000]; }
        else if (income < 695000) { rank = [36, 31, 680000]; }
        else if (income < 730000) { rank = [37, 31, 710000]; }
        else if (income < 770000) { rank = [38, 31, 750000]; }
        else if (income < 810000) { rank = [39, 31, 790000]; }
        else if (income < 855000) { rank = [40, 31, 830000]; }
        else if (income < 905000) { rank = [41, 31, 880000]; }
        else if (income < 955000) { rank = [42, 31, 930000]; }
        else if (income < 1005000) { rank = [43, 31, 980000]; }
        else if (income < 1055000) { rank = [44, 31, 1030000]; }
        else if (income < 1115000) { rank = [45, 31, 1090000]; }
        else if (income < 1175000) { rank = [46, 31, 1150000]; }
        else if (income < 1235000) { rank = [47, 31, 1210000]; }
        else if (income < 1295000) { rank = [48, 31, 1270000]; }
        else if (income < 1355000) { rank = [49, 31, 1330000]; }
        else { rank = [50, 30, 1390000]; }

        // 要素番号では分からないのでDictionaryにする
        const rank_dict = {
            health_insurance: rank[0],
            employee_pension: rank[1],
            monthly_price: rank[2]
        }

        // 返す
        return rank_dict;
    }
}
