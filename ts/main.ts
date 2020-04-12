// DOMを読み終えたら
/// <reference path="data.ts" />
$(function () {
  'use strict';

  // グラフのインスタンス
  let chart_detail_income: Chart;
  let chart_detail_bonus: Chart;
  let chart_detail_annual_income: Chart;
  let chart_overwork_transition: Chart;

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

  // リトライボタンを押すと
  $('#retry').on('click', function () {
    // トップへスクロール
    $('body,html').animate({ scrollTop: 0 }, 400, 'swing');
  });

  $('a[href^="#"]').on('click', function () {
    const speed: number = 400; // ミリ秒
    const href = $(this).attr("href");
    const target = $(href == "#" || href == "" ? 'html' : href);
    const position = target.offset().top - 10; //ゆとりを持たせる
    $('body,html').animate({ scrollTop: position }, speed, 'swing');
  });

  // 都道府県選択の選択肢を用意
  for (let i = 0; i < PREF_LIST.length; i++) {
    const selected: string = (PREF_LIST[i] == '東京都')? 'selected' : '';
    $('#select-company-pref').append('<option value="' + i + '" ' + selected + '>' + PREF_LIST[i] + '</option>');
    $('#select-resident-pref').append('<option value="' + i + '" ' + selected + '>' + PREF_LIST[i] + '</option>');
  }
  // 自宅の都道府県を選択していない
  let resident_pref_selected: boolean = false;

  // 勤務先の都道府県を選択したら
  $('#select-company-pref').on('change', function () {
    // 初めての選択だったなら
    if (!resident_pref_selected) {
      let company_pref: number = Number($('#select-company-pref').val());
      company_pref = (company_pref)? company_pref : 0;

      // 自宅の都道府県もそれに合わせる
      $('#select-resident-pref').val(company_pref);
      toggleSelectResidentCity(company_pref);
    }
  });

  // 自宅の都道府県を選択したら
  $('#select-resident-pref').on('change', function () {
    let resident_pref: number = Number($('#select-resident-pref').val());
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
    const position: number = $('#result').offset().top - 10; //ゆとりを持たせる
    $('body,html').animate({ scrollTop: position }, 400, 'swing');

    /* --------------------------------------------------
     * 入力
     * --------------------------------------------------*/
    let income: number         = Number($('#input-income').val());
    let bonus_mounths: number  = Number($('#input-bonus-mounths').val());
    let bonus_number: number   = Number($('#input-bonus-number').val());
    let overwork_hours: number = Number($('#input-overwork-hours').val());
    let company_pref: number   = Number($('#select-company-pref').val());
    let resident_pref: number  = Number($('#select-resident-pref').val());
    let resident_city: number  = Number($('#select-resident-city').val());

    income         = (income)?         Math.abs(income) : 0;
    bonus_mounths  = (bonus_mounths)?  Math.abs(bonus_mounths) : 0;
    bonus_number   = (bonus_number)?   Math.abs(bonus_number) : 0;
    overwork_hours = (overwork_hours)? Math.abs(overwork_hours) : 0;
    company_pref   = (company_pref)?   Math.abs(company_pref) : 0;
    resident_pref  = (resident_pref)?  Math.abs(resident_pref) : 0;
    resident_city  = (resident_city)?  Math.abs(resident_city) : 0;

    let industry_type: number = 0; // 事業
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
    const bonus_income_total: number = Math.floor(income * bonus_mounths);
    const bonus_income_once: number = Math.floor(bonus_income_total / bonus_number);
    //給料の元になる支給額の計算（時間外労働手当）
    const overwork_monthly_income: number = calcOverworkIncome(overwork_hours, income);
    //給料の元になる支給額の計算（月収と年収）
    const monthly_income: number = income + overwork_monthly_income;
    const annual_income: number = monthly_income * 12 + bonus_income_total;

    // 結果を包むid要素を取得
    const r: JQuery<HTMLElement> = $('#result');

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
    let hi       = { you: 0, company: 0, total: 0 };
    let hi_bonus = { you: 0, company: 0, total: 0 };

    if (INSURANCE_MIN_INCOME <= income) { // 月の基本給が8万8千円以上なら
      hi       = calcHealthInsurancePremium(company_pref, monthly_income);
      hi_bonus = calcHealthInsurancePremium(company_pref, bonus_income_total, bonus_number);
    }

    // 厚生年金保険料
    let ep       = { you: 0, company: 0, total: 0 };
    let ep_bonus = { you: 0, company: 0, total: 0 };

    if (INSURANCE_MIN_INCOME <= income) { // 月の基本給が8万8千円以上なら
      ep       = calcEmployeePensionPremium(monthly_income);
      ep_bonus = calcEmployeePensionPremium(bonus_income_total, bonus_number);
    }

    // 雇用保険料
    let ui       = calcUnemplymentInsurancePremium(industry_type, monthly_income);
    let ui_bonus = calcUnemplymentInsurancePremium(industry_type, bonus_income_once);

    // 社会保険料の天引き月額
    const premium_monthly = {
      you:     hi.you + ep.you + ui.you,
      company: hi.company + ep.company + ui.company,
      total:   hi.total + ep.total + ui.total,
    }

    // 社会保険料の天引きボーナス額（1回あたり）
    const premium_bonus = {
      you:     hi_bonus.you + ep_bonus.you + ui_bonus.you,
      company: hi_bonus.company + ep_bonus.company + ui_bonus.company,
      total:   hi_bonus.total + ep_bonus.total + ui_bonus.total,
    }

    // 社会保険料の天引き年額
    const premium_annually = {
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
    const taxable_standard_income: number = calcTaxableIncome(annual_income);
    // 控除額を求める
    const it_deduction: number = calcBasicDeductionsIncomeTax(taxable_standard_income) // 基礎控除
                               + premium_annually.you; // 社会保険料控除
    // 課税所得金額を求める
    const it_taxable_income: number = round(Math.max(taxable_standard_income - it_deduction, 0), 1000, 'floor');　// 課税所得は千円未満の端数切捨
    // 所得税額を求める
    const it: number = calcBasicIncomeTax(it_taxable_income);

    // 結果を出力
    //r.find('[total-deduction]').text(add1000Separator(total_deduction));
    r.find('[taxiable-standard]').text(add1000Separator(taxable_standard_income));
    //r.find('[taxiable-income]').text(add1000Separator(taxable_income));
    r.find('[it]').text(add1000Separator(it));

    /* --------------------------------------------------
     * 住民税計算
     * --------------------------------------------------*/
    // 控除額を求める
    const rt_deduction: number = 330000 // 基礎控除（所得税と多少異なるのに注意）
                               + premium_annually.you; // 社会保険料控除
    // 均等割
    const pref_capitation: number = calcPrefCapitation(resident_pref);
    const city_capitation: number = calcCityCapitation(resident_pref, resident_city);
    //所得割
    const rt_income = calcResidentTaxIncome(resident_pref, resident_city, taxable_standard_income, rt_deduction);
    // 住民税
    const pref_tax: number = pref_capitation + rt_income.pref;
    const city_tax: number = city_capitation + rt_income.city;
    // 住民税総額
    const rt: number = pref_tax + city_tax;
    // 月あたりの住民税額
    const rt_monthly: number = round(rt / 12, 100, 'floor');
    const rt_monthly_june: number = rt - 11 * rt_monthly; // 6月分は端数の切捨額を含むため少し多い

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
    let it_taxable_income_withholding: number = monthly_income
                                              - premium_monthly.you
                                              - calcTaxableIncomeDeductionsWithholding(monthly_income - premium_monthly.you)
                                              - calcBasicDeductionsWithholding(monthly_income - premium_monthly.you)
                                              - calcSpouseDeductionsWithholding (false)
                                              - calcDependentsDeductionsWithholding(0);
    it_taxable_income_withholding = Math.max(it_taxable_income_withholding, 0);

    const it_withholding: number = calcTaxValueWithholding(it_taxable_income_withholding);

    // ボーナス
    const it_rate_bonus_withholding: number = calcTaxRate(monthly_income - premium_monthly.you);
    let it_taxiable_bonus_withholding: number = bonus_income_once
                                              - hi_bonus.you
                                              - ep_bonus.you
                                              - ui_bonus.you;
    it_taxiable_bonus_withholding = Math.max(it_taxiable_bonus_withholding, 0);
    const it_bonus_withholding: number = Math.floor(it_taxiable_bonus_withholding * it_rate_bonus_withholding / 100); // 1円未満の端数は切り捨て

    // 結果を出力
    r.find('[it-withholding]').text(add1000Separator(it_withholding));
    r.find('[it-bonus-withholding]').text(add1000Separator(it_bonus_withholding));

    /* --------------------------------------------------
     * 手取り給料
     * --------------------------------------------------*/
    // 実質の年収
    const substantial_annual_income: number = annual_income
                                            - premium_annually.you
                                            - it;
                                            // - residents_tax;は2年目以降

    // 実質のボーナス（1回あたり）
    const substantial_bonus: number = bonus_income_once
                                    - premium_bonus.you
                                    - it_bonus_withholding;

    // 実質毎月振り込まれる月給
    const substantial_income: number = monthly_income
                                     - premium_monthly.you
                                     - it_withholding;

    // 結果を出力
    r.find('[substantial-income]').text(add1000Separator(substantial_income));
    r.find('[substantial-income-minus-rt]').text(add1000Separator(substantial_income - rt_monthly));
    r.find('[substantial-bonus]').text(add1000Separator(substantial_bonus));
    r.find('[substantial-annual-income]').text(add1000Separator(substantial_annual_income));
    r.find('[substantial-annual-income-minus-rt]').text(add1000Separator(substantial_annual_income - rt));

    /* --------------------------------------------------
     * シェアリンク生成
     * --------------------------------------------------*/
    // Twitterとテキストボックス
    const message_body: string = 'あなたの年収は「' + add1000Separator(annual_income) + '円」です。' + "\n"
                               + 'が、社会保険料と所得税が引かれて「' + add1000Separator(substantial_annual_income) + '円」ぐらいになります。' + "\n"
                               + '去年と同じ年収なら、住民税も引いた手取り年収は「' + add1000Separator(substantial_annual_income - rt) + '円」ぐらいです。';
    const site_url: string = 'https://oguemon.com/tax-calc/'
    const hashtag: string  = 'ザックリ手取り給料計算機';
    const user_id: string  = 'oguemon_com';
    const textarea_body: string = message_body + "\n" + site_url + " #" + hashtag;
    const twitter_parms: string = 'url=' + encodeURI(site_url) + '&text=' + encodeURI(message_body) + '&hashtags=' + encodeURI(hashtag) + '&related=' + user_id;

    $('#copy-area-text').text(textarea_body);
    $('#share-twitter').attr('href', 'https://twitter.com/intent/tweet?' + twitter_parms);

    // メール
    const mail_subject: string = '私の手取り年収がわかりました';
    const mail_body: string = '親戚各位' + '%0D%0A' + '%0D%0A'
                            + 'お世話になっております、〇〇です。' + '%0D%0A'
                            + 'ところでなのですが、ついに私の年収がわかりました。' + '%0D%0A'
                            + '額面年収が「' + add1000Separator(annual_income) + '円」なのに対して、'
                            + '所得税や社会保険料を引かれた後に残る金額は「' + add1000Separator(substantial_annual_income) + '円」くらいだそうです。' + '%0D%0A'
                            + 'さらに、この年収だと住民税が大体「' + add1000Separator(rt) + '円」くらい課されるので、'
                            + '昨年度と年収が変わらなかったら、手取り年収はおおよそ「' + add1000Separator(substantial_annual_income - rt) + '円」になります。'+ '%0D%0A'
                            + '質問などがございましたら、是非ともご返信願います。'
                            + '取り急ぎご報告まで。' + '%0D%0A' + '%0D%0A'
                            + '簡単！ザックリ手取り計算機' + '%0D%0A'
                            + 'https://oguemon.com/tax-calc/';

    $('#share-mail').attr('href', 'mailto:contact@oguemon.com?subject=' + mail_subject + '&body=' + mail_body);

    /* --------------------------------------------------
     * グラフ描画
     * --------------------------------------------------*/
    // 過去にグラフ描画をしていたらそれを破棄
    if (chart_detail_income) { chart_detail_income.destroy(); }
    if (chart_detail_bonus) { chart_detail_bonus.destroy(); }
    if (chart_detail_annual_income) { chart_detail_annual_income.destroy(); }
    if (chart_overwork_transition) { chart_overwork_transition.destroy(); }

    // グラフ描画に用いる色を割り当て
    const bar_color = {
      income: '#f9808f',
      hi: '#39b54a',
      ep: '#009245',
      ui: '#006837',
      it: '#29abe2',
    }

    // グラフを描画（月収）
    const datasets_income = {
      datasets:[
        {label: '手取り月収', data: [substantial_income], backgroundColor: bar_color.income},
        {label: '健康保険料', data: [hi.you], backgroundColor: bar_color.hi},
        {label: '厚生年金保険料', data: [ep.you], backgroundColor: bar_color.ep},
        {label: '雇用保険料', data: [ui.you], backgroundColor: bar_color.ui},
        {label: '源泉徴収額', data: [it_withholding], backgroundColor: bar_color.it},
      ]
    };
    const ctx_income_canvas: HTMLCanvasElement = <HTMLCanvasElement> $('#graph-income-detail')[0];
    const ctx_income: CanvasRenderingContext2D = ctx_income_canvas.getContext('2d');
    ctx_income.canvas.height = 80;
    chart_detail_income = plotHorizontalBar(ctx_income, datasets_income);

    // グラフを描画（ボーナス）
    const datasets_bonus_income = {
      datasets:[
        {label: '1回の手取りボーナス', data: [substantial_bonus], backgroundColor: bar_color.income},
        {label: '健康保険料', data: [hi_bonus.you], backgroundColor: bar_color.hi},
        {label: '厚生年金保険料', data: [ep_bonus.you], backgroundColor: bar_color.ep},
        {label: '雇用保険料', data: [ui_bonus.you], backgroundColor: bar_color.ui},
        {label: '源泉徴収額', data: [it_bonus_withholding], backgroundColor: bar_color.it},
      ]
    };
    const ctx_bonus_canvas: HTMLCanvasElement = <HTMLCanvasElement> $('#graph-bonus-income-detail')[0];
    const ctx_bonus: CanvasRenderingContext2D = ctx_bonus_canvas.getContext('2d');
    ctx_bonus.canvas.height = 80;
    chart_detail_bonus = plotHorizontalBar(ctx_bonus, datasets_bonus_income);

    // グラフを描画（年収）
    const datasets_annual_income = {
      datasets:[
        {label: '手取り年収', data: [substantial_annual_income], backgroundColor: bar_color.income},
        {label: '健康保険料', data: [hi.you * 12 + hi_bonus.you * bonus_number], backgroundColor: bar_color.hi},
        {label: '厚生年金保険料', data: [ep.you * 12 + ep_bonus.you * bonus_number], backgroundColor: bar_color.ep},
        {label: '雇用保険料', data: [ui.you * 12 + ui_bonus.you * bonus_number], backgroundColor: bar_color.ui},
        {label: '所得税額', data: [it] , backgroundColor: bar_color.it},
      ]
    };
    const ctx_annual_canvas: HTMLCanvasElement = <HTMLCanvasElement> $('#graph-annual-income-detail')[0];
    const ctx_annual: CanvasRenderingContext2D = ctx_annual_canvas.getContext('2d');
    ctx_annual.canvas.height = 80;
    chart_detail_annual_income = plotHorizontalBar(ctx_annual, datasets_annual_income);

    /*
     * 残業時間に対する変化
     */
    const graph_overwork = {
      labels: [],
      total: [],
      substantial: []
    }
    for (let i = 0; i <= 100; i += 20) {
      graph_overwork.labels.push((i == 0)? '残業なし' : i + '時間');
      // 額面年収
      const additional_income: number = calcOverworkIncome(i, income); // ひと月あたり8時間×20日間換算
      const monthly_income: number = income + additional_income;
      const annual_income: number = monthly_income * 12 + bonus_income_total;
      graph_overwork.total.push(annual_income);
      // 社会保険料
      let hi_over = { you: 0, company: 0, total: 0 };
      let ep_over = { you: 0, company: 0, total: 0 };

      if (INSURANCE_MIN_INCOME <= income) {
        hi_over = calcHealthInsurancePremium(company_pref, monthly_income);
        ep_over = calcEmployeePensionPremium(monthly_income);
      }

      const ui_over       = calcUnemplymentInsurancePremium(industry_type, monthly_income);
      const total_premium: number = (hi_over.you + ep_over.you + ui_over.you) * 12 + premium_bonus.you * bonus_number;
      // 所得税
      const taxable_standard_income: number = calcTaxableIncome(annual_income - total_premium);
      const total_deduction: number = calcBasicDeductionsIncomeTax(taxable_standard_income) // 基礎控除
                                    + total_premium;
      const taxable_income: number = round(Math.max(taxable_standard_income - total_deduction, 0), 1000, 'floor');　// 課税所得は千円未満の端数切捨
      const it: number = calcBasicIncomeTax(taxable_income);

      // 実質的な手取り
      const substantial_income: number = annual_income - total_premium - it;
      graph_overwork.substantial.push(substantial_income);
    }
    // グラフを描画（残業時間）
    const chart_overwork_transition_canvas: HTMLCanvasElement = <HTMLCanvasElement> $('#graph-overwork-income-transition')[0];
    chart_overwork_transition = new Chart(chart_overwork_transition_canvas, {
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
                      return Math.floor(Number(value) / 10000) + '万円';
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
    const name: string = $(this).attr('name');
    showModal(name);
  });
  function showModal (id='') {
    const msg = $('#modal-parts').find('[' + id + ']');
    const move_modal: any = $('#moveModal'); //自作プラグインを使うためany型で定義…
    move_modal.find('.title').text(msg.find('[title]').text());
    move_modal.find('.body').html(msg.find('[body]').html());
    move_modal.modal('show');
  }

  /* --------------------------------------------------
   * 整形
   * --------------------------------------------------*/
  // 数値にカンマを追加
  function add1000Separator (value = 0) : string
  {
    // 3桁おきにカンマを置く
    return String(value).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  }

  // 指定した桁数を指定した形で丸める
  function round (value = 0, width = 1, type = 'round') : number
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
  function toggleSelectResidentCity (resident_pref = 0) : void
  {
    // 市町村を選択する項目の行
    const box: JQuery<HTMLElement> = $('#line-box-select-city');
    const select: JQuery<HTMLElement> = $('#select-resident-city');
    select.empty();

    // 都道府県名を格納
    const pref_name: string = PREF_LIST[resident_pref];

    // 指定された都道府県か否かをチェック
    if (pref_name in ORDINANCE_DESIGNATED_CITY_LIST) {
      const oedinance_designated_sities_in_pref: string[] = ORDINANCE_DESIGNATED_CITY_LIST[pref_name];
      for (let i = 0; i < oedinance_designated_sities_in_pref.length; i++) {
        select.append('<option value="' + (i + 1) + '">' + oedinance_designated_sities_in_pref[i] + '</option>');
      }
      if (pref_name　== '兵庫県') {
        select.append('<option value="' + (oedinance_designated_sities_in_pref.length + 1) + '">豊岡市</option>');
      }
      select.append('<option value="0">それ以外の市町村</option>');
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
  function calcOverworkIncome(overwork_hours = 0, income = 0) : number
  {
    let overwork_monthly_income: number = 0;
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
  // 給与所得控除額を計算（令和2年分以降）
  // https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1410.htm
  function calcTaxableIncomeDeductions (income = 0): number
  {
    // 給与所得控除額
    let taxable_income_deductions: number = 0;

    if (income <= 1800000) {
      // 最低でも55万は控除される
      taxable_income_deductions = Math.max(income * 0.4 - 100000, 550000);
    }
    if (income <= 3600000) {
      taxable_income_deductions = income * 0.3 + 80000;
    }
    if (income <= 6600000) {
      taxable_income_deductions = income * 0.2 + 440000;
    }
    if (income <= 8500000) {
      taxable_income_deductions = income * 0.1 + 1100000;
    } else {
      taxable_income_deductions = 1950000;
    }

    return taxable_income_deductions;
  }

  // 課税所得金額を求める（給与所得控除額の計算がいらない）
  function calcTaxableIncome (income = 0): number
  {
    // 年調給与額
    let yearend_tax_adj_income: number = 0;

    // 給与所得控除後の給与等の金額
    let taxable_income: number = 0;

    // (1) 年調給与額の算出（令和元年分より・令和2年分は変更なし）
    // https://www.nta.go.jp/publication/pamph/gensen/nencho2019/pdf/82-83.pdf
    if (income < 1619000) {
      // 給与の総額をそのまま年調給与額とします
      yearend_tax_adj_income = income;
    } else if (income < 6600000) {
      // 階差と同一階差の最小値の設定
      let rank_width: number = 0;
      let rank_min: number = 0;

      if (income < 1620000) {
        rank_width = 1000;
        rank_min = 1619000;
      } else if (income < 1624000) {
        rank_width = 2000;
        rank_min = 1620000;
      } else { // 162万4000円以上
        rank_width = 1000;
        rank_min = 1624000;
      }

      // 算式1. 余りの計算
      const remainder: number = (income - rank_min) % rank_width;

      // 算式2. 年調給与額の計算
      yearend_tax_adj_income = income - remainder;
    } else { // 660万円以上
      // 給与の総額をそのまま年調給与額とします
      yearend_tax_adj_income = income;
    }

    // (2) 給与所得控除後の給与等の金額の計算（令和2年分事前の情報提供より）
    // https://www.nta.go.jp/users/gensen/nenmatsu/denshikeisan.htm
    if (yearend_tax_adj_income < 551000) {
      taxable_income = 0;
    } else if (yearend_tax_adj_income < 1619000) {
      taxable_income = yearend_tax_adj_income  - 550000;
    } else if (yearend_tax_adj_income < 1620000) {
      taxable_income = yearend_tax_adj_income * 0.6 + 97600;
    } else if (yearend_tax_adj_income < 1622000) {
      taxable_income = yearend_tax_adj_income * 0.6 + 98000;
    } else if (yearend_tax_adj_income < 1624000) {
      taxable_income = yearend_tax_adj_income * 0.6 + 98800;
    } else if (yearend_tax_adj_income < 1628000) {
      taxable_income = yearend_tax_adj_income * 0.6 + 99600;
    } else if (yearend_tax_adj_income < 1800000) {
      taxable_income = yearend_tax_adj_income * 0.6 + 100000;
    } else if (yearend_tax_adj_income < 3600000) {
      taxable_income = yearend_tax_adj_income * 0.7 - 80000;
    } else if (yearend_tax_adj_income < 6600000) {
      taxable_income = yearend_tax_adj_income * 0.8 - 440000;
    } else if (yearend_tax_adj_income < 8500000) {
      taxable_income = yearend_tax_adj_income * 0.9 - 1100000;
    } else { // 850万円以上
      taxable_income = yearend_tax_adj_income - 1950000;
    }

    return Math.floor(taxable_income);
  }

  // 所得税における基礎控除額を求める（令和2年分以降）
  // https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/1199.htm
  function calcBasicDeductionsIncomeTax (income: number = 0) : number
  {
    // 基本控除額を格納
    let basic_deductions: number = 0;

    if (income <= 2400 * 10000) {
      basic_deductions = 48 * 10000;
    } else if (income <= 2450 * 10000) {
      basic_deductions = 32 * 10000;
    } else if (income <= 2500 * 10000) {
      basic_deductions = 16 * 10000;
    } else { // 2500万円超
      basic_deductions = 0;
    }

    return basic_deductions;
  }

  // 課税所得金額から税額を計算（平成27年分以降・令和2年分は変更なし）
  // https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm
  function calcBasicIncomeTax (taxable_income = 0) : number
  {
    // 端数処理前の税額を格納
    let tax_pre_round: number = 0;

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
    } else { // 4000万円超
      tax_pre_round = taxable_income * 0.45 - 4796000;
    }

    // 1000円以下の金額を切り捨て
    const tax: number = round(tax_pre_round, 1000, 'floor');

    return tax;
  }

  // 所得税額から復興特別所得税額を計算（平成25年分〜令和19年分が対象）
  // https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm
  function calcReconstructionSpecialIncomeTax (income_tax: number) : number
  {
    // 復興特別所得税額
    const reconstruction_special_income_tax: number = 0.021 * income_tax;

    return reconstruction_special_income_tax;
  }

  /* --------------------------------------------------
   * 源泉徴収（甲欄）
   * --------------------------------------------------*/
  // 源泉徴収における給与所得控除額を求める
  // 電子計算機等を使用して源泉徴収税額を計算する方法（令和2年分）別表第一
  // https://www.nta.go.jp/publication/pamph/gensen/zeigakuhyo2019/data/18.pdf
  function calcTaxableIncomeDeductionsWithholding (income = 0) : number
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
  function calcBasicDeductionsWithholding (income = 0) : number
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
  function calcSpouseDeductionsWithholding (exist_partner = false) : number
  {
    return (exist_partner)? 31667 : 0;
  }

  // 源泉徴収における扶養控除額を求める
  // 電子計算機等を使用して源泉徴収税額を計算する方法（令和2年分）別表第二
  // https://www.nta.go.jp/publication/pamph/gensen/zeigakuhyo2019/data/18.pdf
  function calcDependentsDeductionsWithholding (dependents_count = 0) : number
  {
    // 基礎控除に加えて扶養人数に応じた
    return 31667 * dependents_count;
  }

  // 源泉徴収額を求める
  // 電子計算機等を使用して源泉徴収税額を計算する方法（令和2年分）別表第四
  // https://www.nta.go.jp/publication/pamph/gensen/zeigakuhyo2019/data/18.pdf
  function calcTaxValueWithholding (taxable_income = 0) : number
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

  /* --------------------------------------------------
   * 源泉徴収（ボーナス）
   * --------------------------------------------------*/
  // 賞与に対する源泉徴収税額を求める
  // 賞与に対する源泉徴収税額の算出率の表（令和2年分）
  // https://www.nta.go.jp/publication/pamph/gensen/zeigakuhyo2019/data/15-16.xls
  function calcTaxRate (income = 0, kou = true, dependents_count = 0) : number
  {
    const arr: string[][] = csvToArray('./csv/withholding-bonus-2020.csv');
    let tax_rate: number = 0;

    if (kou) { // 甲欄のとき
      // 税額表の各行を走査
      for (let i = 0; i < arr.length; i++) {
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
  function calcPrefCapitation (pref_code = 0) : number
  {
    // 均等割(2023年まで500円増し)
    let capitation: number = 1500;

    // 都道府県により設定
    capitation = RT_RATE_LIST_PREF[pref_code][0];

    return capitation;
  }

  // 市町村民税
  function calcCityCapitation (pref_code = 0, city_code = 0) : number
  {
    // 均等割(2023年まで500円増し)
    let capitation: number = 3500;

    // 特殊な市町村なら再設定
    if (pref_code == 13 && city_code == 1) { // 神奈川県横浜市
      capitation = RT_RATE_LIST_CITY['神奈川県横浜市'][0];
    } else if (pref_code == 22 && city_code == 1) { // 愛知県名古屋市
      capitation = RT_RATE_LIST_CITY['愛知県名古屋市'][0];
    }

    return capitation;
  }

  /* --------------------------------------------------
   * 住民税（所得割）
   * --------------------------------------------------*/
  // 道府県民税
  function calcResidentTaxIncome (pref_code = 0, city_code = 0, taxable_standard_income = 0, rt_deduction = 0, dependents_count = 0)
  {
    // 所得割
    const income_part = {
      pref: 0,
      city: 0
    };
    // 所得割の課税基準額
    let tax_criteria: number = 0;

    // 扶養者がいるか否かで課税基準が変わる
    if (dependents_count > 0) {
      tax_criteria = (dependents_count + 1) * 350000 + 320000;
    } else {
      tax_criteria = 350000;
    }

    // 基準より大きな所得合計額ならば所得割を課す
    if (taxable_standard_income > tax_criteria) {
      // 課税所得金額を求める（千円未満の端数切捨）
      const rt_taxable_income: number = round(Math.max(taxable_standard_income - rt_deduction, 0), 1000, 'floor');
      // 所得割（都道府県・市町村による違いを条件判定）
      let rt_rate_pref: number = RT_RATE_LIST_PREF[pref_code][1];
      let rt_rate_city: number = RT_RATE_LIST_CITY['一般市町村'][1];
      if (city_code > 0) { // 普通の市町村でない
        if(pref_code == 22) { // 愛知県名古屋市
          rt_rate_city = RT_RATE_LIST_CITY['愛知県名古屋市'][1];
          rt_rate_pref -= 0.02;
          rt_rate_city += 0.02;
        } else if (pref_code == 27 && city_code == 2) { // 兵庫県豊岡市
          rt_rate_city = RT_RATE_LIST_CITY['兵庫県豊岡市'][1];
        } else { // ただの政令指定都市たち
          rt_rate_pref -= 0.02;
          rt_rate_city += 0.02;
        }
      }
      income_part.pref = rt_taxable_income * rt_rate_pref;
      income_part.city = rt_taxable_income * rt_rate_city;

      // 調整控除を行う
      const rt_adjust_deduction = calcAdjustDeduction(rt_taxable_income, rt_rate_pref, rt_rate_city);
      income_part.pref = Math.max(round(income_part.pref - rt_adjust_deduction.pref, 100, 'floor'), 0);
      income_part.city = Math.max(round(income_part.city - rt_adjust_deduction.city, 100, 'floor'), 0);
    }

    return income_part;
  }

  /* --------------------------------------------------
   * 住民税の調整控除を計算
   * --------------------------------------------------*/
  function calcAdjustDeduction (income = 0, rt_rate_pref = 0.04, rt_rate_city = 0.06) {
    // 調整控除額
    let deduction: number = 0;
    // 人的控除差の合計額
    const diff_personal_deduction: number = 50000; // 基礎控除の人的控除差のみを比較

    if (income > 2000000) { // 住民税の合計課税所得金額が200万円を超える場合
      // 人的控除差の合計と住民税の合計課税所得金額のいずれか小さい額×5％（市民税と県民税の％合計）を控除
      deduction = Math.min(income, diff_personal_deduction) * 0.05;
    } else { // 住民税の合計課税所得金額が200万円以下の場合
      //｛人的控除差の合計－（住民税の合計課税所得金額－200万円）｝×5％（市民税と県民税の％合計）を控除
      deduction = (diff_personal_deduction - (income - 2000000)) * 0.05;
      // 2500円未満の場合は2500円とする（元々は0.05を掛ける前の金額を最低5万にする）
      deduction = Math.max(deduction, 2500);
    }
    return {
      pref: deduction * rt_rate_pref / (rt_rate_pref + rt_rate_city),
      city: deduction * rt_rate_city / (rt_rate_pref + rt_rate_city),
      total: deduction
    };
  }

  /* --------------------------------------------------
   * 健康保険料
   * --------------------------------------------------*/
  function calcHealthInsurancePremium (company_pref = 0, income = 0, bonus_number = 0, over_40_age = false)
  {
    // 健康保険料を格納
    const premium = {
      you: 0,
      company: 0,
      total: 0,
    };

    // 税率を掛ける収入額
    let target_income: number = 0;

    // 健康保険料率を求める
    let hi_rate: number = HI_GENERAL_RATE_LIST[company_pref][0];

    // 介護保険料が必要かチェック
    if (over_40_age) {
      hi_rate += LI_RATE;
    }

    // 月給かボーナスかチェック
    if (bonus_number == 0) // ボーナスでない
    {
      // 等級情報を取得
      const rank = getInsuranceRank(income);

      // 等級情報に基づく月額決定
      target_income = rank.monthly_price;
    }
    else if (bonus_number > 0) // ボーナスである
    {
      // 標準賞与額の上限は、健康保険は年間573万円（毎年4月1日から翌年3月31日までの累計額）
      const standard: number = Math.min(income, 5730000);

      // 計算対象のボーナス額（1回あたりの対象額）を求める（千円未満の端数切捨）
      target_income = round(standard / bonus_number, 1000, 'floor');
    }
    else // 不正な値
    {
      return premium;
    }

    // 健康保険料を求める
    const premium_basic: number = target_income * hi_rate / 100;
    premium.you     = round(premium_basic / 2, 1, 'roundhd');
    premium.company = round(premium_basic / 2);
    premium.total   = round(premium_basic);

    // 返す
    return premium;
  }

  /* --------------------------------------------------
   * 厚生年金保険料
   * --------------------------------------------------*/
  function calcEmployeePensionPremium (income = 0, bonus_number = 0)
  {
    // 厚生年金保険料を格納
    const premium = {
      you: 0,
      company: 0,
      total: 0,
    };

    // 税率を掛ける収入額
    let target_income: number = 0;

    // 月給かボーナスかチェック
    if (bonus_number == 0) // ボーナスでない
    {
      // 等級情報を取得
      const rank = getInsuranceRank(income);

      // 等級情報に基づく月額決定
      target_income = rank.monthly_price;
    }
    else if (bonus_number > 0) // ボーナスである
    {
      // 賞与標準は千円未満の端数切捨で月額150万円が上限
      const standard: number = Math.min(income / bonus_number, 1500000);

      // 計算対象のボーナス額を求める
      target_income = round(standard, 1000, 'floor')
    }
    else // 不正な値
    {
      return premium;
    }

    // 厚生年金保険料を求める
    const premium_basic: number = target_income * EP_RATE / 100;
    premium.you     = round(premium_basic / 2, 1, 'roundhd');
    premium.company = round(premium_basic / 2);
    premium.total   = round(premium_basic);

    // 返す
    return premium;
  }

  /* --------------------------------------------------
   * 雇用保険料
   * --------------------------------------------------*/
  function calcUnemplymentInsurancePremium (industry_type = 0, income = 0)
  {
    // 保険料を格納する
    const premium = {
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

  // CSVファイル読み込み
  function csvToArray(path) : string[][]
  {
    const csvData: string[][] = new Array();

    const data: XMLHttpRequest = new XMLHttpRequest();
    data.open("GET", path, false);
    data.send(null);

    const LF: string = String.fromCharCode(10);
    const lines: string[] = data.responseText.split(LF);

    for (let i = 0; i < lines.length; ++i) {
      const cells: string[] = lines[i].split(",");
      if(cells.length > 1) {
        csvData.push(cells);
      }
    }
    return csvData;
  }

  // 水平バーを作る
  function plotHorizontalBar(plotarea , datasets): Chart
  {
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
