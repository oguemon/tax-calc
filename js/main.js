// DOMを読み終えたら
$(function () {
  'use strict';

  // グラフのインスタンス
  var chart_detail_income;
  var chart_detail_bonus;
  var chart_detail_annual_income;
  var chart_overwork_transition;

	// 画像を含めて読み込みが完了したら
	$(window).on('load', function () {
  });

  // スクロールしたら
  $(window).on('scroll', function () {
  });

  // 詳細ボタンを押すと
  $('.btn-detail-toggle').on('click', function () {
    $(this).parent().children('.detail-box').slideToggle(300);
  });

  $('a[href^="#"]').on('click', function () {
    var speed = 400; // ミリ秒
    var href = $(this).attr("href");
    var target = $(href == "#" || href == "" ? 'html' : href);
    var position = target.offset().top - 10; //ゆとりを持たせる
    $('body,html').animate({ scrollTop: position }, speed, 'swing');
  });

  // 都道府県選択の選択肢を用意
  for (var i = 0; i < PREF_LIST.length; i++) {
    var selected = (PREF_LIST[i] == '神奈川県')? 'selected' : '';
    $('#select-company-pref').append('<option value="' + i + '" ' + selected + '>' + PREF_LIST[i] + '</option>');
    $('#select-resident-pref').append('<option value="' + i + '" ' + selected + '>' + PREF_LIST[i] + '</option>');
  }
  // 自宅の都道府県を選択していない
  var resident_pref_selected = false;

  // 勤務先の都道府県を選択したら
  $('#select-company-pref').on('change', function () {
    // 初めての選択だったなら
    if (!resident_pref_selected) {
      var company_pref  = Number($('#select-company-pref').val());
      company_pref = (company_pref)? company_pref : 0;

      // 自宅の都道府県もそれに合わせる
      $('#select-resident-pref').val(company_pref);
      toggleSelectResidentCity(company_pref);
    }
  });

  // 自宅の都道府県を選択したら
  $('#select-resident-pref').on('change', function () {
    var resident_pref  = Number($('#select-resident-pref').val());
    resident_pref = (resident_pref)? resident_pref : 0;
    toggleSelectResidentCity(resident_pref);

    // 自宅の都道府県を選択したフラグをオン
    resident_pref_selected = true;
  });

  // 計算ボタンをクリックしたら
  $('#btn-calc-tax').on('click', function () {
    // 結果画面を表示
    $('#result').slideDown(400);

    // 結果画面へスクロール
    var position = $('#result').offset().top - 10; //ゆとりを持たせる
    $('body,html').animate({ scrollTop: position }, 400, 'swing');

    /* --------------------------------------------------
     * 入力
     * --------------------------------------------------*/
    var income         = Number($('#input-income').val());
    var bonus_mounths  = Number($('#input-bonus-mounths').val());
    var bonus_number   = Number($('#input-bonus-number').val());
    var overwork_hours = Number($('#input-overwork-hours').val());
    var company_pref   = Number($('#select-company-pref').val());
    var resident_pref  = Number($('#select-resident-pref').val());
    var resident_city  = Number($('#select-resident-city').val());

    income         = (income)?         Math.abs(income) : 0;
    bonus_mounths  = (bonus_mounths)?  Math.abs(bonus_mounths) : 0;
    bonus_number   = (bonus_number)?   Math.abs(bonus_number) : 0;
    overwork_hours = (overwork_hours)? Math.abs(overwork_hours) : 0;
    company_pref   = (company_pref)?   Math.abs(company_pref) : 0;
    resident_pref  = (resident_pref)?  Math.abs(resident_pref) : 0;
    resident_city  = (resident_city)?  Math.abs(resident_city) : 0;

    var industry_type = 0; // 事業
    if ($('input[name="industry"]:eq(0)').prop('checked')) {
      industry_type = 0;
    } else if ($('input[name="industry"]:eq(1)').prop('checked')) {
      industry_type = 1;
    } else if ($('input[name="industry"]:eq(2)').prop('checked')) {
      industry_type = 2;
    }

    // ボーナスの回数がゼロ（ボーナスがない）なら、ボーナス総額ゼロで支給回数1回ってことにする
    if (bonus_number == 0) {
      bonus_mounths = 0;
      bonus_number = 1;
    }

    /* --------------------------------------------------
     * 額面給料計算
     * --------------------------------------------------*/
    //給料の元になる支給額の計算（ボーナス）
    var bonus_income_total = Math.floor(income * bonus_mounths);
    var bonus_income_once = Math.floor(bonus_income_total / bonus_number);
    //給料の元になる支給額の計算（時間外労働手当）
    var overwork_monthly_income = calcOverworkIncome(overwork_hours, income);
    //給料の元になる支給額の計算（月収と年収）
    var monthly_income = income + overwork_monthly_income;
    var annual_income = monthly_income * 12 + bonus_income_total;

    // 結果を包むid要素を取得
    var r = $('#result');

    // 結果を出力（給料）
    r.find('[basic-income]').text(add1000Separator(income));
    r.find('[bonus-income-once]').text(add1000Separator(bonus_income_once));
    r.find('[overwork-monthly-income]').text(add1000Separator(overwork_monthly_income));
    r.find('[monthly-income]').text(add1000Separator(monthly_income));
    r.find('[annual-income]').text(add1000Separator(annual_income));

    /* --------------------------------------------------
     * 社会保険料計算
     * --------------------------------------------------*/
    // 健康保険料
    var hi       = calcHealthInsurancePremium(company_pref, monthly_income);
    var hi_bonus = calcHealthInsurancePremium(company_pref, bonus_income_total, bonus_number);

    // 厚生年金保険料
    var ep       = calcEmployeePensionPremium(monthly_income);
    var ep_bonus = calcEmployeePensionPremium(bonus_income_total, bonus_number);

    // 雇用保険料
    var ui       = calcUnemplymentInsurancePremium(industry_type, monthly_income);
    var ui_bonus = calcUnemplymentInsurancePremium(industry_type, bonus_income_once);

    // 社会保険料の天引き月額
    var premium_monthly = {
      you:     hi.you + ep.you + ui.you,
      company: hi.company + ep.company + ui.company,
      total:   hi.total + ep.total + ui.total,
    }

    // 社会保険料の天引きボーナス額（1回あたり）
    var premium_bonus = {
      you:     hi_bonus.you + ep_bonus.you + ui_bonus.you,
      company: hi_bonus.company + ep_bonus.company + ui_bonus.company,
      total:   hi_bonus.total + ep_bonus.total + ui_bonus.total,
    }

    // 社会保険料の天引き年額
    var premium_annually = {
      you:     premium_monthly.you * 12 + (hi_bonus.you + ep_bonus.you + ui_bonus.you) * bonus_number,
      company: premium_monthly.company * 12 + (hi_bonus.company + ep_bonus.company + ui_bonus.company) * bonus_number,
      total:   premium_monthly.total * 12 + (hi_bonus.total + ep_bonus.total + ui_bonus.total) * bonus_number,
    }

    // 結果を出力（社会保険料）
    r.find('[hi-half]').text(add1000Separator(hi.you));
    r.find('[hi-half-bonus]').text(add1000Separator(hi_bonus.you * bonus_number));
    r.find('[hi-half-bonus-once]').text(add1000Separator(hi_bonus.you));
    r.find('[hi-annual]').text(add1000Separator(hi.you * 12 + hi_bonus.you * bonus_number));

    r.find('[ep-half]').text(add1000Separator(ep.you));
    r.find('[ep-half-bonus]').text(add1000Separator(ep_bonus.you * bonus_number));
    r.find('[ep-half-bonus-once]').text(add1000Separator(ep_bonus.you));
    r.find('[ep-annual]').text(add1000Separator(ep.you * 12 + ep_bonus.you * bonus_number));

    r.find('[ui-you]').text(add1000Separator(ui.you));
    r.find('[ui-you-bonus]').text(add1000Separator(ui_bonus.you * bonus_number));
    r.find('[ui-you-bonus-once]').text(add1000Separator(ui_bonus.you));
    r.find('[ui-annual]').text(add1000Separator(ui.you * 12 + ui_bonus.you * bonus_number));

    /* --------------------------------------------------
     * 所得税計算
     * --------------------------------------------------*/
    // 給与収入から、給与所得を求める
    var taxable_standard_income = calcTaxableIncome(annual_income);
    // 控除額を求める
    var it_deduction = 380000 // 基礎控除
                     + premium_annually.you; // 社会保険料控除
    // 課税所得金額を求める
    var it_taxable_income = round(Math.max(taxable_standard_income - it_deduction, 0), 1000, 'floor');　// 課税所得は千円未満の端数切捨
    // 所得税額を求める
    var it = calcTaxValue(it_taxable_income);

    // 結果を出力
    r.find('[total-deduction]').text(add1000Separator(total_deduction));
    r.find('[taxiable-standard]').text(add1000Separator(taxable_standard_income));
    r.find('[taxiable-income]').text(add1000Separator(taxable_income));
    r.find('[it]').text(add1000Separator(it));

    /* --------------------------------------------------
     * 住民税計算
     * --------------------------------------------------*/
    // 控除額を求める
    var rt_deduction = 330000 // 基礎控除（所得税と多少異なるのに注意）
                     + premium_annually.you; // 社会保険料控除
    // 均等割
    var pref_capitation = calcPrefCapitation(resident_pref);
    var city_capitation = calcCityCapitation(resident_city);
    //所得割
    var rt_income = calcResidentTaxIncome(resident_pref, resident_city, taxable_standard_income, rt_deduction);
    // 住民税
    var pref_tax = pref_capitation + rt_income.pref;
    var city_tax = city_capitation + rt_income.city;
    // 住民税総額
    var rt = pref_tax + city_tax;
    // 月あたりの住民税額
    var rt_monthly = round(rt / 12, 100, 'floor');
    var rt_monthly_june = rt - 11 * rt_monthly; // 6月分は端数の切捨額を含むため少し多い

    // 結果を出力
    r.find('[pref-tax]').text(add1000Separator(pref_tax));
    r.find('[city-tax]').text(add1000Separator(city_tax));
    r.find('[pref-capitation]').text(add1000Separator(pref_capitation));
    r.find('[pref-income-tax]').text(add1000Separator(rt_income.pref));
    r.find('[city-capitation]').text(add1000Separator(city_capitation));
    r.find('[city-income-tax]').text(add1000Separator(rt_income.city));
    r.find('[rt]').text(add1000Separator(rt));
    r.find('[rt-monthly]').text(add1000Separator(rt_monthly));
    r.find('[rt-monthly-june]').text(add1000Separator(rt_monthly_june));

    /* --------------------------------------------------
     * 源泉徴収額
     * --------------------------------------------------*/
    // 月収：甲種
    var it_taxable_income_withholding = monthly_income
                                      - premium_monthly.you
                                      - calcTaxableIncomeDeductionsWithholding(monthly_income - premium_monthly.you)
                                      - calcBasicDeductionsWithholding()
                                      - calcSpouseDeductionsWithholding (false)
                                      - calcDependentsDeductionsWithholding(0);
    it_taxable_income_withholding = Math.max(it_taxable_income_withholding, 0);

    var it_withholding = calcTaxValueWithholding(it_taxable_income_withholding);

    // ボーナス
    var it_rate_bonus_withholding = calcTaxRate(monthly_income - premium_monthly.you);
    var it_taxiable_bonus_withholding = bonus_income_once
                                      - hi_bonus.you
                                      - ep_bonus.you
                                      - ui_bonus.you;
    it_taxiable_bonus_withholding = Math.max(it_taxiable_bonus_withholding, 0);
    var it_bonus_withholding = Math.floor(it_taxiable_bonus_withholding * it_rate_bonus_withholding / 100); // 1円未満の端数は切り捨て

    // 結果を出力
    r.find('[it-withholding]').text(add1000Separator(it_withholding));
    r.find('[it-bonus-withholding]').text(add1000Separator(it_bonus_withholding));

    /* --------------------------------------------------
     * 手取り給料
     * --------------------------------------------------*/
    // 実質の年収
    var substantial_annual_income = annual_income
                                  - premium_annually.you
                                  - it;
                                  // - residents_tax;は2年目以降

    // 実質のボーナス（1回あたり）
    var substantial_bonus = bonus_income_once
                              - premium_bonus.you
                              - it_bonus_withholding;

    // 実質毎月振り込まれる月給
    var substantial_income = monthly_income
                           - premium_monthly.you
                           - it_withholding;

    // 結果を出力
    r.find('[substantial-income]').text(add1000Separator(substantial_income));
    r.find('[substantial-income-minus-rt]').text(add1000Separator(substantial_income - rt_monthly));
    r.find('[substantial-bonus]').text(add1000Separator(substantial_bonus));
    r.find('[substantial-annual-income]').text(add1000Separator(substantial_annual_income));
    r.find('[substantial-annual-income-minus-rt]').text(add1000Separator(substantial_annual_income - rt));

    /* --------------------------------------------------
     * グラフ描画
     * --------------------------------------------------*/
    // 過去にグラフ描画をしていたらそれを破棄
    if (chart_detail_income) { chart_detail_income.destroy(); }
    if (chart_detail_bonus) { chart_detail_bonus.destroy(); }
    if (chart_detail_annual_income) { chart_detail_annual_income.destroy(); }
    if (chart_overwork_transition) { chart_overwork_transition.destroy(); }

    // グラフ描画に用いる色を割り当て
    var bar_color = {
      income: '#f9808f',
      hi: '#39b54a',
      ep: '#009245',
      ui: '#006837',
      it: '#29abe2',
    }

    // グラフを描画（月収）
    var datasets_income = {
      datasets:[
        {label: '手取り月収', data: [substantial_income], backgroundColor: bar_color.income},
        {label: '健康保険料', data: [hi.you], backgroundColor: bar_color.hi},
        {label: '厚生年金保険料', data: [ep.you], backgroundColor: bar_color.ep},
        {label: '雇用保険料', data: [ui.you], backgroundColor: bar_color.ui},
        {label: '源泉徴収額', data: [it_withholding], backgroundColor: bar_color.it},
      ]
    };
    var ctx_income = document.getElementById('graph-income-detail').getContext('2d');
    ctx_income.canvas.height = 80;
    chart_detail_income = plotHorizontalBar(ctx_income, datasets_income);

    // グラフを描画（ボーナス）
    var datasets_bonus_income = {
      datasets:[
        {label: '1回の手取りボーナス', data: [substantial_bonus], backgroundColor: bar_color.income},
        {label: '健康保険料', data: [hi_bonus.you], backgroundColor: bar_color.hi},
        {label: '厚生年金保険料', data: [ep_bonus.you], backgroundColor: bar_color.ep},
        {label: '雇用保険料', data: [ui_bonus.you], backgroundColor: bar_color.ui},
        {label: '源泉徴収額', data: [it_bonus_withholding], backgroundColor: bar_color.it},
      ]
    };
    var ctx_bonus = document.getElementById('graph-bonus-income-detail').getContext('2d');
    ctx_bonus.canvas.height = 80;
    chart_detail_bonus = plotHorizontalBar(ctx_bonus, datasets_bonus_income);

    // グラフを描画（年収）
    var datasets_annual_income = {
      datasets:[
        {label: '手取り年収', data: [substantial_annual_income], backgroundColor: bar_color.income},
        {label: '健康保険料', data: [hi.you * 12 + hi_bonus.you * bonus_number], backgroundColor: bar_color.hi},
        {label: '厚生年金保険料', data: [ep.you * 12 + ep_bonus.you * bonus_number], backgroundColor: bar_color.ep},
        {label: '雇用保険料', data: [ui.you * 12 + ui_bonus.you * bonus_number], backgroundColor: bar_color.ui},
        {label: '所得税額', data: [it] , backgroundColor: bar_color.it},
      ]
    };
    var ctx_annual = document.getElementById('graph-annual-income-detail').getContext('2d');
    ctx_annual.canvas.height = 80;
    chart_detail_annual_income = plotHorizontalBar(ctx_annual, datasets_annual_income);

    /*
     * 残業時間に対する変化
     */
    var graph_overwork = {
      labels: [],
      total: [],
      substantial: []
    }
    for (var i = 0; i <= 100; i += 20) {
      graph_overwork.labels.push((i == 0)? '残業なし' : i + '時間');
      // 額面年収
      var additional_income = calcOverworkIncome(i, income); // ひと月あたり8時間×20日間換算
      var monthly_income  = income + additional_income;
      var annual_income  = monthly_income * 12 + bonus_income_total;
      graph_overwork.total.push(annual_income);
      // 社会保険料
      var hi_over       = calcHealthInsurancePremium(company_pref, monthly_income);
      var ep_over       = calcEmployeePensionPremium(monthly_income);
      var ui_over       = calcUnemplymentInsurancePremium(industry_type, monthly_income);
      var total_premium = (hi_over.you + ep_over.you + ui_over.you) * 12 + premium_bonus.you * bonus_number;
      // 所得税
      var taxable_standard_income = calcTaxableIncome(annual_income - total_premium);
      var total_deduction = 380000 // 基礎控除
                          + total_premium;
      var taxable_income = round(Math.max(taxable_standard_income - total_deduction, 0), 1000, 'floor');　// 課税所得は千円未満の端数切捨
      var it = calcTaxValue(taxable_income);

      // 実質的な手取り
      var substantial_income = annual_income - total_premium - it;
      graph_overwork.substantial.push(substantial_income);
    }
    // グラフを描画（残業時間）
    chart_overwork_transition = new Chart($('#graph-overwork-income-transition'), {
      type: 'line',
      data: {
        labels: graph_overwork.labels,
        datasets: [{
          label: '手取り年収',
          data: graph_overwork.substantial,
          backgroundColor: '#f9808f',
          lineTension: 0,
          borderWidth: 0,
          pointRadius: 0
        }, {
          label: '額面年収',
          data: graph_overwork.total,
          backgroundColor: '#29abe2',
          lineTension: 0,
          borderWidth: 0,
          pointRadius: 0
        }]
      },
      options: {
        scales: {
            yAxes: [{
                ticks: {
                    // Include a dollar sign in the ticks
                    callback: function(value, index, values) {
                        return Math.floor(value / 10000) + '万円';
                    }
                }
            }]
        }
      }
    });
  });

  /* --------------------------------------------------
   * モーダル
   * --------------------------------------------------*/
  $('.detail-info').on('click', function () {
    var name = $(this).attr('name');
    showModal(name);
  });
  function showModal (id='') {
    var msg = $('#modal-parts').find('[' + id + ']');
    $('#moveModal').find('.title').text(msg.find('[title]').text());
    $('#moveModal').find('.body').html(msg.find('[body]').html());
    $('#moveModal').modal('show');
  }

  /* --------------------------------------------------
   * 整形
   * --------------------------------------------------*/
  // 数値にカンマを追加
  function add1000Separator (value = 0)
  {
    // 3桁おきにカンマを置く
    return String(value).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  }

  // 指定した桁数を指定した形で丸める
  function round (value = 0, width = 1, type = 'round')
  {
    if (width <= 0) {
      return value;
    } else {
      if (type == 'round') { // 四捨五入
        return Math.round(value / width) * width;
      } else if (type == 'ceil') { // 切り上げ
        return Math.ceil(value / width) * width;
      } else if (type == 'floor') { // 切り下げ
        return Math.floor(value / width) * width;
      } else if (type == 'roundhd') { // 五捨五超入
        return Math.ceil(value / width - 0.5) * width;
      }
    }
  }

  /* --------------------------------------------------
   * 入力
   * --------------------------------------------------*/
  // 市町村選択の表示非表示を判定して切り替える
  function toggleSelectResidentCity (resident_pref = 0) {
    // 市町村を選択する項目の行
    var box = $('#line-box-select-city');
    var select = $('#select-resident-city');
    select.empty();

    // 都道府県による条件分岐
    if (resident_pref == 13) { // 神奈川県なら
      select.append('<option value="1">横浜市</option>');
      select.append('<option value="0">それ以外の市町村</option>');
      box.slideDown(300);
    } else if (resident_pref == 22) { // 愛知県なら
      select.append('<option value="2">名古屋市</option>');
      select.append('<option value="0">それ以外の市町村</option>');
      box.slideDown(300);
    } else if (resident_pref == 27) { // 兵庫県なら
      select.append('<option value="0">豊岡市以外の市町村</option>');
      select.append('<option value="3">豊岡市</option>');
      box.slideDown(300);
    } else {
      select.append('<option value="0">全ての市町村</option>');
      box.slideUp(300);
    }
  }

  /* --------------------------------------------------
   * 時間外労働手当
   * --------------------------------------------------*/
  // 時間外労働手当を計算（ひと月あたり8時間×20日間換算）
  function calcOverworkIncome(overwork_hours = 0, income = 0) {
    var overwork_monthly_income = 0;
    if (overwork_hours < 60) {
      overwork_monthly_income = overwork_hours * 1.25 * income / (20 * 8);
    } else {
      overwork_monthly_income = (60 * 1.25 + (overwork_hours - 60) * 1.5) * income / (20 * 8);
    }
    return Math.floor(overwork_monthly_income);
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
      return income * 0.1 + 1200000;
    }
    if (income > 10000000) {
      return 2200000;
    }
  }

  // 課税所得金額を求める（給与所得控除額の計算がいらない）
  function calcTaxableIncome (income = 0)
  {
    var taxable_income = 0;

    if (income < 651000) {
      taxable_income = 0;
    } else if (income < 1619000) {
      taxable_income = income - 650000;
    } else if (income < 6600000) {
      // 怒涛の「別表第五」を参照
      var arr = csvToArray('./csv/table5-2018.csv');

      // 各行を走査
      for (var i = 0; i < arr.length; i++) {
        // 税額表の最下行以外のポジションで見つけた
        if (income < Number(arr[i][0])) {
          taxable_income = Number(arr[i][1]);
          break;
        }
      }
    } else if (income < 10000000) {
      taxable_income = income * 0.9 - 1200000;
    } else { // 1千万円以上
      taxable_income = income - 2200000;
    }

    return Math.floor(taxable_income);
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
    var tax = round(tax_pre_round, 100, 'floor');

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
    var tax = round(tax_pre_round, 10);

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
        if (income < Number(arr[i][Math.min(dependents_count, 7) + 1]) * 1000) {
          tax_rate = Number(arr[i][0]);
          break;
        }
        // 税額表の最下行まできたのに上の条件にヒットしなかった
        if (i == arr.length - 1) {
          tax_rate = Number(arr[arr.length - 1][0]);
          break;
        }
      }
    } else { // 乙欄のとき
      // 未実装
    }
    return tax_rate;
  }

  /* --------------------------------------------------
   * 住民税（均等割）
   * --------------------------------------------------*/
  // 道府県民税
  function calcPrefCapitation (pref_code = 0) {
    // 均等割(2023年まで500円増し)
    var capitation = 1500;

    // 都道府県により設定
    capitation = RT_RATE_LIST_PREF[pref_code][0];

    return capitation;
  }

  // 市町村民税
  function calcCityCapitation (city_code = 0) {
    // 均等割(2023年まで500円増し)
    var capitation = 3500;

    // 市町村により設定
    capitation = RT_RATE_LIST_CITY[city_code][0];

    return capitation;
  }

  /* --------------------------------------------------
   * 住民税（所得割）
   * --------------------------------------------------*/
  // 道府県民税
  function calcResidentTaxIncome (pref_code = 0, city_code = 0, taxable_standard_income = 0, rt_deduction = 0, dependents_count = 0) {
    // 所得割
    var income_part = {
      pref: 0,
      city: 0
    };
    // 所得割の課税基準額
    var tax_criteria = 0;

    // 扶養者がいるか否かで課税基準が変わる
    if (dependents_count > 0) {
      tax_criteria = (dependents_count + 1) * 350000 + 320000;
    } else {
      tax_criteria = 350000;
    }

    // 基準より大きな所得合計額ならば所得割を課す
    if (taxable_standard_income > tax_criteria) {
      // 課税所得金額を求める（千円未満の端数切捨）
      var rt_taxable_income = round(Math.max(taxable_standard_income - rt_deduction, 0), 1000, 'floor');
      // 所得割
      income_part.pref = rt_taxable_income * RT_RATE_LIST_PREF[pref_code][1];
      income_part.city = rt_taxable_income * RT_RATE_LIST_CITY[city_code][1];

      // 調整控除を行う
      var rt_adjust_deduction = calcAdjustDeduction(rt_taxable_income);
      income_part.pref = Math.max(round(income_part.pref - rt_adjust_deduction.pref, 100, 'floor'), 0);
      income_part.city = Math.max(round(income_part.city - rt_adjust_deduction.city, 100, 'floor'), 0);
    }

    return income_part;
  }

  /* --------------------------------------------------
   * 住民税の調整控除を計算
   * --------------------------------------------------*/
  function calcAdjustDeduction (income = 0) {
    // 調整控除額
    var deduction = 0;
    // 人的控除差の合計額
    var diff_personal_deduction = 50000; // 基礎控除の人的控除差のみを比較

    if (income > 2000000) { // 住民税の合計課税所得金額が200万円を超える場合
      // 人的控除差の合計と住民税の合計課税所得金額のいずれか小さい額×5％（市民税3％、県民税2％）を控除
      deduction = Math.min(income, diff_personal_deduction) * 0.05;
    } else { // 住民税の合計課税所得金額が200万円以下の場合
      //｛人的控除差の合計－（住民税の合計課税所得金額－200万円）｝×5％（市民税3％、県民税2％）を控除
      deduction = (diff_personal_deduction - (income - 2000000)) * 0.05;
      // 2500円未満の場合は2500円とする（元々は0.05を掛ける前の金額を最低5万にする）
      deduction = Math.max(deduction, 2500);
    }
    return {
      pref: deduction * 0.4,
      city: deduction * 0.6,
      total: deduction
    };
  }

  /* --------------------------------------------------
   * 健康保険料
   * --------------------------------------------------*/
  function calcHealthInsurancePremium (company_pref = 0, income = 0, bonus_number = 0, over_40_age = false) {
    // 健康保険料を格納
    var premium = {
      you: 0,
      company: 0,
      total: 0,
    };

    // 税率を掛ける収入額
    var target_income = 0;

    // 健康保険料率を求める
    var hi_rate = HI_GENERAL_RATE_LIST[company_pref];

    // 介護保険料が必要かチェック
    if (over_40_age) {
      hi_rate += LI_RATE;
    }

    // 月給かボーナスかチェック
    if (bonus_number == 0) // ボーナスでない
    {
      // 等級情報を取得
      var rank = getInsuranceRank(income);

      // 等級情報に基づく月額決定
      target_income = rank.monthly_price;
    }
    else if (bonus_number > 0) // ボーナスである
    {
      // 標準賞与額の上限は、健康保険は年間573万円（毎年4月1日から翌年3月31日までの累計額）
      var standard = Math.min(income, 5730000);

      // 計算対象のボーナス額（1回あたりの対象額）を求める（千円未満の端数切捨）
      target_income = round(standard / bonus_number, 1000, 'floor');
    }
    else // 不正な値
    {
      return premium;
    }

    // 健康保険料を求める
    var premium_basic = target_income * hi_rate / 100;
    premium.you     = round(premium_basic / 2, 1, 'roundhd');
    premium.company = round(premium_basic / 2);
    premium.total   = round(premium_basic);

    // 返す
    return premium;
  }

  /* --------------------------------------------------
   * 厚生年金保険料
   * --------------------------------------------------*/
  function calcEmployeePensionPremium (income = 0, bonus_number = 0) {
    // 厚生年金保険料を格納
    var premium = {
      you: 0,
      company: 0,
      total: 0,
    };

    // 税率を掛ける収入額
    var target_income = 0;

    // 月給かボーナスかチェック
    if (bonus_number == 0) // ボーナスでない
    {
      // 等級情報を取得
      var rank = getInsuranceRank(income);

      // 等級情報に基づく月額決定
      target_income = rank.monthly_price;
    }
    else if (bonus_number > 0) // ボーナスである
    {
      // 賞与標準は千円未満の端数切捨で月額150万円が上限
      var standard = Math.min(income / bonus_number, 1500000);

      // 計算対象のボーナス額を求める
      target_income = round(standard, 1000, 'floor')
    }
    else // 不正な値
    {
      return premium;
    }

    // 厚生年金保険料を求める
    var premium_basic = target_income * EP_RATE / 100;
    premium.you     = round(premium_basic / 2, 1, 'roundhd');
    premium.company = round(premium_basic / 2);
    premium.total   = round(premium_basic);

    // 返す
    return premium;
  }

  /* --------------------------------------------------
   * 雇用保険料
   * --------------------------------------------------*/
  function calcUnemplymentInsurancePremium (industry_type = 0, income = 0) {
    // 保険料を格納する
    var premium = {
      you: 0,
      company: 0,
      total: 0
    };

    // 事業のタイプにより税率が異なる
    if (industry_type == 0) { // 一般の事業
      premium.you     = round(income * UI_RATE_LIST[0].you, 1, 'roundhd');
      premium.company = round(income * UI_RATE_LIST[0].company);
    } else if (industry_type == 1) { // 農林水産・清酒製造の事業
      premium.you     = round(income * UI_RATE_LIST[1].you, 1, 'roundhd');
      premium.company = round(income * UI_RATE_LIST[1].company);
    } else if (industry_type == 2) { // 建設の事業
      premium.you     = round(income * UI_RATE_LIST[2].you, 1, 'roundhd');
      premium.company = round(income * UI_RATE_LIST[2].company);
    }

    // トータルの保険料を格納
    premium.total   = premium.you + premium.company

    // 保険料をまとめたDictionaryを返す
    return premium;
  }

  // 墓場
  /*if (0) {
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
  }*/

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

  // 水平バーを作る
  function plotHorizontalBar(plotarea , datasets) {
    return new Chart(plotarea, {
      type: "horizontalBar",
      data: datasets,
      options: {
        legend: {
          display: false
        },
        tooltips: {
          mode: 'nearest'
        },
        scales: {
          xAxes: [{
            display: true,
            stacked: false,
            ticks: {
              stepSize: 10
            },
            gridLines: {
              display: false
            }
          }],
          yAxes: [{
            gridLines: {
              drawBorder: false
            }
          }]
        },
        plugins: {
          stacked100: { enable: true }
        }
      }
    });
  }
});
