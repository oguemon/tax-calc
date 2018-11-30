/*
用語解説
hi: 国民健康保険（health insurance）
ep: 厚生年金（employee pension）
ui: 雇用保険（unemployment insurance）
li: 介護保険（long-term care insurance）

it: 所得税（income tax）
*/
// 都道府県のJIS的並び
const PREF_LIST = new Array(
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
);

// 健康保険料率（平成30年度）
var HI_GENERAL_RATE_LIST = new Array(
  10.25, // 北海道
  9.96, // 青森県
  9.84, // 岩手県
  10.05, // 宮城県
  10.13, // 秋田県
  10.04, // 山形県
  9.79, // 福島県
  9.90, // 茨城県
  9.92, // 栃木県
  9.91, // 群馬県
  9.85, // 埼玉県
  9.89, // 千葉県
  9.90, // 東京都
  9.93, // 神奈川県
  9.63, // 新潟県
  9.81, // 富山県
  10.04, // 石川県
  9.98, // 福井県
  9.96, // 山梨県
  9.71, // 長野県
  9.91, // 岐阜県
  9.77, // 静岡県
  9.90, // 愛知県
  9.90, // 三重県
  9.84, // 滋賀県
  10.02, // 京都府
  10.17, // 大阪府
  10.10, // 兵庫県
  10.03, // 奈良県
  10.08, // 和歌山県
  9.96, // 鳥取県
  10.13, // 島根県
  10.15, // 岡山県
  10.00, // 広島県
  10.18, // 山口県
  10.28, // 徳島県
  10.23, // 香川県
  10.10, // 愛媛県
  10.14, // 高知県
  10.23, // 福岡県
  10.61, // 佐賀県
  10.20, // 長崎県
  10.13, // 熊本県
  10.26, // 大分県
  9.97, // 宮崎県
  10.11, // 鹿児島県
  9.93  // 沖縄県
);

// 介護保険料率（平成30年度）
const LI_RATE = 1.57;

// 厚生年金保険料率（平成30年度）
const EP_RATE = 18.3;

// 雇用保険料（平成30年度）
const UI_RATE_LIST = new Array(
  { // 一般の事業
    you:     3 / 1000,
    company: 6 / 1000
  },
  { // 農林水産・清酒製造の事業
    you:     4 / 1000,
    company: 7 / 1000
  },
  { // 建設の事業
    you:     4 / 1000,
    company: 8 / 1000
  }
);

