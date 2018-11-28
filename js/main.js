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
    $('#val-bonus-income').text(bonus_income);
    $('#val-bonus-income-half').text(Math.floor(bonus_income / 2));
    $('#val-overwork-monthly-income').text(overwork_monthly_income);
    $('#val-annual-income').text(annual_income);

    // 色々計算
    var taxable_income = Math.max(annual_income - calcTaxableIncomeDeductions(income), 0);
    var income_tax = calcTaxValue(taxable_income - 380000);　// 暫定的に基本控除を入れる
    var prefectural_tax = calcPrefecturalTax(income_tax, 0)
    var municipal_tax = calcMunicipalTax(income_tax, 0);
    var residents_tax = prefectural_tax + municipal_tax;
    var substantial_annual_income = annual_income - income_tax; // - residents_tax;は2年目以降


    // 結果を出力（税金）
    $('#val-taxiable-standard').text(taxable_income);
    $('#val-income-tax').text(income_tax);
    $('#val-prefectural-tax').text(prefectural_tax);
    $('#val-municipal-tax').text(municipal_tax);
    $('#val-residents-tax').text(residents_tax);
    $('#val-substantial-annual-income').text(substantial_annual_income);
  });

  // 表示を許すページであるかどうかをチェック
  function checkWhiteList() {
    // 表示を許すページ
    var white_list = Array(
      'elimination',
      'simultaneous-regular',
      'cramers-rule',
      'solution',
      'cofactor-expansion',
      'det-feature',
      'hello-world',
      'inverse-matrix',
      'inner-and-cross-product'
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
    // 切り捨て処理前の税額
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
  }
});
