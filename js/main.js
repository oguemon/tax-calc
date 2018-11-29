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

  // 計算ボタンをクリックしたら
  $('#btn-calc-tax').on('click', function () {
    // 入力された情報を取得
    var income = Number($('#input-income').val());
    var bonus_mounths = Number($('#input-bonus-mounths').val());
    var overwork_hours = Number($('#input-overwork-hours').val());

    //給料の元になる支給額の計算
    var bonus_income = Math.floor(income * bonus_mounths);
    var overwork_monthly_income = Math.floor(overwork_hours * 1.25 * income / (20 * 8));
    var annual_income = Math.floor((income + overwork_monthly_income) * 12) + bonus_income;

    // 結果を出力（給料）
    $('#val-bonus-income').text(addThousandSeparator(bonus_income));
    $('#val-bonus-income-half').text(addThousandSeparator(Math.floor(bonus_income / 2)));
    $('#val-overwork-monthly-income').text(addThousandSeparator(overwork_monthly_income));
    $('#val-annual-income').text(addThousandSeparator(annual_income));

    // 所得税
    var taxable_income = Math.max(annual_income - calcTaxableIncomeDeductions(income), 0);
    var income_tax = calcTaxValue(taxable_income - 380000);　// 暫定的に基本控除を入れる
    // 住民税
    var prefectural_tax = calcPrefecturalTax(income_tax, 0)
    var municipal_tax = calcMunicipalTax(income_tax, 0);
    var residents_tax = prefectural_tax + municipal_tax;
    var substantial_annual_income = annual_income - income_tax; // - residents_tax;は2年目以降
    // 源泉徴収額（甲種）
    var taxable_income_withholding = income
                                    - calcTaxableIncomeDeductionsWithholding(income)
                                    - calcBasicDeductionsWithholding()
                                    - calcSpouseDeductionsWithholding (false)
                                    - calcDependentsDeductionsWithholding(0);
    var income_tax_withholding = calcTaxValueWithholding(taxable_income_withholding);

    // 結果を出力（税金）
    $('#val-taxiable-standard').text(addThousandSeparator(taxable_income));
    $('#val-income-tax').text(addThousandSeparator(income_tax));
    $('#val-prefectural-tax').text(addThousandSeparator(prefectural_tax));
    $('#val-municipal-tax').text(addThousandSeparator(municipal_tax));
    $('#val-residents-tax').text(addThousandSeparator(residents_tax));
    $('#val-substantial-annual-income').text(addThousandSeparator(substantial_annual_income));
    $('#val-income-tax-withholding').text(addThousandSeparator(income_tax_withholding));
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

  // 都道府県のJIS的並び
  var pref_list = new Array(
    '北海道', // 1
    '青森県', // 2
    '岩手県', // 3
    '宮城県', // 4
    '秋田県', // 5
    '山形県', // 6
    '福島県', // 7
    '茨城県', // 8
    '栃木県', // 9
    '群馬県', // 10
    '埼玉県', // 11
    '千葉県', // 12
    '東京都', // 13
    '神奈川県', // 14
    '新潟県', // 15
    '富山県', // 16
    '石川県', // 17
    '福井県', // 18
    '山梨県', // 19
    '長野県', // 20
    '岐阜県', // 21
    '静岡県', // 22
    '愛知県', // 23
    '三重県', // 24
    '滋賀県', // 25
    '京都府', // 26
    '大阪府', // 27
    '兵庫県', // 28
    '奈良県', // 29
    '和歌山県', // 30
    '鳥取県', // 31
    '島根県', // 32
    '岡山県', // 33
    '広島県', // 34
    '山口県', // 35
    '徳島県', // 36
    '香川県', // 37
    '愛媛県', // 38
    '高知県', // 39
    '福岡県', // 40
    '佐賀県', // 41
    '長崎県', // 42
    '熊本県', // 43
    '大分県', // 44
    '宮崎県', // 45
    '鹿児島県', // 46
    '沖縄県'  // 47
  );
});
