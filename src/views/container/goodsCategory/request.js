/**
 *  Created by wangAlen on 2019-11-14 10:33
 */
import ajax from "@/api/ajax";

const POST = "POST";

/**
 * 请求商品分类列表
 * @method
 * @param {Object} params
 * @return {Object} 返回值 包括code,msg,result
 */
export const getGoodsCategory = (params = {}) =>
  ajax(
    "/api/mall/manager/goods/class/list",
    {
      isAll: params.isAll,
      token: params.token,
      page: params.page,
      pageSize: params.pageSize,
      name: params.name,
      id: params.id
    },
    "POST"
  );
/**
 * 新增或修改商品
 * @method
 * @return {Object} 返回值 包括code,msg,result
 * @param {Object} params
 */
export const setGoodsCategory = (params = {}) =>
  ajax(
    "/api/mall/manager/goods/class/put",
    {
      item: {
        fatherId: params.fatherId,
        name: params.name,
        rank: params.rank,
        id: params.id
      }
    },
    "POST"
  );
/**
 * 删除商品分类
 * @method
 * @return {Object} 返回值 包括code,msg,result
 * @param {Object} params
 */
export const delGoodsCategory = (params = {}) =>
  ajax(
    "/api/mall/manager/goods/class/delete",
    {
      id: params.id
    },
    "POST"
  );
/**
 * 删除商品分类
 * @method
 * @return {Object} 返回值 包括code,msg,result
 * @param {Object} params
 */
export const updateStatus = (params = {}) =>
  ajax(
    "/api/mall/manager/goods/class/updateStatus",
    {
      id: params.id,
      status: params.status
    },
    "POST"
  );
