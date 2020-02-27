import ajax from "@/api/ajax";
/**
 * 根据条件查询订单列表
 * @method
 * @param {Object} params 订单条件查询信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const orderList = (params = {}) =>
  ajax(
    "/api/mall/manager/order/list",
    {
      page: params.page,
      pageSize: params.pageSize,
      account: params.account,
      id: params.id,
      status: params.status,
      begin: params.begin,
      end: params.end
    },
    "POST"
  );
/**
 * 编辑快递单号
 * @method
 * @param {Object} params 订单信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const trackingNumber = (params = {}) =>
  ajax(
    "/api/mall/manager/exprress/edit/trackingNumber",
    {
      orderId: params.orderId,
      trackingNumber: params.trackingNumber,
      companyId: params.companyId
    },
    "POST"
  );
/**
 * 修改订单状态
 * @method
 * @param {Object} params 订单信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const updateStatus = (params = {}) =>
  ajax(
    "/api/mall/manager/goods/order/updateStatus",
    {
      id: params.id,
      reason: params.reason,
      status: params.status,
      remark: params.remark
    },
    "POST"
  );
/**
 * 根据条件导出订单
 * @method
 * @description 这里设置请求responseType为 "blob"模式
 * @param {Object} params 订单条件查询信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const exportOrder = (params = {}) =>
  ajax(
    // "api/fileStream",
    "/api/mall/manager/export/order/list",
    {
      page: params.page,
      pageSize: params.pageSize,
      account: params.account,
      id: params.id,
      status: params.status,
      begin: params.begin,
      end: params.end
    },
    "POST",
    {
      responseType: "blob"
    }
  );
