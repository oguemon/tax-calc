import $ from 'jquery';
import Chart from 'chart.js';
import * as Data from './Data';
import { add1000Separator } from './Util';
import { WithholdingSalary } from "./WithholdingSalary";
import { WithholdingBonus } from "./WithholdingBonus";
import { sum, DataSetForInsurancePremium } from "./InsurancePremium";
import { EmployeePension } from "./EmployeePension";
import { HealthInsurance } from "./HealthInsurance";
import { IndustryType, UnemplymentInsurance } from "./UnemplymentInsurance";
import { IncomeTax } from './IncomeTax';
import { ResidentTax } from './ResidentTax';
import ModalPlugin from './modal';

$(function () {
    'use strict';

    // モーダルプラグインの定義
    $.fn.extend({
        modal: ModalPlugin,
    });

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
    for (let i = 0; i < Data.PREF_LIST.length; i++) {
        const selected: string = (Data.PREF_LIST[i] == '東京都')? 'selected' : '';
        $('#select-company-pref').append('<option value="' + i + '" ' + selected + '>' + Data.PREF_LIST[i] + '</option>');
        $('#select-resident-pref').append('<option value="' + i + '" ' + selected + '>' + Data.PREF_LIST[i] + '</option>');
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

        let industry_type: IndustryType = 0; // 事業
        if ($('input[name="industry"]:eq(0)').prop('checked')) {
            industry_type = 0;
        } else if ($('input[name="industry"]:eq(1)').prop('checked')) {
            industry_type = 1;
        } else if ($('input[name="industry"]:eq(2)').prop('checked')) {
            industry_type = 2;
        }

        // ボーナスの回数がゼロ（ボーナスがない）なら、1回あたりのボーナスゼロで支給回数1回ってことにする
        if (bonus_number == 0) {
            bonus_mounths = 0;
            bonus_number = 1;
        }

        //給料の元になる支給額の計算（ボーナス）
        let bonus_income_once: number = Math.floor(income * bonus_mounths);

        // 残業情報
        let basic_work_hours: number = 160;
        let overwork_rate: number = 1.25;
        let extreme_overwork_rate: number = 1.5;

        // 健康保険料率
        let hi_rate: DataSetForInsurancePremium = {
            you:     Data.HI_GENERAL_RATE_LIST[company_pref][0] / 2,
            company: Data.HI_GENERAL_RATE_LIST[company_pref][0] / 2,
            total:   Data.HI_GENERAL_RATE_LIST[company_pref][0],
        };

        // 詳細設定がオンならば
        if ($('#income-input .detail-box').css('display') != 'none') {
            const input_bonus_income_once     = Number($('#input-bonus-income-once').val());
            const input_basic_work_hours      = Number($('#input-basic-work-hours').val());
            const input_overwork_rate         = Number($('#input-overwork-rate').val());
            const input_extreme_overwork_rate = Number($('#input-extreme-overwork-rate').val());
            const input_hi_rate_you           = Number($('#input-hi-rate-you').val());
            const input_hi_rate_company       = Number($('#input-hi-rate-company').val());

            // ボーナス金額
            if (input_bonus_income_once) {
                bonus_income_once = input_bonus_income_once;
            }

            // 基本労働時間
            if (input_basic_work_hours) {
                basic_work_hours = input_basic_work_hours;
            }

            // 割増賃金の倍率（残業60時間未満）
            if (input_overwork_rate) {
                overwork_rate = input_overwork_rate;
            }

            // 割増賃金の倍率（残業60時間以上）
            if (input_extreme_overwork_rate) {
                extreme_overwork_rate = input_extreme_overwork_rate;
            }

            // 健康保険料率（自己負担）
            if (input_hi_rate_you) {
                hi_rate.you = input_hi_rate_you;
            }

            // 健康保険料率（会社負担）
            if (input_hi_rate_company) {
                hi_rate.company = input_hi_rate_company;
            } else {
                hi_rate.company = hi_rate.you; // 未設定なら折半（自己負担と同額）とする
            }

            // 健康保険料率（合計）
            hi_rate.total = hi_rate.you + hi_rate.company;
        }

        /* --------------------------------------------------
         * 額面給料計算
         * --------------------------------------------------*/
        //給料の元になる支給額の計算（ボーナス）
        const bonus_income_total: number = Math.floor(bonus_income_once * bonus_number);
        //給料の元になる支給額の計算（時間外労働手当）
        const overwork_monthly_income: number = calcOverworkIncome(income, overwork_hours, basic_work_hours, overwork_rate, extreme_overwork_rate);
        //給料の元になる支給額の計算（月収と年収）
        const monthly_income: number = income + overwork_monthly_income;
        const annual_income: number = monthly_income * 12 + bonus_income_total;

        // 結果を包むid要素を取得
        const r: JQuery<HTMLElement> = $('#result');

        // 結果を出力（給料）
        r.find('[basic-income]')           .text(add1000Separator(income));
        r.find('[bonus-income-once]')      .text(add1000Separator(bonus_income_once));
        r.find('[overwork-monthly-income]').text(add1000Separator(overwork_monthly_income));
        r.find('[monthly-income]')         .text(add1000Separator(monthly_income));
        r.find('[annual-income]')          .text(add1000Separator(annual_income));

        /* --------------------------------------------------
         * 社会保険料計算
         * --------------------------------------------------*/
        // 健康保険料
        let hi      : HealthInsurance = new HealthInsurance(hi_rate, income, monthly_income);
        let hi_bonus: HealthInsurance = new HealthInsurance(hi_rate, income, bonus_income_total, bonus_number);
        const hi_annually: DataSetForInsurancePremium = {
            you:     hi.premium.you     * 12 + hi_bonus.premium.you     * bonus_number,
            company: hi.premium.company * 12 + hi_bonus.premium.company * bonus_number,
            total:   hi.premium.total   * 12 + hi_bonus.premium.total   * bonus_number,
        }

        // 厚生年金保険料
        let ep      : EmployeePension = new EmployeePension(income, monthly_income);
        let ep_bonus: EmployeePension = new EmployeePension(income, bonus_income_total, bonus_number);
        const ep_annually: DataSetForInsurancePremium = {
            you:     ep.premium.you     * 12 + ep_bonus.premium.you     * bonus_number,
            company: ep.premium.company * 12 + ep_bonus.premium.company * bonus_number,
            total:   ep.premium.total   * 12 + ep_bonus.premium.total   * bonus_number,
        }

        // 雇用保険料
        const ui: UnemplymentInsurance       = new UnemplymentInsurance(industry_type, monthly_income);
        const ui_bonus: UnemplymentInsurance = new UnemplymentInsurance(industry_type, bonus_income_once);
        const ui_annually: DataSetForInsurancePremium = {
            you:     ui.premium.you     * 12 + ui_bonus.premium.you     * bonus_number,
            company: ui.premium.company * 12 + ui_bonus.premium.company * bonus_number,
            total:   ui.premium.total   * 12 + ui_bonus.premium.total   * bonus_number,
        }

        // 社会保険料の天引き月額
        const premium_monthly: DataSetForInsurancePremium = sum(hi.premium, ep.premium, ui.premium);

        // 社会保険料の天引きボーナス額（1回あたり）
        const premium_bonus: DataSetForInsurancePremium = sum(hi_bonus.premium, ep_bonus.premium, ui_bonus.premium);

        // 社会保険料の天引き年額
        const premium_annually: DataSetForInsurancePremium = {
            you:     premium_monthly.you     * 12 + premium_bonus.you     * bonus_number,
            company: premium_monthly.company * 12 + premium_bonus.company * bonus_number,
            total:   premium_monthly.total   * 12 + premium_bonus.total   * bonus_number,
        }

        // 結果を出力（社会保険料）
        r.find('[hi-half]')           .text(add1000Separator(hi.premium.you));
        r.find('[hi-half-bonus]')     .text(add1000Separator(hi_bonus.premium.you * bonus_number));
        r.find('[hi-half-bonus-once]').text(add1000Separator(hi_bonus.premium.you));
        r.find('[hi-annual]')         .text(add1000Separator(hi_annually.you));

        r.find('[ep-half]')           .text(add1000Separator(ep.premium.you));
        r.find('[ep-half-bonus]')     .text(add1000Separator(ep_bonus.premium.you * bonus_number));
        r.find('[ep-half-bonus-once]').text(add1000Separator(ep_bonus.premium.you));
        r.find('[ep-annual]')         .text(add1000Separator(ep_annually.you));

        r.find('[ui-you]')            .text(add1000Separator(ui.premium.you));
        r.find('[ui-you-bonus]')      .text(add1000Separator(ui_bonus.premium.you * bonus_number));
        r.find('[ui-you-bonus-once]') .text(add1000Separator(ui_bonus.premium.you));
        r.find('[ui-annual]')         .text(add1000Separator(ui_annually.you));

        /* --------------------------------------------------
         * 所得税計算
         * --------------------------------------------------*/
        const it: IncomeTax = new IncomeTax(annual_income, premium_annually.you);

        // 結果を出力
        //r.find('[total-deduction]').text(add1000Separator(total_deduction));
        r.find('[taxiable-standard]').text(add1000Separator(it.taxable_standard_income));
        //r.find('[taxiable-income]').text(add1000Separator(taxable_income));
        r.find('[it]').text(add1000Separator(it.tax));

        /* --------------------------------------------------
         * 住民税計算
         * --------------------------------------------------*/
        const rt: ResidentTax = new ResidentTax(annual_income, premium_annually.you, resident_pref, resident_city);
        // 結果を出力
        r.find('[pref-tax]')       .text(add1000Separator(rt.tax.pref));
        r.find('[city-tax]')       .text(add1000Separator(rt.tax.city));
        r.find('[pref-capitation]').text(add1000Separator(rt.capitation.pref));
        r.find('[pref-income-tax]').text(add1000Separator(rt.income_tax.pref));
        r.find('[city-capitation]').text(add1000Separator(rt.capitation.city));
        r.find('[city-income-tax]').text(add1000Separator(rt.income_tax.city));
        r.find('[rt]')             .text(add1000Separator(rt.tax.total));
        r.find('[rt-monthly]')     .text(add1000Separator(rt.tax_monthly));
        r.find('[rt-monthly-june]').text(add1000Separator(rt.tax_monthly_june));

        /* --------------------------------------------------
         * 源泉徴収額
         * --------------------------------------------------*/
        // 月収の社会保険料等控除後金額
        const salary_without_premium: number = Math.max(monthly_income - premium_monthly.you, 0);

        // 月収の源泉徴収額（甲種）
        const salary_withholding: WithholdingSalary = new WithholdingSalary(salary_without_premium, false, 0);

        // ボーナスの社会保険料等控除後金額
        const bonus_without_premium: number = Math.max(bonus_income_once - premium_bonus.you, 0);

        // ボーナスの源泉徴収額
        const bonus_withholding: WithholdingBonus = new WithholdingBonus(bonus_without_premium, salary_without_premium, true, 0);

        // 結果を出力
        r.find('[it-withholding]')      .text(add1000Separator(salary_withholding.tax_value));
        r.find('[it-bonus-withholding]').text(add1000Separator(bonus_withholding.tax_value));

        /* --------------------------------------------------
         * 手取り給料
         * --------------------------------------------------*/
        // 実質の年収
        const substantial_annual_income: number = annual_income
                                                - premium_annually.you
                                                - it.tax;
                                                // - residents_tax;は2年目以降

        // 実質のボーナス（1回あたり）
        const substantial_bonus: number = bonus_income_once
                                        - premium_bonus.you
                                        - bonus_withholding.tax_value;

        // 実質毎月振り込まれる月給
        const substantial_income: number = monthly_income
                                         - premium_monthly.you
                                         - salary_withholding.tax_value;

        // 結果を出力
        r.find('[substantial-income]')                .text(add1000Separator(substantial_income));
        r.find('[substantial-income-minus-rt]')       .text(add1000Separator(substantial_income - rt.tax_monthly));
        r.find('[substantial-bonus]')                 .text(add1000Separator(substantial_bonus));
        r.find('[substantial-annual-income]')         .text(add1000Separator(substantial_annual_income));
        r.find('[substantial-annual-income-minus-rt]').text(add1000Separator(substantial_annual_income - rt.tax.total));

        /* --------------------------------------------------
         * シェアリンク生成
         * --------------------------------------------------*/
        // Twitterとテキストボックス
        const message_body: string = 'あなたの年収は「' + add1000Separator(annual_income) + '円」です。' + "\n"
                                   + 'が、社会保険料と所得税が引かれて「' + add1000Separator(substantial_annual_income) + '円」ぐらいになります。' + "\n"
                                   + '去年と同じ年収なら、住民税も引いた手取り年収は「' + add1000Separator(substantial_annual_income - rt.tax.total) + '円」ぐらいです。';
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
                                + 'さらに、この年収だと住民税が大体「' + add1000Separator(rt.tax.total) + '円」くらい課されるので、'
                                + '昨年度と年収が変わらなかったら、手取り年収はおおよそ「' + add1000Separator(substantial_annual_income - rt.tax.total) + '円」になります。'+ '%0D%0A'
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
        const datasets_income: Chart.ChartData = {
            labels: ['手取り月収', '健康保険料', '厚生年金保険料', '雇用保険料', '源泉徴収額'],
            datasets:[{
                backgroundColor: [
                    bar_color.income,
                    bar_color.hi,
                    bar_color.ep,
                    bar_color.ui,
                    bar_color.it,
                ],
                borderWidth: [0, 0, 0, 0, 0],
                data: [
                    substantial_income,
                    hi.premium.you,
                    ep.premium.you,
                    ui.premium.you,
                    salary_withholding.tax_value,
                ],
            }]
        };
        const ctx_income_canvas: HTMLCanvasElement = <HTMLCanvasElement> $('#graph-income-detail')[0];
        const ctx_income: CanvasRenderingContext2D = ctx_income_canvas.getContext('2d');
        ctx_income.canvas.height = 150;
        chart_detail_income = plotHorizontalBar(ctx_income, datasets_income);

        // グラフを描画（ボーナス）
        const datasets_bonus_income: Chart.ChartData = {
            labels: ['1回の手取りボーナス', '健康保険料', '厚生年金保険料', '雇用保険料', '源泉徴収額'],
            datasets:[{
                backgroundColor: [
                    bar_color.income,
                    bar_color.hi,
                    bar_color.ep,
                    bar_color.ui,
                    bar_color.it,
                ],
                borderWidth: [0, 0, 0, 0, 0],
                data: [
                    substantial_bonus,
                    hi_bonus.premium.you,
                    ep_bonus.premium.you,
                    ui_bonus.premium.you,
                    bonus_withholding.tax_value,
                ],
            }]
        };
        const ctx_bonus_canvas: HTMLCanvasElement = <HTMLCanvasElement> $('#graph-bonus-income-detail')[0];
        const ctx_bonus: CanvasRenderingContext2D = ctx_bonus_canvas.getContext('2d');
        ctx_bonus.canvas.height = 150;
        chart_detail_bonus = plotHorizontalBar(ctx_bonus, datasets_bonus_income);

        // グラフを描画（年収）
        const datasets_annual_income: Chart.ChartData = {
            labels: ['手取り年収', '健康保険料', '厚生年金保険料', '雇用保険料', '所得税額'],
            datasets:[{
                backgroundColor: [
                    bar_color.income,
                    bar_color.hi,
                    bar_color.ep,
                    bar_color.ui,
                    bar_color.it,
                ],
                borderWidth: [0, 0, 0, 0, 0],
                data: [
                    substantial_annual_income,
                    hi_annually.you,
                    ep_annually.you,
                    ui_annually.you,
                    it.tax,
                ],
            }]
        };
        const ctx_annual_canvas: HTMLCanvasElement = <HTMLCanvasElement> $('#graph-annual-income-detail')[0];
        const ctx_annual: CanvasRenderingContext2D = ctx_annual_canvas.getContext('2d');
        ctx_annual.canvas.height = 150;
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
            const additional_income: number = calcOverworkIncome(income, i, basic_work_hours, overwork_rate, extreme_overwork_rate);
            const monthly_income: number = income + additional_income;
            const annual_income: number = monthly_income * 12 + bonus_income_total;
            graph_overwork.total.push(annual_income);

            // 社会保険料
            const hi_over: HealthInsurance = new HealthInsurance(hi_rate, income, monthly_income);
            const ep_over: EmployeePension = new EmployeePension(income, monthly_income);
            const ui_over: UnemplymentInsurance = new UnemplymentInsurance(industry_type, monthly_income);

            const total_premium: number = (hi_over.premium.you + ep_over.premium.you + ui_over.premium.you) * 12 + premium_bonus.you * bonus_number;

            // 所得税
            const it: IncomeTax = new IncomeTax(annual_income - total_premium);

            // 実質的な手取り
            const substantial_income: number = annual_income - total_premium - it.tax;
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

        /* --------------------------------------------------
         * ふるさと納税（寄附金控除）
         * --------------------------------------------------*/
        // 課税所得金額 - 人的控除差調整額
        const income_tax_rate: Data.RateAndDeduction = Data.getIncomeTaxRate(rt.taxable_income - rt.diff_personal_deduction);
        // ふるさと納税の控除上限額を求める
        const frst_max_tax: number = 2000 + (rt.income_tax.total * 0.2) / (0.9 - income_tax_rate.rate);
        // 結果を出力
        $('[frst-tax]').text(add1000Separator(Math.floor(frst_max_tax)));
    });

    /* --------------------------------------------------
     * モーダル
     * --------------------------------------------------*/
    $('[detail-info]').on('click', function () {
        const name: string = $(this).attr('name');
        showModal(name);
    });

    function showModal (id='') {
        const msg = $('#modal-parts').find('[' + id + ']');
        const move_modal: any = $('#moveModal'); // modalプラグインを使うための苦肉の策
        move_modal.find('.title').text(msg.find('[title]').text());
        move_modal.find('.body').html(msg.find('[body]').html());
        move_modal.modal('show');
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
        const pref_name: string = Data.PREF_LIST[resident_pref];

        // 指定された都道府県か否かをチェック
        if (pref_name in Data.ORDINANCE_DESIGNATED_CITY_LIST) {
            const oedinance_designated_sities_in_pref: string[] = Data.ORDINANCE_DESIGNATED_CITY_LIST[pref_name];
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
    function calcOverworkIncome(
        basic_income,
        overwork_hours,
        basic_work_hours,
        overwork_rate,
        extreme_overwork_rate
    ) : number
    {
        const basic_income_per_hour = Math.round(basic_income / basic_work_hours);

        let overwork_monthly_income: number = 0;

        if (overwork_hours <= 60) {
            overwork_monthly_income = overwork_rate * overwork_hours * basic_income_per_hour;
        } else {
            overwork_monthly_income = (60 * overwork_rate + (overwork_hours - 60) * extreme_overwork_rate) * basic_income_per_hour;
        }

        return Math.round(overwork_monthly_income);
    }

    // 水平バーを作る
    function plotHorizontalBar(plotarea: CanvasRenderingContext2D, datasets: Chart.ChartData): Chart
    {
        const option: Chart.ChartConfiguration = {
            type: 'doughnut',
            data: datasets,
            options: {
                animation: {
                    animateRotate: false,
                },
                cutoutPercentage: 75,  //　円の中心からどのくらい切り取るか
                legend: {
                    display: false,
                },
            }
        };

        const chart = new Chart(plotarea, option);

        return chart;
    }
});
