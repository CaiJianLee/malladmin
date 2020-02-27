import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    // 用户权限信息
    jurisdiction: {
      system: false,
      guest: false
    },
    aliyunOss: {},
    user: "asdsadsad",
    exprressList: []
  },
  getters: {
    systemAdmin(state) {
      return !!state.jurisdiction.system;
    },
    guestAdmin(state) {
      return !!state.jurisdiction.guest;
    }
  },
  mutations: {
    setAliyunOss(state, aliyunOss) {
      state.aliyunOss = aliyunOss;
    },
    setJurisdiction(state, user) {
      state.jurisdiction = user;
    },
    setExprressList(state, exprressList) {
      state.exprressList = exprressList;
    },
    setUser(state, user) {
      state.user = user;
    }
  },
  modules: {}
});
