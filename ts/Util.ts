'use strict';

  /* --------------------------------------------------
   * 整形
   * --------------------------------------------------*/
  // 数値にカンマを追加
  export function add1000Separator (value = 0) : string
  {
    // 3桁おきにカンマを置く
    return String(value).replace( /(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
  }

  // 指定した桁数を指定した形で丸める
  export function round (value = 0, width = 1, type = 'round') : number
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
