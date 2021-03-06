import Vue from "vue";
import VueI18n from "vue-i18n";

Vue.use(VueI18n);
// 引入各个语言配置文件
import zh from "./config/zh.js";
import en from "./config/en.js";
// 创建vue-i18n实例i18n
const i18n = new VueI18n({
  // 设置默认语言,读取浏览器语言
  locale: localStorage.getItem('locale') || navigator.language.substr(0, 2) || 'zh', // 语言标识
  // 添加多语言（每一个语言标示对应一个语言文件）
  messages: {
    zh,
    en
  }
})
// 暴露i18n
export default i18n;
