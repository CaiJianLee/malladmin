import ajax from "@/api/ajax";

/**
 * 创建/编辑内容
 * @method
 * @param {Object} params 内容参数信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const createContent = params =>
  ajax("/api/mall/manager/content/info/put", params, "POST");
/**
 * 根据条件查询内容列表
 * @method
 * @param {Object} params 内容参数信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const getGoodsList = (params = {}) =>
  ajax(
    "/api/mall/manager/goods/info/list",
    {
      page: params.page,
      pageSize: params.pageSize,
      name: params.name,
      classId: params.classId
    },
    "POST"
  );
/**
 *
 * 根据条件查询内容详情
 * @method
 * @param {Object} params 内容参数信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const getContentInfo = (params = {}) =>
  ajax(
    "/api/mall/manager/content/info/get",
    {
      id: params.id
    },
    "POST"
  );
