'use strict'

/*
用語解説
hi: 国民健康保険（health insurance）
ep: 厚生年金（employee pension）
ui: 雇用保険（unemployment insurance）
li: 介護保険（long-term care insurance）

it: 所得税（income tax）
rt: 住民税（resident tax）
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
  [10.31, 3.38, 6.93], // 北海道
  [ 9.85, 3.38, 6.47], // 青森県
  [ 9.62, 3.38, 6.24], // 岩手県
  [10.11, 3.38, 6.73], // 宮城県
  [10.01, 3.38, 6.63], // 秋田県
  [ 9.75, 3.38, 6.37], // 山形県
  [ 9.62, 3.38, 6.24], // 福島県
  [ 9.67, 3.38, 6.29], // 茨城県
  [ 9.82, 3.38, 6.44], // 栃木県
  [ 9.77, 3.38, 6.39], // 群馬県
  [ 9.76, 3.38, 6.38], // 埼玉県
  [ 9.79, 3.38, 6.41], // 千葉県
  [ 9.91, 3.38, 6.53], // 東京都
  [ 9.92, 3.38, 6.54], // 神奈川県
  [ 9.55, 3.38, 6.17], // 新潟県
  [ 9.65, 3.38, 6.27], // 富山県
  [ 9.88, 3.38, 6.50], // 石川県
  [ 9.94, 3.38, 6.56], // 福井県
  [ 9.89, 3.38, 6.51], // 山梨県
  [ 9.69, 3.38, 6.31], // 長野県
  [ 9.93, 3.38, 6.55], // 岐阜県
  [ 9.80, 3.38, 6.42], // 静岡県
  [10.03, 3.38, 6.65], // 愛知県
  [ 9.99, 3.38, 6.61], // 三重県
  [ 9.97, 3.38, 6.59], // 滋賀県
  [10.03, 3.38, 6.65], // 京都府
  [10.24, 3.38, 6.86], // 大阪府
  [10.16, 3.38, 6.78], // 兵庫県
  [10.02, 3.38, 6.64], // 奈良県
  [10.19, 3.38, 6.81], // 和歌山県
  [ 9.93, 3.38, 6.55], // 鳥取県
  [ 9.94, 3.38, 6.56], // 島根県
  [10.17, 3.38, 6.79], // 岡山県
  [ 9.97, 3.38, 6.59], // 広島県
  [10.36, 3.38, 6.98], // 山口県
  [10.47, 3.38, 7.09], // 徳島県
  [10.21, 3.38, 6.83], // 香川県
  [10.18, 3.38, 6.80], // 愛媛県
  [10.13, 3.38, 6.75], // 高知県
  [10.31, 3.38, 6.93], // 福岡県
  [10.78, 3.38, 7.40], // 佐賀県
  [10.41, 3.38, 7.03], // 長崎県
  [10.12, 3.38, 6.74], // 熊本県
  [10.25, 3.38, 6.87], // 大分県
  [10.09, 3.38, 6.71], // 宮崎県
  [10.31, 3.38, 6.93], // 鹿児島県
  [ 9.44, 3.38, 6.06], // 沖縄県
];

// 道府県民税率（令和7年度）政令市特例反映前
// 超過課税の状況: https://www.soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/149767_25.html
export const RT_RATE_LIST_PREF: number[][] = [
  // [均等割, 所得割],
  [1000, 0.04], // 北海道｜https://www.pref.hokkaido.lg.jp/sm/zim/tax/kozin_d02.html
  [1000, 0.04], // 青森県｜https://www.pref.aomori.lg.jp/soshiki/zaimu/zeimu/003_01koken.html
  [2000, 0.04], // 岩手県｜いわての森林づくり県民税分｜令和7年度まで｜https://www.pref.iwate.jp/kensei/zei/gaiyou/1011198.html
  [2200, 0.04], // 宮城県｜みやぎ環境税｜令和7年度まで｜https://www.pref.miyagi.jp/soshiki/zeimu/kankyouzei.html
  [1800, 0.04], // 秋田県｜秋田県水と緑の森づくり税｜令和9年度まで｜https://common3.pref.akita.lg.jp/mizumidori/main/index.html?id=1
  [2000, 0.04], // 山形県｜やまがた緑環境税｜令和7年度まで｜https://www.pref.yamagata.jp/020007/zei_shitsumon/midori/midori.html
  [2000, 0.04], // 福島県｜森林環境税｜令和7年度まで｜https://www.pref.fukushima.lg.jp/sec/01115d/zeimu23.html
  [2000, 0.04], // 茨城県｜森林湖沼環境税｜令和8年度まで｜https://www.pref.ibaraki.jp/somu/zeimu/kikaku/forest_lake_tax/index.html
  [1700, 0.04], // 栃木県｜とちぎの元気な森づくり県民税｜令和9年度まで｜https://www.pref.tochigi.lg.jp/d01/eco/shinrin/zenpan/1216274969214.html
  [1700, 0.04], // 群馬県｜ぐんま緑の県民税｜令和10年度まで｜https://www.pref.gunma.jp/page/7190.html
  [1000, 0.04], // 埼玉県｜https://www.pref.saitama.lg.jp/a0209/z-kurashiindex/z-2-1.html
  [1000, 0.04], // 千葉県｜https://www.pref.chiba.lg.jp/zeimu/aramashi/shurui/kojin-kenminzei/
  [1000, 0.04], // 東京都｜https://www.tax.metro.tokyo.lg.jp/kazei/life/kojin_ju
  [1300, 0.04025], // 神奈川県｜水源環境保全税（横浜は均等割3900円）｜令和8年度まで｜http://www.pref.kanagawa.jp/zei/kenzei/a001/b001/002.html
  [1000, 0.04], // 新潟県｜https://www.pref.niigata.lg.jp/sec/zeimu/kkenmin.html
  [1500, 0.04], // 富山県｜水と緑の森づくり税｜令和8年度まで｜https://www.pref.toyama.jp/1107/kurashi/seikatsu/zeikin/kenzei/m01-00/m01-03.html
  [1500, 0.04], // 石川県｜いしかわ森林環境税｜令和8年度まで｜https://www.pref.ishikawa.lg.jp/shinrin/kikaku/kankyouzei/gaiyou.html
  [1000, 0.04], // 福井県｜https://www.pref.fukui.lg.jp/doc/zeimu/type/kojinkenmin.html
  [1500, 0.04], // 山梨県｜森林環境税｜令和8年度まで｜https://www.pref.yamanashi.jp/zeimu/shinrinkankyouzei.html
  [1500, 0.04], // 長野県｜長野県森林づくり県民税｜令和9年度まで｜https://www.pref.nagano.lg.jp/rinsei/sangyo/ringyo/shisaku/kenminzei/shikumi.html
  [2000, 0.04], // 岐阜県｜清流の国ぎふ森林・環境税｜令和8年度まで｜https://www.pref.gifu.lg.jp/page/8460.html
  [1400, 0.04], // 静岡県｜森林（もり）づくり県民税｜令和7年度まで｜https://www.pref.shizuoka.jp/kurashikankyo/zei/kenzeigaiyou/1002336/1011807.html
  [1500, 0.04], // 愛知県｜あいち森と緑づくり税（名古屋は均等割2800円で所得割が5.7%）｜令和10年度まで｜https://www.pref.aichi.jp/soshiki/zeimu/0000025831.html
  [2000, 0.04], // 三重県｜みえ森と緑の県民税｜令和10年度まで｜https://www.pref.mie.lg.jp/SHINRIN/HP/mori/74681015390.htm
  [1800, 0.04], // 滋賀県｜琵琶湖森林づくり県民税｜令和7年度まで｜https://www.pref.shiga.lg.jp/ippan/kurashi/zeikin/20003.html
  [1600, 0.04], // 京都府｜豊かな森を育てる府民税｜令和7年度まで｜https://www.pref.kyoto.jp/shinrinhozen/tax.html
  [1300, 0.04], // 大阪府｜大阪府森林環境税｜令和9年度まで｜https://www.pref.osaka.lg.jp/o120030/midorikikaku/shinrinkankyozei/
  [1800, 0.04], // 兵庫県｜県民緑税（豊岡市は所得割が6.1%）｜令和12年度まで｜https://web.pref.hyogo.lg.jp/kk22/pa04_000000001.html
  [1500, 0.04], // 奈良県｜森林環境税｜令和7年度まで｜https://www.pref.nara.jp/12162.htm
  [1500, 0.04], // 和歌山県｜紀の国森づくり税｜令和8年度まで｜https://www.pref.wakayama.lg.jp/prefg/010500/kenzei/moridukuri/moridukuri.html
  [1500, 0.04], // 鳥取県｜豊かな森づくり協働税｜令和9年度まで｜https://www.pref.tottori.lg.jp/309149.htm
  [1500, 0.04], // 島根県｜水と緑の森づくり税｜令和11年度まで｜https://www.pref.shimane.lg.jp/life/zei/ken/syurui/mizuto/mizuto.html
  [1500, 0.04], // 岡山県｜おかやま森づくり県民税｜令和10年度まで｜https://www.pref.okayama.jp/page/360893.html
  [1500, 0.04], // 広島県｜ひろしまの森づくり県民税｜令和8年度まで｜https://www.pref.hiroshima.lg.jp/site/zei/1172044970276.html
  [1500, 0.04], // 山口県｜やまぐち森林づくり県民税｜令和11年度まで｜https://www.pref.yamaguchi.lg.jp/soshiki/5/12482.html
  [1000, 0.04], // 徳島県｜https://www.pref.tokushima.lg.jp/ippannokata/kurashi/zeikin/5012064/
  [1000, 0.04], // 香川県｜https://www.pref.kagawa.lg.jp/zeimu/zeikin/shiori.html
  [1700, 0.04], // 愛媛県｜森林環境税｜令和11年度まで｜https://www.pref.ehime.jp/h10500/1191372_1874.html
  [1500, 0.04], // 高知県｜森林環境税｜令和9年度まで｜https://www.pref.kochi.lg.jp/soshiki/030101/kankyouzei.html
  [1500, 0.04], // 福岡県｜森林環境税｜令和9年度まで｜https://www.pref.fukuoka.lg.jp/contents/keepforest-shikum.html
  [1500, 0.04], // 佐賀県｜森林環境税｜令和9年度まで｜https://www.pref.saga.lg.jp/kiji00332041/index.html
  [1500, 0.04], // 長崎県｜ながさき森林環境税｜令和8年度まで｜https://www.pref.nagasaki.jp/bunrui/kurashi-kankyo/zeikin/kenzeisyurui/sinrinkannkyou/
  [1500, 0.04], // 熊本県｜水とみどりの森づくり税｜令和11年度まで｜https://www.pref.kumamoto.jp/soshiki/16/1678.html
  [1500, 0.04], // 大分県｜森林環境税｜令和7年度まで｜https://www.pref.oita.jp/soshiki/16210/sinrinkankyouzei.html
  [1500, 0.04], // 宮崎県｜森林環境税｜令和7年度まで｜https://www.miyazaki-midori.org/m-mori-commission/tax.html
  [1500, 0.04], // 鹿児島県｜みんなの森づくり県民税｜令和11年度まで｜http://www.pref.kagoshima.jp/ab07/kurashi-kankyo/zei/shinzei/shinrin/sinrin.html
  [1000, 0.04]  // 沖縄県｜https://www.pref.okinawa.jp/kurashikankyo/zeikin/1003660/1003661.html
];

// 市町村民税率（令和7年度）政令市特例反映前
// 超過課税の状況: https://www.soumu.go.jp/main_sosiki/jichi_zeisei/czaisei/czaisei_seido/149767_25.html
export const RT_RATE_LIST_CITY = {
  // '都道府県名市町村名': [均等割, 所得割],
  '一般市町村': [3000, 0.06],
  // 神奈川県横浜市: https://www.city.yokohama.lg.jp/kurashi/koseki-zei-hoken/zeikin/y-shizei/kojin-shiminzei-kenminzei/kojin-shiminzei-shosai/kojin.html
  '神奈川県横浜市': [3900, 0.06],
  // 愛知県名古屋市: https://www.city.nagoya.jp/kurashi/category/392-4-2-3-0-0-0-0-0-0.html
  '愛知県名古屋市': [2800, 0.057],
  // 兵庫県神戸市: https://www.city.kobe.lg.jp/a83576/kurashi/tax/shikenminze/keisan/index.html
  '兵庫県神戸市': [3400, 0.06],
  // 兵庫県豊岡市: https://www.city.toyooka.lg.jp/kurashi/zeikin/shizei/1019701/1000790.html
  '兵庫県豊岡市': [3000, 0.061],
};

// 森林環境税（国税）
export const RT_FOREST_TAX= 1000;

// 介護保険料率（令和7年3月分以降）
// https://www.kyoukaikenpo.or.jp/g3/cat330/1995-298/
export const LI_RATE: number = 1.59;

// 厚生年金保険料率（平成29年9月を最後に引上げが終了）
// https://www.nenkin.go.jp/service/kounen/hokenryo-gaku/gakuhyo/
export const EP_RATE: number = 18.3;

// 雇用保険料（令和7年4月1日から令和8年3月31日）
// https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000108634.html
export const UI_RATE_LIST = [
  { // 一般の事業
    you:     5.5 / 1000,
    company: 9 / 1000,
  },
  { // 農林水産・清酒製造の事業
    you:     6.5 / 1000,
    company: 10 / 1000,
  },
  { // 建設の事業
    you:     6.5 / 1000,
    company: 11 / 1000,
  }
];

// 所得税率
export type RateAndDeduction = {
    rate: number,
    deduction: number
};

// 課税所得金額から税額を計算（平成27年分以降・令和7年分は変更なし）
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

// 賞与に対する源泉徴収税額の算出率の表（令和8年分・令和8年から「税額」が改正した）
// https://www.nta.go.jp/publication/pamph/gensen/zeigakuhyo2026/01.htm
// 甲
export const WITHHOLDING_BONUS_TABLE_KOU: number[][] = [
  // 税率, 前月の社会保険料等控除後の給与等の金額（扶養0人）（未満）, 1人, ..., 7人以上
  [  0.000,   82,  107,  143,  181,  218,  251,  284,  317],
  [  2.042,   94,  250,  276,  300,  300,  304,  343,  383],
  [  4.084,  260,  289,  321,  354,  387,  412,  438,  463],
  [  6.126,  309,  346,  377,  405,  431,  457,  483,  508],
  [  8.168,  342,  373,  400,  424,  452,  479,  505,  529],
  [ 10.210,  372,  401,  426,  452,  477,  503,  527,  552],
  [ 12.252,  402,  430,  457,  484,  509,  531,  553,  578],
  [ 14.294,  433,  463,  492,  517,  540,  564,  589,  614],
  [ 16.336,  520,  520,  525,  550,  577,  604,  630,  657],
  [ 18.378,  605,  621,  636,  651,  666,  681,  697,  708],
  [ 20.420,  684,  705,  728,  751,  774,  798,  821,  845],
  [ 22.462,  715,  739,  764,  788,  813,  838,  862,  887],
  [ 24.504,  752,  778,  804,  830,  856,  881,  907,  933],
  [ 26.546,  795,  821,  848,  876,  903,  930,  957,  985],
  [ 28.588,  854,  882,  910,  938,  966,  994, 1022, 1051],
  [ 30.630,  922,  952,  983, 1013, 1044, 1074, 1104, 1135],
  [ 32.672, 1318, 1342, 1367, 1391, 1416, 1440, 1464, 1489],
  [ 35.735, 1521, 1526, 1526, 1538, 1555, 1555, 1555, 1583],
  [ 38.798, 2621, 2645, 2669, 2693, 2716, 2740, 2764, 2788],
  [ 41.861, 3495, 3527, 3559, 3590, 3622, 3654, 3685, 3717],
  [ 45.945,     ,     ,     ,     ,     ,     ,     ,     ],
];
// 乙
export const WITHHOLDING_BONUS_TABLE_OTSU: number[][] = [
  // 税率, 前月の社会保険料等控除後の給与等の金額（未満）
  [ 10.210,  224],
  [ 20.420,  295],
  [ 30.630,  527],
  [ 38.798, 1118],
  [ 45.945,     ],
];
