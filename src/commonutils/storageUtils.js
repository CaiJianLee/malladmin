//local 数据存储管理的工具模块
const USER_KEY = "user_key";
const CATEGORYID = "category-id";
const USER_NAME = "user_name";
const USER_PWD = "user_pwd";
export default {
  //保存用户
  saveUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  //读取
  getUser() {
    return JSON.parse(localStorage.getItem(USER_KEY) || "{}");
  },
  //删除
  removeUser() {
    localStorage.removeItem(USER_KEY);
  },
  //模型分类
  saveCategory(category) {
    localStorage.setItem(CATEGORYID, JSON.stringify(category));
  },
  getCategory() {
    return JSON.parse(localStorage.getItem(CATEGORYID) || "{}");
  },
  //记住密码
  saveUserName(userName) {
    localStorage.setItem(USER_NAME, userName);
  },
  getUserName() {
    return localStorage.getItem(USER_NAME);
  },
  savePwd(password) {
    localStorage.setItem(USER_PWD, password);
  },
  getPwd() {
    return localStorage.getItem(USER_PWD);
  },
  //删除用户名跟密码
  removeUserName() {
    localStorage.removeItem(USER_NAME);
  },
  removeUserPwd() {
    localStorage.removeItem(USER_PWD);
  }
};
