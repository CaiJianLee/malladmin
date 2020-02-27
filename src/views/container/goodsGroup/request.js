import ajax from "@/api/ajax";

/**
 * 获取商品标签列表
 * @method
 * @param {Number} page
 * @param {Number} pageSize
 * @param {Boolen} isAll
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqGetGoodsGroup = (page, pageSize, isAll) => ajax(
  '/api/mall/manager/goods/group/list',
  {page, pageSize, isAll},
  'POST'
);


/**
 * 新增或修改商品标签
 * @method
 * @param {Number} id 0-新增 其他-修改
 * @param {String} name
 * @param {Number} rank
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqEditGroup = ({id, name,rank}) => ajax(
  '/api/mall/manager/goods/group/put',
  {id, name,rank},
  'POST'
);

/**
 * 删除商品标签
 * @method
 * @param {Number} id
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqDeleteGroup = (id) => ajax(
  '/api/mall/manager/goods/group/delete',
  {id},
  'POST'
);

/**
 * 获取标签商品（商品列表）
 * @method
 * @param {Number} page
 * @param {Number} pageSize
 * @param {Number} groupId
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqGetGoods = (page, pageSize, groupId) => ajax(
  '/api/mall/manager/goods/info/list',
  {page, pageSize, groupId},
  'POST'
);

/**
 * 获取所有商品(搜索标签商品)
 * @method
 * @param {String} name 商品名
 * @param {Number} includeGroupId
 * @param {Number} groupId
 * @param {Number} page
 * @param {Number} pageSize
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqGetAllGoods = ({name, includeGroupId, groupId, page, pageSize}) => ajax(
  '/api/mall/manager/goods/group/searchGoods',
  {name, includeGroupId, groupId,page, pageSize},
  'POST'
);

/**
 * 增减标签中商品
 * @method
 * @param {Array} goodsIds
 * @param {Number} groupId 标签Id
 * @param {Boolean} isOut 是否删除
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqChangeGoods = (goodsIds, groupId,isOut=false) => ajax(
  '/api/mall/manager/goods/group/inOutGoods',
  {goodsIds, groupId,isOut},
  'POST'
);
/**
 * 修改标签中商品权重
 * @method
 * @param {Number} goodsId 商品Id
 * @param {Number} groupId 标签Id
 * @param {Number} rank 权重
 * @return {Object} 返回值 包括code,msg,result
 */
export const reqChangeGoodsRank = ({goodsId, groupId,rank}) => ajax(
  '/api/mall/manager/goods/group/updateGoodsRank',
  {goodsId, groupId,rank},
  'POST'
);
