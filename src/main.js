import Vue from "vue";
import App from "./App.vue";
import router from "./router";
//引入i18n国际化
import i18n from "@/i18n/index.js";
import DonMessage from "@/commonutils/message";
import store from "./store";
import {interceptor} from '@/mixins/interceptor.js'
import ElementUI from "element-ui";
// import "element-ui/lib/theme-chalk/index.css";
import "@/assets/theme/index.css";
import "@/assets/css/main.scss";
import "@/assets/icon/iconfont.css"
Vue.config.productionTip = false;
Vue.use(ElementUI, { size: "small" }); // 全局注册并使用elementUi
Vue.prototype.$message = new DonMessage();
Vue.mixin(interceptor);
const USER_KEY = "user_key";

router.beforeEach((to, from, next) => {
  if (to.path !== "/login" && to.path.indexOf("aboutus") === -1) {
    let storage_user = window.localStorage.getItem(USER_KEY);
    if (!storage_user) {
      return next("/login");
    }
  }
  /*路由发生改变修改页面的title */
  if (to.meta.title) {
    document.title = to.meta.title;
  }
  next();
});

new Vue({
  router,
  store,
  i18n,
  render: h => h(App)
}).$mount("#app");
