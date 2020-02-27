/**
 *  Created by wangAlen on 2019-12-17 11:32
 */
import { getAwsInfo } from "@/commonutils/request";
import store from "@/store/index";
import { STATUS_CODE } from "@/commonutils/common";
import DonMessage from "@/commonutils/message";
import Compressor from "compressorjs";
import OSS from "ali-oss";
const Message = new DonMessage();

/**
 * 图片压缩
 * @param {Object} file
 * @returns {Promise<unknown>} file
 * @constructor
 */
export const CompressorImg = file => {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality: 0.6,
      convertSize: 500 * 1024,
      success(result) {
        resolve(result);
      },
      error(err) {
        reject(err);
      }
    });
  });
};
/**
 * 阿里云接口构建oss对象
 * @param {String} fileType
 * @description 根据token请求oss接口，返回oss实列
 * @returns {Promise<{msg: (string|string|msg), status: string}>} Promise
 */
export const OssRequset = async (fileType = "image") => {
  const { token } = store.state.user;
  const response = await getAwsInfo(token);
  return new Promise((resolve, reject) => {
    if (response.code === STATUS_CODE.success) {
      const {
        accessKeyId,
        secretAccessKey,
        sessionToken
      } = response.result.aliyunInfo;
      if (!accessKeyId || !secretAccessKey || !sessionToken) {
        reject({
          status: "error",
          msg: "错误信息：系统返回accessKeyId/secretAccessKey/sessionToken为空"
        });
        Message.error("系统错误，请联系运维");
      }
      const endpoint = store.state.aliyunOss.endpoint;
      if (!endpoint || !store.state.aliyunOss) {
        reject({
          status: "error",
          msg: "错误信息：系统AliOSS => endpoint为空"
        });
        Message.warning("登录过期用户信息有误，请重新登录后重试！");
      }
      const bucket =
        fileType === "image"
          ? store.state.aliyunOss.imgBucket
          : store.state.aliyunOss.vdoBucket;
      resolve(
        new OSS({
          endpoint: endpoint, // 云账号AccessKey有所有API访问权限，建议遵循阿里云安全最佳实践，部署在服务端使用RAM子账号或STS，部署在客户端使用STS。
          accessKeyId: accessKeyId,
          accessKeySecret: secretAccessKey,
          bucket: bucket,
          stsToken: sessionToken
        })
      );
    } else if (response.code !== STATUS_CODE.tokenError) {
      reject({
        status: "error",
        msg: response.msg
      });
      Message.error(response.msg);
    } else {
      reject({
        status: "error",
        msg: "上传失败，网络错误"
      });
      Message.error("上传失败，身份信息错误");
    }
  });
};
