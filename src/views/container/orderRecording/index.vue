<template>
  <el-container class="layout">
    <el-header height="50px" class="layout-title-box">
      <div class="titles">{{ route.meta.title }}</div>
    </el-header>
    <el-header
      style="min-height: 42px; height: auto"
      class="layout-title-box layout-title-filter"
    >
      <div class="filter">
        <div class="filter-item">
          <label>买家账号</label>
          <el-input
            v-model="filter.account"
            clearable
            placeholder="请输入账号搜索"
            style="width: 210px;"
          />
        </div>
        <div class="filter-item">
          <label>订单号</label>
          <el-input
            v-model="filter.id"
            clearable
            placeholder="请输入订单号搜索"
            style="width: 210px;"
          />
        </div>
        <div class="filter-item">
          <label>订单状态</label>
          <el-select
            style="width: 140px"
            v-model="filter.status"
            placeholder="请选择"
          >
            <el-option
              :title="item.name"
              v-for="item in goodsStatusList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </div>
        <div class="filter-item">
          <label>订单时间</label>
          <el-date-picker
            style="width: 250px"
            v-model="filter.orderTime"
            type="daterange"
            unlink-panels
            :picker-options="pickerOptions"
            value-format="timestamp"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          >
          </el-date-picker>
        </div>
        <div class="filter-item btnItem">
          <el-button type="primary" @click="filterData">查询</el-button>
        </div>
        <div class="filter-item btnItem">
          <el-button type="info" @click="restFilter">重置</el-button>
        </div>
        <div class="filter-item btnItem">
          <el-button type="info" icon="el-icon-download" @click="exportOrderData">导出</el-button>
        </div>
      </div>
    </el-header>
    <el-main v-if="tableData.length" class="layout-content">
      <el-card
        v-for="order in tableData"
        shadow="never"
        :key="order.id"
        body-style="border: 0;"
      >
        <div class="order-title">
          <div class="items">订单类型： {{ order.orderTypeName }}</div>
          <div class="items">订单编号： {{ order.id }}</div>
          <div class="items">订单时间： {{ dataFormat(order.createTime) }}</div>
          <div class="items">收货人： {{ order.receverName }}</div>
        </div>
        <el-table
          border
          min-height="500"
          :data="order.goodsList.list"
          :span-method="objectSpanMethod"
          size="medium"
          style="width: 100%;"
        >
          <el-table-column
            prop="name"
            show-overflow-tooltip
            label="商品名称"
          ></el-table-column>
          <el-table-column show-overflow-tooltip label="单价(￥)">
            <template slot-scope="scope">
              {{ regFenToYuan(scope.row.costPrice) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="number"
            show-overflow-tooltip
            label="数量"
          ></el-table-column>
          <el-table-column
            prop="orderStatusName"
            show-overflow-tooltip
            label="订单状态"
          >
          </el-table-column>
          <el-table-column
            prop="afterSaleStatusName"
            show-overflow-tooltip
            label="售后状态"
          ></el-table-column>
          <el-table-column
            prop="userAccount"
            show-overflow-tooltip
            label="买家账号"
          ></el-table-column>
          <el-table-column
            prop="totalPrice"
            show-overflow-tooltip
            label="实收金额(￥)"
          >
            <template slot-scope="scope">
              {{ regFenToYuan(scope.row.totalPrice) }}
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button @click="openLogisticsSet(order)" type="text">编辑</el-button>
              <el-button v-if="scope.row.orderStatus !== 7" type="text" @click="closeOrder(order)">关闭</el-button>
              <el-button type="text" @click="showDetail(order)">查看详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <div class="content-pagination">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="page.currentPage"
          :page-sizes="pageSizes"
          :page-size="page.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="page.total"
        />
      </div>
    </el-main>
    <el-main v-else class="layout-content empty">
      <div class="empty">
        暂无订单记录
      </div>
    </el-main>
    <el-dialog
      title="关闭订单"
      width="600px "
      destroy-on-close
      :close-on-click-modal="false"
      class="add-good-dialog"
      :visible.sync="closeOrderVis"
      @close="closeFormSetData"
    >
      <el-form
        :model="closeForm"
        label-width="100px"
        :rules="closeFormRule"
        ref="closeFormRule"
      >
        <el-form-item label="关闭原因：" prop="reason">
          <el-select v-model="closeForm.reason" placeholder="请选择关闭原因">
            <el-option v-for="item in closeOrderList" :key="item.id" :label="item.name" :value="item.name"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label=" 备注信息：">
          <el-input
            style="width: 400px"
            rows="3"
            type="textarea"
            maxlength="200"
            show-word-limit
            v-model="closeForm.remark"
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="closeOrderVis = false">取 消</el-button>
        <el-button @click="setFormSetData" type="primary">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="编辑物流信息"
      width="600px "
      destroy-on-close
      :close-on-click-modal="false"
      class="add-good-dialog"
      @close="closeLogistics"
      :visible.sync="editLogistics"
    >
      <el-form
        :model="logisticsForm"
        label-width="100px"
        :rules="logisticsRule"
        ref="logisticsRule"
      >
        <el-form-item label="快递公司：" prop="company">
          <el-select v-model="logisticsForm.company" placeholder="请选择快递公司">
            <el-option v-for="item in exprressList" :key="item.id" :label="item.name" :value="item.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="物流单号：" prop="trackingNumber">
          <el-input style="width: 400px" v-model.number="logisticsForm.trackingNumber"></el-input>
        </el-form-item>
        <el-alert title="请确认修改的快递公司和快递单号正确后，再点击确认按钮" type="warning" show-icon> </el-alert>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editLogistics = false">取 消</el-button>
        <el-button @click="setLogisticsSetData" :loading="isLogistics" type="primary">确 定</el-button>
      </span>
    </el-dialog>
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
import noImg from "@/assets/images/noImg.jpg";
import {
  orderList,
  exportOrder,
  trackingNumber,
  updateStatus
} from "./request";
import { mapState } from "vuex";

export default {
  name: "index",
  data() {
    // const checkNum = (rule, value, callback) => {
    //   if (!value) {
    //     return callback(new Error("物流单号不能为空"));
    //   }
    //   if (!Number.isInteger(value)) {
    //     callback(new Error("请输入数字值"));
    //   } else {
    //     callback();
    //   }
    // };
    return {
      isLogistics: false,
      closeFormRule: {
        reason: [
          {
            required: true,
            message: "请选择关闭原因",
            trigger: "change"
          }
        ]
      },
      logisticsRule: {
        company: [
          {
            required: true,
            message: "请选择快递公司",
            trigger: "change"
          }
        ],
        trackingNumber: [
          { required: true, message: "请输入快递单号", trigger: "blur" }
        ]
      },
      closeForm: {
        reason: "",
        remark: ""
      },
      logisticsForm: {
        company: "",
        trackingNumber: ""
      },
      closeOrderList: JSON.parse(process.env.VUE_APP_PAGE_CLOSE_ORDER),
      closeOrderVis: false,
      editLogistics: false,
      pickerOptions: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            }
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            }
          }
        ]
      },
      pageSizes: JSON.parse(process.env.VUE_APP_PAGE_SIZE),
      noImg: noImg,
      isLoading: false,
      tableData: [],
      filter: {
        account: "",
        id: "",
        status: 0,
        orderTime: [],
        begin: "",
        end: ""
      },
      page: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      }
    };
  },
  computed: {
    ...mapState(["exprressList"]),
    goodsStatusList() {
      const all = [{ id: 0, name: "全部" }];
      const data = JSON.parse(process.env.VUE_APP_PAGE_ORDER_STATUS);
      return [...all, ...data];
    },
    /**
     * 路由信息
     * @returns {Route} 路由信息
     */
    route() {
      return this.$route;
    },
    /**
     * 筛选列表
     * @returns {[]} 筛选列表
     */
    statusList() {
      let fliterList = [];
      if (this.tableData.length) {
        this.tableData.forEach(item => {
          if (
            fliterList.filter(ele => ele.text === item.statusName).length === 0
          ) {
            fliterList.push({
              text: item.statusName,
              value: item.statusName
            });
          }
        });
      }
      return fliterList;
    },
    /**
     * 设置状态颜色
     * @returns {String} color
     */
    setFontColor() {
      return val => {
        switch (val) {
          case "交易完成":
            return "#26AF61";
          case "草稿":
            return "#999";
          case "订单取消":
            return "#ff7736";
          default:
            return "#333";
        }
      };
    }
  },
  methods: {
    /**
     * 查看订单详情
     * @param {Object} item
     * @returns {void}
     */
    showDetail(item) {
      this.$router.push({
        name: "orderDetail",
        query: {
          title_: this.route.meta.title,
          path_: this.route.path,
          id: item.id
        }
      });
    },
    /**
     * 编辑订单
     * @returns {void}
     */
    setLogisticsSetData() {
      this.$refs["logisticsRule"].validate(async valid => {
        if (valid) {
          this.isLogistics = true;
          const { code, msg } = await trackingNumber({
            orderId: this.logisticsForm.id,
            trackingNumber: this.logisticsForm.trackingNumber.toString(),
            companyId: this.logisticsForm.company
          });
          this.isLogistics = false;
          if (code !== STATUS_CODE.success) {
            errorMsg(this, msg);
            return;
          }
          successMsg(this, "编辑成功");
          this.editLogistics = false;
        }
      });
    },
    /**
     * 编辑订单
     * @param {Object} item
     * @returns {void}
     */
    openLogisticsSet(item) {
      this.$set(this.logisticsForm, "id", item.id);
      this.editLogistics = true;
    },
    /**
     * 关闭编辑订单弹窗
     * @returns {void}
     */
    closeLogistics() {
      this.$set(this.logisticsForm, "id", undefined);
      this.$set(this.logisticsForm, "trackingNumber", "");
      this.$set(this.logisticsForm, "company", "");
      this.editLogistics = false;
    },
    /**
     * 编辑关闭订单
     * @returns {void}
     */
    setFormSetData() {
      this.$refs["closeFormRule"].validate(async valid => {
        if (valid) {
          const { code, msg } = await updateStatus({
            id: this.closeForm.id,
            reason: this.closeForm.reason,
            remark: this.closeForm.remark
          });
          if (code !== STATUS_CODE.success) {
            errorMsg(this, msg);
            return;
          }
          successMsg(this, "操作成功");
          this.getOrderList();
          this.closeOrderVis = false;
        }
      });
    },
    /**
     * 关闭编辑关闭订单弹窗
     * @returns {void}
     */
    closeFormSetData() {
      this.$set(this.closeForm, "id", undefined);
      this.$set(this.closeForm, "reason", "");
      this.$set(this.closeForm, "remark", "");
    },
    /**
     * 打开编辑关闭订单弹窗
     * @param {Object} item
     * @returns {void}
     */
    closeOrder(item) {
      this.$set(this.closeForm, "id", item.id);
      this.closeOrderVis = true;
    },
    dataFormat,
    regFenToYuan,
    /**
     * 格式化订单状态
     * @param {Object} status
     * @returns {void}
     */
    statusName(status) {
      let statusName = "-";
      if (status) {
        this.goodsStatusList.forEach(item => {
          if (item.id === status) {
            statusName = item.name;
          }
        });
      }
      return statusName;
    },
    /**
     * 合并表格行
     * @param {Object} columnIndex
     * @param {Object} rowIndex
     * @returns {void}
     */
    objectSpanMethod({ row, column, rowIndex, columnIndex }) {
      if (columnIndex === 7 || columnIndex === 6 || columnIndex === 5) {
        if (rowIndex % row.goodsCount === 0) {
          return {
            rowspan: row.goodsCount,
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
     * 创建a标签并添加点击事件
     * @param {String} blob
     * @param {Object} fileName
     * @returns {void}
     */
    downFile(blob, fileName) {
      if (window.navigator.msSaveOrOpenBlob) {
        navigator.msSaveBlob(blob, fileName);
      } else {
        let link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        link.click();
        window.URL.revokeObjectURL(link.href);
      }
    },
    /**
     * 根据条件查询订单列表，并将excel文件流导出到本地
     * @description 判断result是否为"application/octet-stream"文件流
     * @description 非"application/octet-stream"，则解析result并显示错误信息
     * @returns {void}
     */
    async exportOrderData() {
      const params = {
        page: this.page.currentPage,
        pageSize: 10,
        account: this.filter.account || undefined,
        id: this.filter.id || undefined,
        status: this.filter.status,
        begin:
          this.filter.orderTime && this.filter.orderTime[0]
            ? parseInt(this.filter.orderTime[0] / 1000)
            : undefined,
        end:
          this.filter.orderTime && this.filter.orderTime[1]
            ? parseInt(this.filter.orderTime[1] / 1000)
            : undefined
      };
      const data = await exportOrder(params);
      // 判断返回是否为excel文件流
      if (data.type !== "application/octet-stream") {
        // 解析result，取出错误信息
        const reader = new FileReader();
        reader.onload = () => {
          const result = JSON.parse(reader.result);
          errorMsg(this, result.msg);
        };
        reader.readAsText(data);
        return;
      }
      // 设置文件名，并下载到本地
      let timestamp = new Date().getTime() + ".xlsx";
      let blob = new Blob([data], { type: "application/octet-stream" }),
        fileName = `商品订单列表_${timestamp}`;
      this.downFile(blob, fileName);
      successMsg(this, `导出excel成功: 【${fileName}】`)
    },
    /**
     * 获取订单列表
     * @returns {void}
     */
    async getOrderList() {
      this.isLoading = true;
      if (!this.filter) return;
      const params = {
        page: this.page.currentPage,
        pageSize: this.page.pageSize,
        account: this.filter.account || undefined,
        id: this.filter.id || undefined,
        status: this.filter.status,
        begin:
          this.filter.orderTime && this.filter.orderTime[0]
            ? parseInt(this.filter.orderTime[0] / 1000)
            : undefined,
        end:
          this.filter.orderTime && this.filter.orderTime[1]
            ? parseInt(this.filter.orderTime[1] / 1000)
            : undefined
      };
      const data = await orderList(params);
      this.isLoading = false;
      if (data.code !== STATUS_CODE.success) {
        errorMsg(this, data.msg);
        return;
      }
      this.tableData = jsonDeepClone(data.result.list);
      this.page.total = data.result.count;
      this.tableData.forEach(item => {
        item.price = parseInt(item.price);
        item.createTime = parseInt(item.createTime);
        item.goodsList.list.forEach(ele => {
          ele.afterSaleStatusName = item.afterSaleStatusName || "-";
          ele.userAccount = item.userAccount;
          ele.goodsCount = item.goodsList.list.length;
          ele.orderStatusName = item.statusName;
          ele.orderStatus = item.status;
        });
      });
    },
    /**
     * 筛选订单列表
     * @returns {void}
     */
    filterData() {
      this.page.pageSize = 10;
      this.page.currentPage = 1;
      this.getOrderList();
    },
    /**
     * 重置筛选订单列表
     * @returns {void}
     */
    restFilter() {
      this.filter = {
        id: "",
        account: "",
        orderTime: [],
        status: 0
      };
      this.page.pageSize = 10;
      this.page.currentPage = 1;
      this.getOrderList();
    },
    /**
     * 分页订单列表
     * @param {Object} val
     * @returns {void}
     */
    handleSizeChange(val) {
      this.page.currentPage = 1;
      this.page.pageSize = val;
      this.getOrderList();
    },
    /**
     * 分页订单列表
     * @param {Object} val
     * @returns {void}
     */
    handleCurrentChange(val) {
      this.page.currentPage = val;
      this.getOrderList();
    }
  },
  created() {
    this.getOrderList();
  }
};
</script>
<style scoped lang="scss">
.layout-content.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  .empty {
    margin: 30px 0;
  }
}
.goods-group-box {
  text-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}
.order-title {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  margin-bottom: 10px;
  .items {
    margin-right: 20px;
  }
}
@media screen and (max-width: 1820px) {
  .layout-title-box.layout-title-filter .filter .filter-item{
    margin-bottom: 10px;
  }
}
</style>
<style lang="scss">
.layout-content {
  .el-table--enable-row-transition .el-table__body td.pa0-cell {
    .cell {
      padding-left: 0;
    }
  }
}
</style>
