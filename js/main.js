// DOMを読み終えたら
$(function () {
  'use strict';

	// 画像を含めて読み込みが完了したら
	$(window).on('load', function () {
  });

  // スクロールしたら
  $(window).on('scroll', function () {
  });

  $('a[href^="#"]').on('click', function () {
    var speed = 400; // ミリ秒
    var href = $(this).attr("href");
    var target = $(href == "#" || href == "" ? 'html' : href);
    var position = target.offset().top - 10; //ゆとりを持たせる
    $('body,html').animate({ scrollTop: position }, speed, 'swing');
  });

  // 都道府県選択の選択肢を用意
  for (var i = 0; i < pref_list.length; i++) {
    var selected = (pref_list[i] == '神奈川県')? 'selected' : '';
    $('#select-residence-pref').append('<option value="' + i + '" ' + selected + '>' + pref_list[i] + '</option>');
  }

  // 計算ボタンをクリックしたら
  $('#btn-calc-tax').on('click', function () {
    // 入力された情報を取得
    var income = Number($('#input-income').val());
    var bonus_mounths = Number($('#input-bonus-mounths').val());
    var bonus_number = Number($('#input-bonus-number').val());
    var overwork_hours = Number($('#input-overwork-hours').val());
    var residence_pref = Number($('#select-residence-pref').val());

    //給料の元になる支給額の計算
    var bonus_income_total = Math.floor(income * bonus_mounths);
    var bonus_income_once = Math.floor(bonus_income_total / bonus_number);
    var overwork_monthly_income = Math.floor(overwork_hours * 1.25 * income / (20 * 8));
    var annual_income = Math.floor((income + overwork_monthly_income) * 12) + bonus_income_total;

    // 結果を出力（給料）
    $('#val-bonus-income').text(addThousandSeparator(bonus_income_total));
    $('#val-bonus-income-half').text(addThousandSeparator(bonus_income_once));
    $('#val-overwork-monthly-income').text(addThousandSeparator(overwork_monthly_income));
    $('#val-annual-income').text(addThousandSeparator(annual_income));

    // 健康保険料
    var health_insurance_premium = calcHealthInsurancePremium(income, residence_pref); // 暫定的に残業代を抜く
    var health_insurance_premium_half = roundRev(health_insurance_premium / 2); // 天引き額は.5「以下」を切捨
    var health_insurance_premium_half_bonus = roundRev(calcHealthInsurancePremiumBonus(bonus_income_total, residence_pref) / 2);
    var health_insurance_premium_half_bonus_once = roundRev(calcHealthInsurancePremiumBonus(bonus_income_once, residence_pref) / 2);
    // 厚生年金保険料
    var employee_pension_premium = calcEmployeePensionPremium(income);
    var employee_pension_premium_half = roundRev(employee_pension_premium / 2); // 天引き額は.5「以下」を切捨
    var employee_pension_premium_half_bonus = roundRev(calcEmployeePensionPremiumBonus(bonus_income_total) / 2);
    var employee_pension_premium_half_bonus_once = roundRev(calcEmployeePensionPremiumBonus(bonus_income_once) / 2);
    // 雇用保険料
    var unemployment_insurance_premium = calcUnemplymentInsurancePremium(income, 0);
    var unemployment_insurance_premium_bonus_once = calcUnemplymentInsurancePremium(bonus_income_once, 0);
    var unemployment_insurance_premium_bonus = unemployment_insurance_premium_bonus_once.you * bonus_number;
    // 社会保険料の天引き月額
    var monthly_pension_you = health_insurance_premium_half
                          + employee_pension_premium_half
                          + unemployment_insurance_premium.you;
    // 社会保険料の天引き年額
    var total_pension_you = monthly_pension_you * 12
                          + health_insurance_premium_half_bonus
                          + employee_pension_premium_half_bonus
                          + unemployment_insurance_premium_bonus;

    // 結果を出力（社会保険料）
    $('#val-health-insurance-premium-half').text(addThousandSeparator(health_insurance_premium_half));
    $('#val-health-insurance-premium-half-bonus').text(addThousandSeparator(health_insurance_premium_half_bonus));
    $('#val-health-insurance-premium-half-bonus-once').text(addThousandSeparator(health_insurance_premium_half_bonus_once));

    $('#val-employee-pension-premium-half').text(addThousandSeparator(employee_pension_premium_half));
    $('#val-employee-pension-premium-half-bonus').text(addThousandSeparator(employee_pension_premium_half_bonus));
    $('#val-employee-pension-premium-half-bonus-once').text(addThousandSeparator(employee_pension_premium_half_bonus_once));

    $('#val-unemployment-insurance-premium-you').text(addThousandSeparator(unemployment_insurance_premium.you));
    $('#val-unemployment-insurance-premium-you-bonus').text(addThousandSeparator(unemployment_insurance_premium_bonus));
    $('#val-unemployment-insurance-premium-you-bonus-once').text(addThousandSeparator(unemployment_insurance_premium_bonus_once.you));

    // 所得税
    var taxable_standard_income = Math.max(annual_income - calcTaxableIncomeDeductions(annual_income), 0);
    var total_deduction = 380000 // 基礎控除
                        + total_pension_you;

    var taxable_income = Math.floor(Math.max(taxable_standard_income - total_deduction, 0) / 1000) * 1000;　// 課税所得は千円未満の端数切捨
    var income_tax = calcTaxValue(taxable_income);
    // 住民税
    var prefectural_tax = calcPrefecturalTax(income_tax, 0)
    var municipal_tax = calcMunicipalTax(income_tax, 0);
    var residents_tax = prefectural_tax + municipal_tax;

    // 源泉徴収額（月収：甲種）
    var taxable_income_withholding = income
                                    - monthly_pension_you
                                    - calcTaxableIncomeDeductionsWithholding(income - monthly_pension_you)
                                    - calcBasicDeductionsWithholding()
                                    - calcSpouseDeductionsWithholding (false)
                                    - calcDependentsDeductionsWithholding(0);
                                    console.log(taxable_income_withholding);
    var income_tax_withholding = calcTaxValueWithholding(taxable_income_withholding);
    // 源泉徴収額（ボーナス）
    var income_tax_rate_bonus_withholding = calcTaxRate(income, true, 0);
    var income_tax_bonus_withholding = Math.floor(bonus_income_once * income_tax_rate_bonus_withholding / 100); // 1円未満の端数は切り捨て

    // 実質の年収
    var substantial_annual_income = annual_income
                                  - total_pension_you
                                  - income_tax;
                                  // - residents_tax;は2年目以降

    // 実質毎月振り込まれる月給
    var substantial_income = income
                            - income_tax_withholding
                            - health_insurance_premium_half
                            - employee_pension_premium_half
                            - unemployment_insurance_premium.you;

    // 結果を出力（税金）
    $('#val-taxiable-standard').text(addThousandSeparator(taxable_standard_income));
    $('#val-taxiable-income').text(addThousandSeparator(taxable_income));
    $('#val-income-tax').text(addThousandSeparator(income_tax));

    $('#val-total-deduction').text(addThousandSeparator(total_deduction));

    $('#val-prefectural-tax').text(addThousandSeparator(prefectural_tax));
    $('#val-municipal-tax').text(addThousandSeparator(municipal_tax));
    $('#val-residents-tax').text(addThousandSeparator(residents_tax));

    $('#val-substantial-income').text(addThousandSeparator(substantial_income));
    $('#val-substantial-annual-income').text(addThousandSeparator(substantial_annual_income));

    $('#val-income-tax-withholding').text(addThousandSeparator(income_tax_withholding));
    $('#val-income-tax-bonus-withholding').text(addThousandSeparator(income_tax_bonus_withholding));
  });

  /* --------------------------------------------------
   * 整形
   * --------------------------------------------------*/
  // 数値にカンマを追加
  function addThousandSeparator (value = 0)
  {
    // 3桁おきにカンマを置く
    return String(value).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  }

  // 四捨五入の五も捨てる版
  function roundRev (value = 0)
  {
    var floor = Math.floor(value);
    return (value - floor > 0.5)? Math.ceil(value) : floor;
  }

  /* --------------------------------------------------
   * 所得税（給与所得）
   * --------------------------------------------------*/
  // 給与所得控除額を計算
  function calcTaxableIncomeDeductions (income = 0)
  {
    if (income <= 1800000) {
      // 最低でも65万は控除される
      return Math.max(income * 0.4, 650000);
    }
    if (income <= 3600000) {
      return income * 0.3 + 180000;
    }
    if (income <= 6600000) {
      return income * 0.2 + 540000;
    }
    if (income <= 10000000) {
      //return income * 0.1 + 1200000;
      return income * 0.9 - 1200000; // 速算表に基づく。実際はこれ使う
    }
    if (income > 10000000) {
      return 2200000;
    }
  }

  // 課税所得金額から税額を計算（100円単位は切り捨て）
  function calcTaxValue (taxable_income = 0)
  {
    // 端数処理前の税額を格納
    var tax_pre_round = 0;

    if (taxable_income <= 195 * 10000) {
      tax_pre_round = taxable_income * 0.05;
    } else if (taxable_income <= 330 * 10000) {
      tax_pre_round = taxable_income * 0.1 - 97500;
    } else if (taxable_income <= 695 * 10000) {
      tax_pre_round = taxable_income * 0.2 - 427500;
    } else if (taxable_income <= 900 * 10000) {
      tax_pre_round = taxable_income * 0.23 - 636000;
    } else if (taxable_income <= 1800 * 10000) {
      tax_pre_round = taxable_income * 0.33 - 1536000;
    } else if (taxable_income <= 4000 * 10000) {
      tax_pre_round = taxable_income * 0.4 - 2796000;
    } else if (taxable_income > 4000 * 10000) {
      tax_pre_round = taxable_income * 0.45 - 4796000;
    }

    // 100円以下の金額を切り捨て
    var tax = Math.floor(tax_pre_round / 100) * 100;

    return tax;
  }

  /* --------------------------------------------------
   * 源泉徴収（甲欄）
   * --------------------------------------------------*/
  // 源泉徴収における給与所得控除額を求める
  function calcTaxableIncomeDeductionsWithholding (income = 0) {
    // 端数処理前の給与控除額を格納
    var taxable_income_deductions_pre_round = 0;

    // 給与控除額の計算
    if (income <= 135416) {
      taxable_income_deductions_pre_round = 54167;
    } else if (income <= 149999) {
      taxable_income_deductions_pre_round = income * 0.4;
    } else if (income <= 299999) {
      taxable_income_deductions_pre_round = income * 0.3 + 15000;
    } else if (income <= 549999) {
      taxable_income_deductions_pre_round = income * 0.2 + 45000;
    } else if (income <= 833333) {
      taxable_income_deductions_pre_round = income * 0.1 + 100000;
    } else { // 833334円以上
      taxable_income_deductions_pre_round = 183334;
    }

    // 1円未満の端数を切り上げる
    var taxable_income_deductions = Math.ceil(taxable_income_deductions_pre_round);

    return taxable_income_deductions;
  }

  // 源泉徴収における基本控除額を求める
  function calcBasicDeductionsWithholding () {
    return 31667;
  }

  // 源泉徴収における配偶者(特別)控除額を求める
  function calcSpouseDeductionsWithholding (exist_partner = false) {
    return (exist_partner)? 31667 : 0;
  }

  // 源泉徴収における扶養控除額を求める
  function calcDependentsDeductionsWithholding (dependents_count = 0) {
    // 基礎控除に加えて扶養人数に応じた
    return 31667 * dependents_count;
  }

  // 源泉徴収額を求める
  function calcTaxValueWithholding (taxable_income = 0) {
    // 端数処理前の税額を格納
    var tax_pre_round = 0;

    if (taxable_income <= 162500) {
      tax_pre_round = taxable_income * 0.05105;
    } else if (taxable_income <= 27500) {
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
    var tax = Math.round(tax_pre_round / 10) * 10;

    return tax;
  }

  /* --------------------------------------------------
   * 源泉徴収（ボーナス）
   * --------------------------------------------------*/
  function calcTaxRate (income = 0, kou = true, dependents_count = 0) {
    var arr = csvToArray('./csv/withholding-bonus-2018.csv');
    var tax_rate = 0;

    if (kou) { // 甲欄のとき
      // 税額表の各行を走査
      for (var i = 0; i < arr.length; i++) {
        // 税額表の最下行以外のポジションで見つけた
        if (income <  Number(arr[i][Math.min(dependents_count, 7) + 1]) * 1000 && i > 0) {
          tax_rate = Number(arr[i - 1][0]);
          break;
        }
        // 税額表の最下行まできたのに上の条件にヒットしなかった
        if (i == arr.length) {
          tax_rate = Number(arr[i][0]);
          break;
        }
      }
    } else { // 乙欄のとき
      // 未実装
    }

    return tax_rate;
  }

  /* --------------------------------------------------
   * 住民税（個人）
   * --------------------------------------------------*/
  // 道府県民税
  function calcPrefecturalTax (income_tax = 0, pref_code = 0) {
    // 均等割(2023年まで500円増し)
    var capitation = 1500;
    // 所得割
    var income_part = income_tax * 0.04;

    return capitation + income_part;
  }

  // 市町村民税
  function calcMunicipalTax (income_tax = 0, city_code = 0) {
    // 均等割(2023年まで500円増し)
    var capitation = 3500;
    // 所得割
    var income_part = income_tax * 0.06;

    return capitation + income_part;
  }

  /* --------------------------------------------------
   * 社会保険料
   * --------------------------------------------------*/
  // 月収に対する健康保険料を求める
  function calcHealthInsurancePremium (income = 0, residence_pref = 0, over_40_age = false) {
    var rank = getInsuranceRank(income);

    // 健康保険料の割合を求める
    var health_insurance_rate = insurance_rate_list[residence_pref];
    if (over_40_age) {
      // 介護保険料の割合（全国一律）を加える
      health_insurance_rate += 1.57;
    }

    // 健康保険料を求める
    var health_insurance_premium = rank.monthly_price * health_insurance_rate / 100;

    // 返す
    return health_insurance_premium;
  }

  // ボーナスに対する健康保険料を求める
  function calcHealthInsurancePremiumBonus (bonus = 0, residence_pref = 0, over_40_age = false) {
    // 健康保険料の割合を求める
    var health_insurance_rate = insurance_rate_list[residence_pref];
    if (over_40_age) {
      // 介護保険料の割合（全国一律）を加える
      health_insurance_rate += 1.57;
    }

    // 標準賞与額の上限は、健康保険は年間573万円（毎年4月1日から翌年3月31日までの累計額）

    // 計算対象のボーナス額を求める（千円未満の端数切捨）
    var target_bonus = Math.floor(bonus / 1000) * 1000;

    // 健康保険料を求める
    var health_insurance_premium_bonus = target_bonus * health_insurance_rate / 100;

    // 返す
    return health_insurance_premium_bonus;
  }

  // 月収に対する厚生年金保険料を求める
  function calcEmployeePensionPremium (income = 0) {
    var rank = getInsuranceRank(income);

    // 厚生年金保険料を求める
    var employee_premium = rank.monthly_price * 18.3 / 100; // 一律18.3%

    // 返す
    return employee_premium;
  }

  // 賞与に対する厚生年金保険料を求める
  function calcEmployeePensionPremiumBonus (bonus = 0) {
    // 計算対象のボーナス額を求める（賞与標準は千円未満の端数切捨で月額150万円が上限）
    var bonus_standard = Math.min(Math.floor(bonus / 1000) * 1000, 1500000);

    // 厚生年金保険料を求める
    var employee_premium = bonus_standard * 18.3 / 100; // 一律18.3%

    // 返す
    return employee_premium;
  }

  // 雇用保険料を求める
  function calcUnemplymentInsurancePremium(income = 0, business_type = 0) {
    // 保険料を格納する
    var premium = {
                  you: 0,
                  company: 0,
                  total: 0
                };

    // 事業のタイプにより税率が異なる
    if (business_type == 0) { // 一般の事業
      premium.you     = roundRev(income * 3 / 1000);
      premium.company = Math.round(income * 6 / 1000);
    } else if (business_type == 1) { // 農林水産・清酒製造の事業
      premium.you     = roundRev(income * 4 / 1000);
      premium.company = Math.round(income * 7 / 1000);
    } else if (business_type == 2) { // 建設の事業
      premium.you     = roundRev(income * 4 / 1000);
      premium.company = Math.round(income * 8 / 1000);
    }
    // トータルの保険料を格納
    premium.total   = premium.you + premium.company

    // 保険料をまとめたDictionaryを返す
    return premium;
  }

  // 墓場
  if (0) {
    $s.toggleClass('open');
    $s.hasClass('open');
    $b.css('transform', 'rotate(180deg)');
    setTimeout(function () {
      $s.css('display', 'none');
    }, 300);

    if ($(this).scrollTop() > 500) {
      //ひょっこり表示する
      anime({
        targets: '#popup-box',
        translateY: -200,
        duration: 800
      });
    }

    // 表示を許すページ
    var white_list = Array(
      'elimination',
      'simultaneous-regular',
    );
    // 正規表現作り
    var re_str = '';
    for (var i = 0; i < white_list.length; i++) {
      re_str += white_list[i] + '|';
    }
    re_str = re_str.slice(0, -1);
    var re = new RegExp(re_str);
    // 文字列を検索
    return re.test(location.pathname);
  }

  // 社会保険料の等級を求める
  function getInsuranceRank (income = 0) {
    // 等級などを格納する配列（順に健康保険等級・厚生年金等級・月額）
    var rank = new Array();

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
    var rank_dict = {
      health_insurance: rank[0],
      employee_pension: rank[1],
      monthly_price: rank[2]
    }

    // 返す
    return rank_dict;
  }

  // CSVファイル読み込み
  function csvToArray(path) {
    var csvData = new Array();
    var data = new XMLHttpRequest();
    data.open("GET", path, false);
    data.send(null);
    var LF = String.fromCharCode(10);
    var lines = data.responseText.split(LF);
    for (var i = 0; i < lines.length;++i) {
      var cells = lines[i].split(",");
      if(cells.length > 1) {
        csvData.push(cells);
      }
    }
    return csvData;
  }
});
