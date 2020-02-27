/**
 *  Created by wangAlen on 2019-12-17 10:29
 */
import ajax from "@/api/ajax";
/**
 * 根据条件查询内容列表
 * @method
 * @param {Object} params 订单条件查询信息
 * @return {Object} 返回值 包括code,msg,
 */
export const getBannerList = (params = {}) =>
  ajax(
    "/api/mall/manager/advance/list",
    {
      page: params.page,
      pageSize: params.pageSize,
      name: params.name,
      end: params.end,
      begin: params.begin,
      status: params.status,
      position: params.position
    },
    "POST"
  );
/**
 * 根据条件查询内容列表
 * @method
 * @param {Object} params 订单条件查询信息
 * @return {Object} 返回值 包括code,msg
 */
export const createdBanner = (params = {}) =>
  ajax(
    "/api/mall/manager/advance/info/put",
    {
      advance: {
        picture: params.picture,
        position: params.position,
        name: params.name,
        linkType: params.linkType,
        isJump: params.isJump,
        keepTime: params.keepTime,
        startDate: params.startDate,
        endDate: params.endDate,
        id: params.id,
        video: params.video,
        linkUrl: params.linkUrl
      }
    },
    "POST"
  );
/**
 * 根据id获取广告详情
 * @method
 * @param {Object} params
 * @return {Object} 返回值 包括code,msg
 */
export const getBannerInfo = (params = {}) =>
  ajax(
    "/api/mall/manager/advance/get",
    {
      id: params.id
    },
    "POST"
  );
/**
 * 修改广告状态
 * @method
 * @param {Object} params
 * @return {Object} 返回值 包括code,msg
 */
export const updateBanner = (params = {}) =>
  ajax(
    "/api/mall/manager/advance/updateStatus",
    {
      id: params.id,
      status: params.status
    },
    "POST"
  );
