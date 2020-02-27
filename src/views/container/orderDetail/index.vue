<!-- 订单详情 -->
<template>
  <el-container class="layout from-layout">
    <el-header height="31px" class="goods-created-layout">
      <el-breadcrumb v-if="routeData.query.path_">
        <el-breadcrumb-item :to="{ path: routeData.query.path_ }">
          {{ routeData.query.title_ }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ routeData.meta.title }}</el-breadcrumb-item>
      </el-breadcrumb>
    </el-header>
    <el-main>
      <el-card class="box-card" shadow="never" body-style="border: 0;">
        <div slot="header" class="from-layout-title">
          <div>订单信息</div>
          <el-button type="text" @click="show1 = !show1" size="mini">
            {{ show1 ? "收起" : "展开" }}
            <i
              style="font-weight: bolder"
              :class="[show1 ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"
            ></i>
          </el-button>
        </div>
        <el-collapse-transition>
          <el-main v-show="show1" class="card-content">
            <div class="order-info">
              <div class="order-item">
                <div class="item"><font color="#333">快递公司：</font> {{trackingInfo.companyName}}</div>
                <div class="item"><font color="#333">快递单号：</font> {{trackingInfo.trackingNumber}}</div>
              </div>
              <div class="order-item">
                <div class="item"><font color="#333">下单时间：</font> {{formatTime(orderTimeInfo.create_time)}}</div>
                <div class="item"><font color="#333">付款时间：</font> {{formatTime(orderTimeInfo.pay_time)}}</div>
                <div class="item"><font color="#333">订单编号：</font> {{routeData.query.id}}</div>
                <div class="item"><font color="#333">订单状态：</font> {{orderTimeInfo.statusName}}</div>
              </div>
              <div class="order-item">
                <div class="item"><font color="#333">发货时间：</font> {{formatTime(orderTimeInfo.dispatch_time)}}</div>
                <div class="item"><font color="#333">收货时间：</font> {{formatTime(orderTimeInfo.received_time)}}</div>
                <div class="item"><font color="#333">售后状态：</font> 无售后</div>
              </div>
            </div>
            <div class="goods-info">
              <el-table
                border
                :span-method="objectSpanMethod"
                size="medium"
                :data="goodsList"
                style="width: 100%"
              >
                <el-table-column prop="goodsId" label="商品ID"></el-table-column>
                <el-table-column prop="name" label="商品名称">
                </el-table-column>
                <el-table-column prop="options" label="规格">
                  <template slot-scope="scope">
                    {{options(scope.row.options.list)}}
                  </template>
                </el-table-column>
                <el-table-column prop="showPrice" label="展示价(元)">
                  <template slot-scope="scope">
                    {{regFenToYuan(scope.row.showPrice)}}
                  </template>
                </el-table-column>
                <el-table-column prop="costPrice" label="实际价(元)">
                  <template slot-scope="scope">
                    {{regFenToYuan(scope.row.costPrice)}}
                  </template>
                </el-table-column>
                <el-table-column prop="address" label="闪购价(元)">
                  <template slot-scope="scope">
                    {{scope.row.address || "-"}}
                  </template>
                </el-table-column>
                <el-table-column prop="number" label="商品数量(件)"> </el-table-column>
                <el-table-column prop="totalPrice" label="商品总价(元)">
                  <template slot-scope="scope">
                    {{regFenToYuan(scope.row.totalPrice)}}
                  </template>
                </el-table-column>
                <el-table-column prop="address" label="店铺优惠券抵扣(元)">
                  <template slot-scope="scope">
                    {{scope.row.address || "-"}}
                  </template>
                </el-table-column>
                <el-table-column prop="goodsPrice" label="实收金额(元)">
                  <template slot-scope="scope">
                    <div class="price-info">
                      <div>{{regFenToYuan(scope.row.goodsPrice)}}</div>
                      <div>运费：0</div>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-main>
        </el-collapse-transition>
      </el-card>
      <el-card class="box-card" shadow="never" body-style="border: 0;">
        <div slot="header" class="from-layout-title">
          <div>买家收货信息</div>
          <el-button type="text" @click="show2 = !show2" size="mini">
            {{ show2 ? "收起" : "展开" }}
            <i
              style="font-weight: bolder"
              :class="[show2 ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"
            ></i>
          </el-button>
        </div>
        <el-collapse-transition>
          <el-main v-show="show2" class="card-content">
            <div class="buyer-info">
              <div class="item">
                <div class="title">收件人：</div>
                {{contact.name || "-"}} {{contact.phoneNumber}}
              </div>
              <div class="item">
                <div class="title">联系地址：</div>
                {{contact.province || "-"}}
                {{contact.city}}
                {{contact.district}}
                {{contact.address}}
              </div>
              <!-- <div class="item">
                <div class="title">
                  <el-button type="primary">复制</el-button>
                </div>
              </div> -->
            </div>
          </el-main>
        </el-collapse-transition>
      </el-card>
      <el-card class="box-card" shadow="never" body-style="border: 0;">
        <div slot="header" class="from-layout-title">
          <div>
            物流信息
          </div>
          <el-button type="text" @click="show5 = !show5" size="mini">
            {{ show5 ? "收起" : "展开" }}
            <i
              style="font-weight: bolder"
              :class="[show5 ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"
            ></i>
          </el-button>
        </div>
        <el-collapse-transition>
          <el-main v-show="show5" class="card-content">
            <template
              v-if="
                trackingInfo.companyName && trackingInfo.trackingList.length
              "
            >
              <div class="buyer-info">
                <div class="item">
                  <div class="title">物流公司：</div>
                  {{trackingInfo.companyName}}
                  <!-- <el-button class="refreshTracking" type="text">
                    刷新物流
                    <i class="el-icon-refresh" />
                  </el-button> -->
                </div>
                <div class="item">
                  <div class="title">快递单号：</div>
                  {{trackingInfo.trackingNumber}}
                </div>
              </div>
              <div class="logistics-info">
                <el-timeline :class="{ show: logisticsShow }" id="logisticsShow">
                  <el-timeline-item
                    v-for="(activity, index) in trackingInfo.trackingList"
                    :key="index"
                    :icon="activity.icon"
                    :type="activity.type"
                    :color="activity.color"
                    :size="activity.size"
                    :class="{ primary: activity.type === 'primary' }"
                    :timestamp="activity.time"
                  >
                    {{ activity.context }}
                  </el-timeline-item>
                </el-timeline>
                <div class="logistics-more">
                  <el-button type="text" @click="showMoreLogistics()" size="mini">
                    {{ logisticsShow ? "收起更多物流信息" : "展开更多物流信息" }}
                    <i
                      style="font-weight: bolder"
                      :class="[logisticsShow ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"
                    ></i>
                  </el-button>
                </div>
              </div>
            </template>
            <template v-else>暂无物流信息</template>
          </el-main>
        </el-collapse-transition>
      </el-card>
      <el-card class="box-card" shadow="never" body-style="border: 0;">
        <div slot="header" class="from-layout-title">
          <div>备注</div>
          <el-button type="text" @click="show3 = !show3" size="mini">
            {{ show3 ? "收起" : "展开" }}
            <i
              style="font-weight: bolder"
              :class="[show3 ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"
            ></i>
          </el-button>
        </div>
        <el-collapse-transition>
          <el-main v-show="show3" class="card-content">
            <el-table border size="medium" :data="remarkHistory" style="width: 100%">
              <el-table-column prop="nickName" label="用户"></el-table-column>
              <el-table-column prop="timeAt" label="创建时间">
                <template slot-scope="scope">
                  {{formatTime(scope.row.timeAt)}}
                </template>
              </el-table-column>
              <el-table-column prop="message" label="备注">
                <template slot-scope="scope">
                  {{scope.row.message || '-'}}
                </template>
              </el-table-column>
            </el-table>
          </el-main>
        </el-collapse-transition>
      </el-card>
      <el-card class="box-card" shadow="never" body-style="border: 0;">
        <div slot="header" class="from-layout-title">
          <div>退款信息</div>
          <el-button type="text" @click="show4 = !show4" size="mini">
            {{ show4 ? "收起" : "展开" }}
            <i
              style="font-weight: bolder"
              :class="[show4 ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"
            ></i>
          </el-button>
        </div>
        <el-collapse-transition>
          <el-main v-show="show4" class="card-content">
            <el-table border size="medium" :data="backPay" style="width: 100%">
              <el-table-column prop="date" label="退款"></el-table-column>
              <el-table-column prop="name" label="退款金额（元）"></el-table-column>
              <el-table-column prop="address" label="申请时间"> </el-table-column>
              <el-table-column prop="address" label="申请人"> </el-table-column>
              <el-table-column prop="address" label="备注"> </el-table-column>
              <el-table-column prop="address" label="退款状态"> </el-table-column>
              <el-table-column prop="address" label="退款时间"> </el-table-column>
            </el-table>
          </el-main>
        </el-collapse-transition>
      </el-card>
    </el-main>
  </el-container>
</template>

<script>
import {
  successMsg,
  jsonDeepClone,
  STATUS_CODE,
  errorMsg,
  dataFormat,
  regFenToYuan
} from "@/commonutils/common";
import { orderInfo } from "./request";
export default {
  name: "",
  data() {
    return {
      logisticsShow: false,
      show1: true,
      show2: true,
      show3: true,
      show4: true,
      show5: true,
      goodsList: [],
      contact: {},
      remarkHistory: [],
      orderTimeInfo: {},
      backPay: [],
      trackingInfo: {
        statusName: "-",
        trackingNumber: "-",
        companyName: "",
        trackingList: []
      }
    };
  },
  computed: {
    /**
     * 路由信息
     * @returns {Route} 路由信息
     */
    routeData() {
      return this.$route;
    }
  },
  // 生命周期 - 创建完成（访问当前this实例）
  watch: {
    routeData: {
      handler() {
        this.getOrderInfo();
      },
      immediate: true
    }
  },
  methods: {
    formatTime(time) {
      let str = "-";
      if (time) {
        const timeNum = parseInt(time);
        if (timeNum) {
          str = dataFormat(timeNum);
        }
      }
      return str;
    },
    regFenToYuan,
    /**
     * 合并商品表格行
     * @param {columnIndex} columnIndex
     * @return {void}
     */
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 9) {
        if (rowIndex % 2 === 0) {
          return {
            rowspan: this.goodsList.length,
            colspan: 1
          };
        } else {
          return {
            rowspan: 0,
            colspan: 0
          };
        }
      }
    },
    /**
     * 设置商品规格
     * @param {object} item
     * @return {specification} 规格值
     */
    options(item) {
      let specification = "";
      if (item && item.length) {
        item.forEach(item => {
          specification += item.value + "-";
        });
      }
      return specification.substring(0, specification.length - 1);
    },
    /**
     * 展开收起收货信息
     * @method
     * @return {void}
     */
    showMoreLogistics() {
      // 将滚动条回到顶部
      document.getElementById("logisticsShow").scrollTop = 0;
      this.logisticsShow = !this.logisticsShow;
    },
    /**
     * 查询订单信息
     * @method
     * @return {void}
     */
    async getOrderInfo() {
      const id = this.routeData.query.id;
      if (!this.routeData.query || !id) {
        errorMsg(this, "页面出错了，请退出后重试");
        return new Error("路由无订单id");
      }
      const { code, msg, result } = await orderInfo({
        id: id
      });
      if (code !== STATUS_CODE.success) {
        errorMsg(this, msg);
        return;
      }
      const { trackingInfo, order, remarkHistory } = result;
      if (order) {
        this.orderTimeInfo = {
          create_time: order.createTime || 0, // 下单时间
          pay_time: order.payTime || 0, // 支付时间
          dispatch_time: order.dispatchTime || 0, // 发货时间
          received_time: order.receivedTime || 0, // 收货时间
          statusName: order.statusName || "-" // 订单状态
        }
        this.contact = result.order.contact; // 买家联系人信息
        this.goodsList = result.order.goodsList.list; // 商品信息
        this.goodsList.forEach(item => {
          item.goodsPrice = result.order.price; // 商品实收金额
        });
      }
      if (remarkHistory.length && remarkHistory) {
        this.remarkHistory = remarkHistory;
      }
      if (trackingInfo) {
        this.trackingInfo.statusName = result.trackingInfo.statusName || "-"; // 物流信息
        this.trackingInfo.trackingNumber = result.trackingInfo.trackingNumber || "-"; // 物流信息
        this.trackingInfo.companyName = result.trackingInfo.companyName || "-"; // 物流信息
        // 物流信息
        this.trackingInfo.trackingList = JSON.parse(
          result.trackingInfo.trackingList
        );
        this.trackingInfo.trackingList.forEach((item, index) => {
          item.color = "#eee";
          item.size = "large";
          if (index === 0) {
            item.icon = "el-icon-success";
            item.type = "primary";
            item.color = "#26af61";
          }
        });
      }
    }
  }
};
</script>
<style lang="scss" src="../goodsManage/createGoods/css/global.scss" />
<style scoped lang="scss">
.price-info {
  display: flex;
  flex-wrap: wrap;
  flex-flow: column;
  text-align: center;
}
.order-info {
  background-color: #f1f1f1;
  padding: 20px;
  font-size: 14px;
  color: #666666;
  line-height: 1;
  margin-bottom: 20px;
  .order-item {
    width: 100%;
    display: flex;
    justify-content: flex-start;
    margin-bottom: 20px;
    .item {
      margin-right: 40px;
      &:last-child {
        margin-right: 0;
      }
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
}
.buyer-info {
  .item {
    font-size: 14px;
    display: flex;
    margin-bottom: 20px;
    .title {
      width: 85px;
    }
    &:last-child{
      margin-bottom: 0;
    }
  }
}
.logistics-info {
  margin-top: 20px;
  border-top: 1px solid #eeeeee;
  padding-top: 20px;
  .el-timeline-item.primary {
    .el-timeline-item__content {
      color: #26AF61;
    }
    .el-timeline-item__timestamp {
      color: #26AF61;
    }
  }
}
</style>
<style lang="scss">
.el-button--text.refreshTracking {
  padding: 0;
  margin-left: 10px;
  line-height: 1;
  border: 0;
}
.logistics-info {
  .logistics-more {
    margin-top: 10px;
    .el-button--text {
      padding-bottom: 0;
    }
  }
  .el-timeline {
    max-height: 500px;
    overflow: hidden;
    padding-left: 10px;
    height: 173px;
    transition: all 0.3s ease 0s;
    &.show {
      height: auto;
      overflow-y: auto;
    }
  }
  .el-timeline-item.primary {
    .el-timeline-item__content {
      color: #26AF61;
      font-weight: bold;
    }
    .el-timeline-item__timestamp {
      color: #26AF61;
      font-weight: bold;
    }
  }
}
</style>
