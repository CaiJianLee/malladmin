import ajax from "@/api/ajax";

/**
 * 创建/编辑商品
 * @method
 * @param {Object} params 商品参数信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const createGoods = params =>
  ajax("/api/mall/manager/goods/info/put", params, "POST");

/**
 * 根据条件查询商品列表
 * @method
 * @param {Object} params 商品参数信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const getGoodsList = (params = {}) =>
  ajax(
    "/api/mall/manager/goods/info/list",
    {
      page: params.page,
      pageSize: params.pageSize,
      name: params.name,
      classId: params.classId,
      recommendType: params.recommendType
    },
    "POST"
  );
/**
 * 修改推荐商品排序
 * @method
 * @param {Object} params 商品参数信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const updateRecommendRank = (params = {}) =>
ajax(
  "/api/mall/manager/goods/updateRecommendRank",
  {
    goodsId: params.goodsId,
    rank: params.rank,
    recommendType: params.recommendType
  },
  "POST"
);
/**
 * 推荐商品
 * @method
 * @param {Object} params 商品参数信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const recommend = (params = {}) =>
  ajax(
    "/api/mall/manager/goods/recommend",
    {
      id: params.id,
      info: {
        recommendType: params.recommendType,
        begin_time: params.begin_time,
        end_time: params.end_time,
        rank: params.rank
      }
    },
    "POST"
  );
/**
 * 根据条件查询推荐商品列表
 * @method
 * @param {Object} params 商品参数信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const recommendList = (params = {}) =>
  ajax(
    "/api/mall/manager/goods/recommendList",
    {
      page: params.page,
      pageSize: params.pageSize,
      name: params.name,
      classId: params.classId,
      recommendType: params.recommendType
    },
    "POST"
  );
/**
 *
 * 根据条件查询商品详情
 * @method
 * @param {Object} params 商品参数信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const getGoodsInfo = (params = {}) =>
  ajax(
    "/api/mall/manager/goods/info/get",
    {
      id: params.id
    },
    "POST"
  );
/**
 *
 * 修改sku状态
 * @method
 * @param {String} params 商品参数信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const updateStatus = (params = {}) =>
  ajax(
    "/api/mall/manager/goods/sku/updateStatus",
    {
      id: params.id,
      status: params.status
    },
    "POST"
  );
/**
 * 修改商品状态
 * @method
 * @param {Object} params 商品参数信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const delGoods = (params = {}) =>
  ajax(
    "/api/mall/manager/goods/info/updateStatus",
    {
      id: params.id,
      status: params.status
    },
    "POST"
  );
/**
 * 修改商品排序
 * @method
 * @param {Object} params 商品参数信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const updateRank = (params = {}) =>
  ajax(
    "/api/mall/manager/goods/info/updateRank",
    {
      id: params.id,
      rank: params.rank
    },
    "POST"
  );
/**
 * 获取商品SKU列表
 * @method
 * @param {Object} params 商品参数信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const getSkus = (params = {}) =>
  ajax(
    "/api/mall/manager/goods/skus",
    {
      id: params.id
    },
    "POST"
  );
/**
 * 修改SKU库存
 * @method
 * @param {Object} params 商品参数信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const updateSkuStock = (params = {}) =>
  ajax(
    "/api/mall/manager/goods/updateSkuStock",
    {
      list: params.list
    },
    "POST"
  );
