/**
 *  Created by wangAlen on 2019-12-16 10:00
 */
import ajax from "@/api/ajax";
/**
 * 根据条件查询内容列表
 * @method
 * @param {Object} params 订单条件查询信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const getContentList = (params = {}) =>
  ajax(
    "/api/mall/manager/goods/content/list",
    {
      page: params.page,
      pageSize: params.pageSize,
      keyword: params.keyword,
      status: params.status,
      type: params.id
    },
    "POST"
  );
export const contentTypeList = [
  {
    name: "所有",
    id: 0
  },
  {
    name: "公司新闻",
    id: 1
  },
  {
    name: "行业新闻",
    id: 2
  },
  {
    name: "产品评测",
    id: 3
  },
  {
    name: "术语解释",
    id: 4
  }
];
/**
 * 变更内容状态
 * @method
 * @param {Object} params 内容参数信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const updateStatus = (params = {}) =>
  ajax(
    "/api/mall/manager/content/updateStatus",
    {
      id: params.id,
      status: params.status
    },
    "POST"
  );
