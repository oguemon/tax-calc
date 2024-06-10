'use strict'

/*
用語解説
hi: 国民健康保険（health insurance）
ep: 厚生年金（employee pension）
ui: 雇用保険（unemployment insurance）
li: 介護保険（long-term care insurance）

it: 所得税（income tax）
*/
// 都道府県のJIS的並び
export const PREF_LIST: string[] = [
  '北海道', // 0
  '青森県', // 1
  '岩手県', // 2
  '宮城県', // 3
  '秋田県', // 4
  '山形県', // 5
  '福島県', // 6
  '茨城県', // 7
  '栃木県', // 8
  '群馬県', // 9
  '埼玉県', // 10
  '千葉県', // 11
  '東京都', // 12
  '神奈川県', // 13
  '新潟県', // 14
  '富山県', // 15
  '石川県', // 16
  '福井県', // 17
  '山梨県', // 18
  '長野県', // 19
  '岐阜県', // 20
  '静岡県', // 21
  '愛知県', // 22
  '三重県', // 23
  '滋賀県', // 24
  '京都府', // 25
  '大阪府', // 26
  '兵庫県', // 27
  '奈良県', // 28
  '和歌山県', // 29
  '鳥取県', // 30
  '島根県', // 31
  '岡山県', // 32
  '広島県', // 33
  '山口県', // 34
  '徳島県', // 35
  '香川県', // 36
  '愛媛県', // 37
  '高知県', // 38
  '福岡県', // 39
  '佐賀県', // 40
  '長崎県', // 41
  '熊本県', // 42
  '大分県', // 43
  '宮崎県', // 44
  '鹿児島県', // 45
  '沖縄県'  // 46
];

// 政令指定都市の一覧
export const ORDINANCE_DESIGNATED_CITY_LIST = {
  '北海道': ['札幌市'],
  '宮城県': ['仙台市'],
  '埼玉県': ['さいたま市'],
  '千葉県': ['千葉市'],
  '神奈川県': ['横浜市', '川崎市', '相模原市'],
  '新潟県': ['新潟市'],
  '静岡県': ['静岡市', '浜松市'],
  '愛知県': ['名古屋市'],
  '京都府': ['京都市'],
  '大阪府': ['大阪市', '堺市'],
  '兵庫県': ['神戸市'],
  '岡山県': ['岡山市'],
  '広島県': ['広島市'],
  '福岡県': ['福岡市', '北九州市'],
  '熊本県': ['熊本市']
};

// 健康保険と厚生年金保険の加入下限となる月あたり基本給額
export const INSURANCE_MIN_INCOME: number = 88000;

// 健康保険の標準報酬等級と月額
// https://www.kyoukaikenpo.or.jp/g3/cat320/sb3160/sbb3165/1962-231/
export const HI_STANDARD_INCOME = [
  // 等級, 標準報酬月額, 報酬月額（未満）
  // 報酬がNumber.MAX_SAFE_INTEGERである時の挙動を想定する必要あり
  {rank:  1, monthly_income:   58000, less_than_income:   63000},
  {rank:  2, monthly_income:   68000, less_than_income:   73000},
  {rank:  3, monthly_income:   78000, less_than_income:   83000},
  {rank:  4, monthly_income:   88000, less_than_income:   93000},
  {rank:  5, monthly_income:   98000, less_than_income:  101000},
  {rank:  6, monthly_income:  104000, less_than_income:  107000},
  {rank:  7, monthly_income:  110000, less_than_income:  114000},
  {rank:  8, monthly_income:  118000, less_than_income:  122000},
  {rank:  9, monthly_income:  126000, less_than_income:  130000},
  {rank: 10, monthly_income:  134000, less_than_income:  138000},
  {rank: 11, monthly_income:  142000, less_than_income:  146000},
  {rank: 12, monthly_income:  150000, less_than_income:  155000},
  {rank: 13, monthly_income:  160000, less_than_income:  165000},
  {rank: 14, monthly_income:  170000, less_than_income:  175000},
  {rank: 15, monthly_income:  180000, less_than_income:  185000},
  {rank: 16, monthly_income:  190000, less_than_income:  195000},
  {rank: 17, monthly_income:  200000, less_than_income:  210000},
  {rank: 18, monthly_income:  220000, less_than_income:  230000},
  {rank: 19, monthly_income:  240000, less_than_income:  250000},
  {rank: 20, monthly_income:  260000, less_than_income:  270000},
  {rank: 21, monthly_income:  280000, less_than_income:  290000},
  {rank: 22, monthly_income:  300000, less_than_income:  310000},
  {rank: 23, monthly_income:  320000, less_than_income:  330000},
  {rank: 24, monthly_income:  340000, less_than_income:  350000},
  {rank: 25, monthly_income:  360000, less_than_income:  370000},
  {rank: 26, monthly_income:  380000, less_than_income:  395000},
  {rank: 27, monthly_income:  410000, less_than_income:  425000},
  {rank: 28, monthly_income:  440000, less_than_income:  455000},
  {rank: 29, monthly_income:  470000, less_than_income:  485000},
  {rank: 30, monthly_income:  500000, less_than_income:  515000},
  {rank: 31, monthly_income:  530000, less_than_income:  545000},
  {rank: 32, monthly_income:  560000, less_than_income:  575000},
  {rank: 33, monthly_income:  590000, less_than_income:  605000},
  {rank: 34, monthly_income:  620000, less_than_income:  635000},
  {rank: 35, monthly_income:  650000, less_than_income:  665000},
  {rank: 36, monthly_income:  680000, less_than_income:  695000},
  {rank: 37, monthly_income:  710000, less_than_income:  730000},
  {rank: 38, monthly_income:  750000, less_than_income:  770000},
  {rank: 39, monthly_income:  790000, less_than_income:  810000},
  {rank: 40, monthly_income:  830000, less_than_income:  855000},
  {rank: 41, monthly_income:  880000, less_than_income:  905000},
  {rank: 42, monthly_income:  930000, less_than_income:  955000},
  {rank: 43, monthly_income:  980000, less_than_income: 1005000},
  {rank: 44, monthly_income: 1030000, less_than_income: 1055000},
  {rank: 45, monthly_income: 1090000, less_than_income: 1115000},
  {rank: 46, monthly_income: 1150000, less_than_income: 1175000},
  {rank: 47, monthly_income: 1210000, less_than_income: 1235000},
  {rank: 48, monthly_income: 1270000, less_than_income: 1295000},
  {rank: 49, monthly_income: 1330000, less_than_income: 1355000},
  {rank: 50, monthly_income: 1390000, less_than_income: Number.MAX_SAFE_INTEGER},
]

// 健康保険の標準報酬等級と月額
// https://www.nenkin.go.jp/service/kounen/hokenryo-gaku/gakuhyo/
export const EP_STANDARD_INCOME = [
  // 等級, 標準報酬月額, 報酬月額（未満）
  // 最高等級のless_than_incomeは仮値
  // 報酬がNumber.MAX_SAFE_INTEGERである時の挙動を想定する必要あり
  {rank:  1, monthly_income:   88000, less_than_income:   93000},
  {rank:  2, monthly_income:   98000, less_than_income:  101000},
  {rank:  3, monthly_income:  104000, less_than_income:  107000},
  {rank:  4, monthly_income:  110000, less_than_income:  114000},
  {rank:  5, monthly_income:  118000, less_than_income:  122000},
  {rank:  6, monthly_income:  126000, less_than_income:  130000},
  {rank:  7, monthly_income:  134000, less_than_income:  138000},
  {rank:  8, monthly_income:  142000, less_than_income:  146000},
  {rank:  9, monthly_income:  150000, less_than_income:  155000},
  {rank: 10, monthly_income:  160000, less_than_income:  165000},
  {rank: 11, monthly_income:  170000, less_than_income:  175000},
  {rank: 12, monthly_income:  180000, less_than_income:  185000},
  {rank: 13, monthly_income:  190000, less_than_income:  195000},
  {rank: 14, monthly_income:  200000, less_than_income:  210000},
  {rank: 15, monthly_income:  220000, less_than_income:  230000},
  {rank: 16, monthly_income:  240000, less_than_income:  250000},
  {rank: 17, monthly_income:  260000, less_than_income:  270000},
  {rank: 18, monthly_income:  280000, less_than_income:  290000},
  {rank: 19, monthly_income:  300000, less_than_income:  310000},
  {rank: 20, monthly_income:  320000, less_than_income:  330000},
  {rank: 21, monthly_income:  340000, less_than_income:  350000},
  {rank: 22, monthly_income:  360000, less_than_income:  370000},
  {rank: 23, monthly_income:  380000, less_than_income:  395000},
  {rank: 24, monthly_income:  410000, less_than_income:  425000},
  {rank: 25, monthly_income:  440000, less_than_income:  455000},
  {rank: 26, monthly_income:  470000, less_than_income:  485000},
  {rank: 27, monthly_income:  500000, less_than_income:  515000},
  {rank: 28, monthly_income:  530000, less_than_income:  545000},
  {rank: 29, monthly_income:  560000, less_than_income:  575000},
  {rank: 30, monthly_income:  590000, less_than_income:  605000},
  {rank: 31, monthly_income:  620000, less_than_income:  635000},
  {rank: 32, monthly_income:  650000, less_than_income:  Number.MAX_SAFE_INTEGER},
]

// 健康保険料率（令和6年3月分以降）
// https://www.kyoukaikenpo.or.jp/g3/cat330/1936-295/
export const HI_GENERAL_RATE_LIST: number[][] = [
  // [一般保険料率, 特定保険料率, 基本保険料率],
  [10.21, 3.42, 6.79], // 北海道
  [ 9.49, 3.42, 6.07], // 青森県
  [ 9.63, 3.42, 6.21], // 岩手県
  [10.01, 3.42, 6.59], // 宮城県
  [ 9.85, 3.42, 6.43], // 秋田県
  [ 9.84, 3.42, 6.42], // 山形県
  [ 9.59, 3.42, 6.17], // 福島県
  [ 9.60, 3.42, 6.24], // 茨城県
  [ 9.79, 3.42, 6.37], // 栃木県
  [ 9.81, 3.42, 6.39], // 群馬県
  [ 9.78, 3.42, 6.36], // 埼玉県
  [ 9.70, 3.42, 6.35], // 千葉県
  [ 9.98, 3.42, 6.56], // 東京都
  [10.02, 3.42, 6.60], // 神奈川県
  [ 9.35, 3.42, 5.93], // 新潟県
  [ 9.62, 3.42, 6.20], // 富山県
  [ 9.94, 3.42, 6.52], // 石川県
  [10.07, 3.42, 6.65], // 福井県
  [ 9.94, 3.42, 6.52], // 山梨県
  [ 9.50, 3.42, 6.13], // 長野県
  [ 9.91, 3.42, 6.49], // 岐阜県
  [ 9.85, 3.42, 6.43], // 静岡県
  [10.02, 3.42, 6.60], // 愛知県
  [ 9.94, 3.42, 6.52], // 三重県
  [ 9.89, 3.42, 6.47], // 滋賀県
  [10.13, 3.42, 6.71], // 京都府
  [10.34, 3.42, 6.92], // 大阪府
  [10.18, 3.42, 6.76], // 兵庫県
  [10.20, 3.42, 6.80], // 奈良県
  [10.00, 3.42, 6.58], // 和歌山県
  [ 9.68, 3.42, 6.26], // 鳥取県
  [ 9.92, 3.42, 6.50], // 島根県
  [10.02, 3.42, 6.60], // 岡山県
  [ 9.95, 3.42, 6.53], // 広島県
  [10.20, 3.42, 6.78], // 山口県
  [10.19, 3.42, 6.70], // 徳島県
  [10.30, 3.42, 6.91], // 香川県
  [10.03, 3.42, 6.61], // 愛媛県
  [ 9.89, 3.42, 6.47], // 高知県
  [10.35, 3.42, 6.93], // 福岡県
  [10.42, 3.42, 7.00], // 佐賀県
  [10.17, 3.42, 6.75], // 長崎県
  [10.30, 3.42, 6.80], // 熊本県
  [10.25, 3.42, 6.83], // 大分県
  [ 9.85, 3.42, 6.43], // 宮崎県
  [10.13, 3.42, 6.71], // 鹿児島県
  [ 9.52, 3.42, 6.10], // 沖縄県
];

// 道府県民税率（令和5年度）政令市特例反映前
// 超過課税の状況: https://www.soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/149767_25.html
export const RT_RATE_LIST_PREF: number[][] = [
  // [均等割, 所得割],
  [1500, 0.04], // 北海道
  [1500, 0.04], // 青森県
  [2500, 0.04], // 岩手県｜いわての森林づくり県民税分｜令和7年度まで｜https://www.pref.iwate.jp/kensei/zei/gaiyou/1011198.html#:~:text=%E7%B4%8D%E3%82%81%E3%82%8B%E9%A1%8D-,%E5%80%8B%E4%BA%BA,%E3%81%AF%E5%B9%B42%2C500%E5%86%86%E3%81%A7%E3%81%99%E3%80%82
  [2700, 0.04], // 宮城県｜みやぎ環境税｜令和7年度まで｜https://www.pref.miyagi.jp/soshiki/zeimu/kankyouzei.html
  [2300, 0.04], // 秋田県｜秋田県水と緑の森づくり税｜令和9年度まで｜https://common3.pref.akita.lg.jp/mizumidori/main/index.html?id=1
  [2500, 0.04], // 山形県｜やまがた緑環境税｜令和7年度まで｜https://www.pref.yamagata.jp/020007/zei_shitsumon/midori/midori.html
  [2500, 0.04], // 福島県｜森林環境税｜令和7年度まで｜https://www.pref.fukushima.lg.jp/sec/01115d/zeimu23.html
  [2500, 0.04], // 茨城県｜森林湖沼環境税｜令和8年度まで｜https://www.pref.ibaraki.jp/somu/zeimu/kikaku/forest_lake_tax/index.html
  [2200, 0.04], // 栃木県｜とちぎの元気な森づくり県民税｜令和9年度まで｜https://www.pref.tochigi.lg.jp/d01/eco/shinrin/zenpan/1216274969214.html
  [2200, 0.04], // 群馬県｜ぐんま緑の県民税｜令和5年度まで｜https://www.pref.gunma.jp/page/7190.html
  [1500, 0.04], // 埼玉県
  [1500, 0.04], // 千葉県
  [1500, 0.04], // 東京都
  [1800, 0.04025], // 神奈川県｜水源環境保全税（横浜は均等割4400円）｜令和8年度まで｜http://www.pref.kanagawa.jp/zei/kenzei/a001/b001/002.html
  [1500, 0.04], // 新潟県
  [2000, 0.04], // 富山県｜水と緑の森づくり税｜令和8年度まで｜https://www.pref.toyama.jp/1107/kurashi/seikatsu/zeikin/kenzei/m01-00/m01-03.html
  [2000, 0.04], // 石川県｜いしかわ森林環境税｜令和8年度まで｜https://www.pref.ishikawa.lg.jp/shinrin/kikaku/kankyouzei/gaiyou.html
  [1500, 0.04], // 福井県
  [2000, 0.04], // 山梨県｜森林環境税｜令和8年度まで｜https://www.pref.yamanashi.jp/zeimu/shinrinkankyouzei.html
  [2000, 0.04], // 長野県｜長野県森林づくり県民税｜令和9年度まで｜https://www.pref.nagano.lg.jp/rinsei/sangyo/ringyo/shisaku/kenminzei/shikumi.html
  [2500, 0.04], // 岐阜県｜清流の国ぎふ森林・環境税｜令和8年度まで｜https://www.pref.gifu.lg.jp/page/8460.html
  [1900, 0.04], // 静岡県｜森林（もり）づくり県民税｜令和7年度まで｜https://www.pref.shizuoka.jp/kurashikankyo/zei/kenzeigaiyou/1002336/1011807.html
  [2000, 0.04], // 愛知県｜あいち森と緑づくり税（名古屋は均等割3300円で所得割が5.7%）｜令和5年度まで｜https://www.pref.aichi.jp/soshiki/zeimu/0000025831.html
  [2500, 0.04], // 三重県｜みえ森と緑の県民税｜令和5年度まで｜https://www.pref.mie.lg.jp/SHINRIN/HP/mori/74681015390.htm
  [2300, 0.04], // 滋賀県｜琵琶湖森林づくり県民税｜令和7年度まで｜https://www.pref.shiga.lg.jp/ippan/kurashi/zeikin/20003.html
  [2100, 0.04], // 京都府｜豊かな森を育てる府民税｜令和7年度まで｜https://www.pref.kyoto.jp/shinrinhozen/tax.html
  [1800, 0.04], // 大阪府｜森林環境税｜令和5年度まで｜https://www.pref.osaka.lg.jp/midorikikaku/shinrinkankyozei/
  [2300, 0.04], // 兵庫県｜県民緑税（豊岡市は所得割が6.1%）｜令和7年度まで｜https://web.pref.hyogo.lg.jp/kk22/pa04_000000001.html
  [2000, 0.04], // 奈良県｜森林環境税｜令和7年度まで｜https://www.pref.nara.jp/12162.htm
  [2000, 0.04], // 和歌山県｜紀の国森づくり税｜令和8年度まで｜https://www.pref.wakayama.lg.jp/prefg/010500/kenzei/moridukuri/moridukuri.html
  [2000, 0.04], // 鳥取県｜豊かな森づくり協働税｜令和9年度まで｜https://www.pref.tottori.lg.jp/309149.htm
  [2000, 0.04], // 島根県｜水と緑の森づくり税｜令和6年度まで｜https://www.pref.shimane.lg.jp/life/zei/ken/syurui/mizuto/mizuto.html
  [2000, 0.04], // 岡山県｜おかやま森づくり県民税｜令和5年度まで｜https://www.pref.okayama.jp/page/360893.html
  [2000, 0.04], // 広島県｜ひろしまの森づくり県民税｜令和8年度まで｜https://www.pref.hiroshima.lg.jp/site/zei/1172044970276.html
  [2000, 0.04], // 山口県｜やまぐち森林づくり県民税｜令和6年度まで｜https://www.pref.yamaguchi.lg.jp/soshiki/5/12482.html
  [1500, 0.04], // 徳島県
  [1500, 0.04], // 香川県
  [2200, 0.04], // 愛媛県｜森林環境税｜令和6年度まで｜https://www.pref.ehime.jp/h10500/1191372_1874.html
  [2000, 0.04], // 高知県｜森林環境税｜令和9年度まで｜https://www.pref.kochi.lg.jp/soshiki/030101/kankyouzei.html
  [2000, 0.04], // 福岡県｜森林環境税｜令和9年度まで｜https://www.pref.fukuoka.lg.jp/contents/keepforest-shikum.html
  [2000, 0.04], // 佐賀県｜森林環境税｜令和9年度まで｜https://www.pref.saga.lg.jp/kiji00332041/index.html
  [2000, 0.04], // 長崎県｜ながさき森林環境税｜令和8年度まで｜https://www.pref.nagasaki.jp/bunrui/kurashi-kankyo/zeikin/kenzeisyurui/sinrinkannkyou/
  [2000, 0.04], // 熊本県｜水とみどりの森づくり税｜令和6年度まで｜https://www.pref.kumamoto.jp/soshiki/16/1678.html
  [2000, 0.04], // 大分県｜森林環境税｜令和7年度まで｜https://www.pref.oita.jp/soshiki/16210/sinrinkankyouzei.html
  [2000, 0.04], // 宮崎県｜森林環境税｜令和7年度まで｜https://www.miyazaki-midori.org/m-mori-commission/tax.html
  [2000, 0.04], // 鹿児島県｜みんなの森づくり県民税｜令和6年度まで｜http://www.pref.kagoshima.jp/ab07/kurashi-kankyo/zei/shinzei/shinrin/sinrin.html
  [1500, 0.04]  // 沖縄県
];

// 市町村民税率（令和5年度）政令市特例反映前
// 超過課税の状況: https://www.soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/149767_25.html
export const RT_RATE_LIST_CITY = {
  // '都道府県名市町村名': [均等割, 所得割],
  '一般市町村': [3500, 0.06],
  // 神奈川県横浜市: https://www.city.yokohama.lg.jp/kurashi/koseki-zei-hoken/zeikin/y-shizei/kojin-shiminzei-kenminzei/kojin-shiminzei-shosai/kojin.html
  '神奈川県横浜市': [4400, 0.06],
  // 愛知県名古屋市: https://www.city.nagoya.jp/kurashi/category/392-4-2-3-0-0-0-0-0-0.html
  '愛知県名古屋市': [3300, 0.057],
  // 大阪府田尻町: https://www.town.tajiri.osaka.jp/kakukanojoho/jumimbu/zeimuka/2_1/1019.html
  '大阪府田尻町': [3200, 0.054], // 令和5年度まで
  // 兵庫県神戸市: https://www.city.kobe.lg.jp/a83576/kurashi/tax/shikenminze/keisan/index.html
  '兵庫県神戸市': [3900, 0.06],
  // 兵庫県豊岡市: https://www.city.toyooka.lg.jp/kurashi/zeikin/shizei/1019701/1000790.html
  '兵庫県豊岡市': [3500, 0.061],
};

// 介護保険料率（令和6年3月分以降）
// https://www.kyoukaikenpo.or.jp/g3/cat330/1995-298/
export const LI_RATE: number = 1.60;

// 厚生年金保険料率（平成29年9月を最後に引上げが終了）
// https://www.nenkin.go.jp/service/kounen/hokenryo-gaku/gakuhyo/
export const EP_RATE: number = 18.3;

// 雇用保険料（令和6年4月1日から令和7年3月31日）
// https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000108634.html
export const UI_RATE_LIST = [
  { // 一般の事業
    you:     6 / 1000,
    company: 9.5 / 1000,
  },
  { // 農林水産・清酒製造の事業
    you:     7 / 1000,
    company: 10.5 / 1000,
  },
  { // 建設の事業
    you:     7 / 1000,
    company: 11.5 / 1000,
  }
];

// 所得税率
export type RateAndDeduction = {
    rate: number,
    deduction: number
};

// 課税所得金額から税額を計算（平成27年分以降・令和5年分は変更なし）
// https://www.nta.go.jp/taxes/shiraberu/taxanswer/shotoku/2260.htm
export function getIncomeTaxRate (taxable_income = 0): RateAndDeduction
{
  if (taxable_income <=  195_0000) return {rate: 0.05, deduction:       0}
  if (taxable_income <=  330_0000) return {rate: 0.10, deduction:   97500}
  if (taxable_income <=  695_0000) return {rate: 0.20, deduction:  427500}
  if (taxable_income <=  900_0000) return {rate: 0.23, deduction:  636000}
  if (taxable_income <= 1800_0000) return {rate: 0.33, deduction: 1536000}
  if (taxable_income <= 4000_0000) return {rate: 0.40, deduction: 2796000}

  // 4000万円超
  return {rate: 0.45, deduction: 4796000}
}

// 賞与に対する源泉徴収税額の算出率の表（令和5年分・令和2年1月以後「税額」は改正なし）
// https://www.nta.go.jp/publication/pamph/gensen/zeigakuhyo2023/02.htm
// 甲
export const WITHHOLDING_BONUS_TABLE_KOU: number[][] = [
  // 税率, 前月の社会保険料等控除後の給与等の金額（扶養0人）（未満）, 1人, ..., 7人以上
  [  0.000,   68,   94,  133,  171,  210,  243,  275,  308],
  [  2.042,   79,  243,  269,  295,  300,  300,  333,  372],
  [  4.084,  252,  282,  312,  345,  378,  406,  431,  456],
  [  6.126,  300,  338,  369,  398,  424,  450,  476,  502],
  [  8.168,  334,  365,  393,  417,  444,  472,  499,  523],
  [ 10.210,  363,  394,  420,  445,  470,  496,  521,  545],
  [ 12.252,  395,  422,  450,  477,  503,  525,  547,  571],
  [ 14.294,  426,  455,  484,  510,  534,  557,  582,  607],
  [ 16.336,  520,  520,  520,  544,  570,  597,  623,  650],
  [ 18.378,  601,  617,  632,  647,  662,  677,  693,  708],
  [ 20.420,  678,  699,  721,  745,  768,  792,  815,  838],
  [ 22.462,  708,  733,  757,  782,  806,  831,  856,  880],
  [ 24.504,  745,  771,  797,  823,  849,  875,  900,  926],
  [ 26.546,  788,  814,  841,  868,  896,  923,  950,  978],
  [ 28.588,  846,  874,  902,  931,  959,  987, 1015, 1043],
  [ 30.630,  914,  944,  975, 1005, 1036, 1066, 1096, 1127],
  [ 32.672, 1312, 1336, 1360, 1385, 1409, 1434, 1458, 1482],
  [ 35.735, 1521, 1526, 1526, 1538, 1555, 1555, 1555, 1583],
  [ 38.798, 2621, 2645, 2669, 2693, 2716, 2740, 2764, 2788],
  [ 41.861, 3495, 3527, 3559, 3590, 3622, 3654, 3685, 3717],
  [ 45.945,     ,     ,     ,     ,     ,     ,     ,     ],
];
// 乙
export const WITHHOLDING_BONUS_TABLE_OTSU: number[][] = [
  // 税率, 前月の社会保険料等控除後の給与等の金額（未満）
  [ 10.210,  222],
  [ 20.420,  293],
  [ 30.630,  524],
  [ 38.798, 1118],
  [ 45.945,     ],
];
