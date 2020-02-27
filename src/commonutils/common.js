/**
 * 状态码
 * @returns {{tokenError: *, success: *}} 状态码对象
 */
export const STATUS_CODE = {
  success: parseInt(process.env.VUE_APP_BASE_SUCC_CODE), // 请求成功
  tokenError: parseInt(process.env.VUE_APP_BASE_ERR_TOKEN_CODE), // 请求失败token失效
  goodsDraft: parseInt(process.env.VUE_APP_CREATE_GOODS_DRAFT), // 存草稿
  goodsRelease: parseInt(process.env.VUE_APP_CREATE_GOODS_RELEASE), // 上架
  goodsUnRelease: parseInt(process.env.VUE_APP_CREATE_GOODS_UN_RELEASE), // 待上架
  goodsLower: parseInt(process.env.VUE_APP_CREATE_GOODS_LOWER), // 已下架
  goodsDelete: parseInt(process.env.VUE_APP_CREATE_GOODS_DELETE) // 已删除
};
/**
 * 成功的toast
 * @param { Object } this_
 * @param { String } str
 * @returns { void }
 */
export const successMsg = (this_, str) => {
  if (!this_) {
    return;
  }
  this_.$message.success(str);
};
/**
 * 警告的toast
 * @param { Object } this_
 * @param { String } str
 * @returns { void }
 */
export const warningMsg = (this_, str) => {
  if (!this_) {
    return;
  }
  this_.$message.warning(str);
};
/**
 * 错误的toast
 * @param { Object } this_
 * @param { String } str
 * @returns { void }
 */
export const errorMsg = (this_, str) => {
  if (!this_) {
    return;
  }
  this_.$message.error(str);
};
/**
 * 对象深拷贝
 * @param { Object } obj
 * @returns {Object} obj
 */
export const jsonDeepClone = obj => {
  if (obj && obj instanceof Object) {
    return JSON.parse(JSON.stringify(obj));
  } else {
    return obj;
  }
};
/**
 * 生成随机串
 * @returns {string} uuid
 */
export const uuid = () => {
  let s = [];
  let hexDigits = "0123456789abcdef";
  for (let i = 0; i < 36; i++) {
    s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
  }
  s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
  s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
  s[8] = s[13] = s[18] = s[23] = "-";

  return s.join("");
};
/**
 * 保留两位小数
 * @param {Number} x
 * @returns {string}
 */
export const toDecimal2 = x => {
  let f = parseFloat(x);
  if (isNaN(f)) {
    return false;
  }
  f = Math.round(x * 100) / 100;
  let s = f.toString();
  let rs = s.indexOf(".");
  if (rs < 0) {
    rs = s.length;
    s += ".";
  }
  while (s.length <= rs + 2) {
    s += "0";
  }
  return s;
};
/**
 * 分转元
 * @param {Number} fen
 * @returns {Number} num
 */
export const regFenToYuan = fen => {
  let num = fen;
  num = fen * 0.01;
  num += "";
  let reg =
    num.indexOf(".") > -1
      ? /(\d{1,3})(?=(?:\d{3})+\.)/g
      : /(\d{1,3})(?=(?:\d{3})+$)/g;
  num = num.replace(reg, "$1");
  num = toDecimal2(num);
  return num;
};
/**
 * 元转分
 * @param {Number} yuan
 * @param {Number} digit
 * @returns {Number} 分
 */
export const regYuanToFen = (yuan, digit = 100) => {
  let m = 0,
    s1 = yuan.toString(),
    s2 = digit.toString();
  try {
    m += s1.split(".")[1].length;
    // eslint-disable-next-line no-empty
  } catch (e) {}
  try {
    m += s2.split(".")[1].length;
    // eslint-disable-next-line no-empty
  } catch (e) {}
  return (
    (Number(s1.replace(".", "")) * Number(s2.replace(".", ""))) /
    Math.pow(10, m)
  );
};

//时间补零
function addZero(num) {
  if (parseInt(num) < 10) {
    num = "0" + num;
  }
  return num;
}

//时间格式化
export const dataFormat = time => {
  let date = new Date(time * 1000);
  time =
    date.getFullYear() +
    "-" +
    addZero(date.getMonth() + 1) +
    "-" +
    addZero(date.getDate()) +
    " " +
    addZero(date.getHours()) +
    ":" +
    addZero(date.getMinutes()) +
    ":" +
    addZero(date.getSeconds());
  return time;
};
