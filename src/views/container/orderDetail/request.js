import ajax from "@/api/ajax";
/**
 * 查询订单信息
 * @method
 * @param {Object} params 订单条件查询信息
 * @return {Object} 返回值 包括code,msg,result
 */
export const orderInfo = (params = {}) =>
  ajax(
    "/api/mall/manager/order/info",
    {
      id: params.id
    },
    "POST"
  );
