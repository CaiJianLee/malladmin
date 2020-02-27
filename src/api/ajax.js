import axios from "axios";
import storageUtils from "@/commonutils/storageUtils";
import DonMessage from "@/commonutils/message";
import router from "@/router";
const Message = new DonMessage();
/**
 * 在接口前统一添加token
 */
axios.interceptors.request.use(
  function(config) {
    const storage_user = storageUtils.getUser();
    if (storage_user && config.data) {
      if (!config.data.token || JSON.stringify(config.data.token) === "{}") {
        config.data.token = storage_user.token;
      }
    }
    return config;
  },
  err => {
    return Promise.reject(err);
  }
);
/**
 * http请求状态码拦截
 */
axios.interceptors.response.use(
  response => {
    if (
      response.data &&
      response.data.code === parseInt(process.env.VUE_APP_BASE_ERR_TOKEN_CODE)
    ) {
      Message.warning("登录信息已过期，请重新登录");
      setTimeout(() => {
        router.replace({
          path: "/login"
        });
      }, 1000);
    }
    return Promise.resolve(response);
  },
  error => {
    const status = error.response;
    if (status) {
      switch (status.status) {
        case 400:
          error.message = "错误请求";
          break;
        case 401:
          error.message = "未授权，请重新登录";
          break;
        case 403:
          error.message = "拒绝访问";
          break;
        case 404:
          error.message = "请求错误,未找到该资源";
          break;
        case 405:
          error.message = "请求方法未允许";
          break;
        case 408:
          error.message = "请求超时";
          break;
        case 500:
          error.message = "服务器端出错，请检查网络";
          break;
        case 501:
          error.message = "网络未实现";
          break;
        case 502:
          error.message = "链接服务器失败，请检查网络";
          break;
        case 503:
          error.message = "服务不可用";
          break;
        case 504:
          error.message = "网络超时";
          break;
        case 505:
          error.message = "http版本不支持该请求";
          break;
        default:
          error.message = `连接错误${error.response.status}`;
      }
    } else {
      error.message = "请求失败服务器未响应，请检查网络";
    }
    return Promise.reject(error);
  }
);
/**
 * 二次封装axios
 * @param {String} url // 后端api地址（必填）
 * @param {Object} data // 传参（必填）
 * @param {String} type // 请求类型（必填）
 * @param {Object} responseType // 请求类型
 * @param {Number} timeout // 请求等待时间 (非必填)
 * @returns {Promise<unknown>} 返回异步请求状态
 */
export default function ajax(
  url,
  data = {},
  type = "GET",
  responseType = undefined,
  timeout = 200000
) {
  return new Promise((resolve, reject) => {
    let promise;
    axios.defaults.timeout = timeout; // 请求超时时间
    if (type === "GET") {
      promise = axios.get(url, {
        params: data
      });
    } else {
      promise = axios.post(url, data, responseType);
    }
    promise
      .then(
        response => {
          resolve(response.data);
        },
        error => {
          resolve({
            code: "error",
            msg: `${url}：${error.message}`
          });
        }
      )
      .catch(err => {
        Message.error(err.message);
        reject(err);
      });
  });
}
