<template>
  <el-container class="layout config-group-container">
    <el-header
      style="min-height: 42px; height: auto"
      class="layout-title-box layout-title-filter"
    >
      <div class="filter">
        <div class="filter-item">
          <label>商品名称</label>
          <el-input
            v-model="filter.searchKey"
            clearable
            placeholder="请输入关键字搜索"
            style="width: 210px;"
          ></el-input>
        </div>
        <div class="filter-item">
          <label>商品分类</label>
          <el-cascader
            :append-to-body="false"
            style="width: 210px;"
            filterable
            clearable
            ref="getCategory"
            v-model="filter.category"
            :props="{ value: 'id', label: 'name', emitPath: false }"
            :options="goodsCategoryList"
            :show-all-levels="false"
            placeholder="请选择商品分类"
          >
            <template slot-scope="{ node, data }">
              <span>{{ data.name }}</span>
              <span v-if="!node.isLeaf"> ({{ data.children.length }}) </span>
            </template>
          </el-cascader>
        </div>
        <div class="filter-item btnItem">
          <el-button type="primary" @click="filterData">查询</el-button>
        </div>
        <div class="filter-item btnItem">
          <el-button type="info" @click="restFilter">重置</el-button>
        </div>
      </div>
      <div class="operation">
        <el-button size="medium" type="primary" icon="el-icon-refresh" @click="getGoodsList">刷新表格</el-button>
        <el-button size="medium" type="primary" icon="el-icon-plus" @click="addGoods">发布商品</el-button>
      </div>
    </el-header>
    <el-main class="layout-content">
      <el-card shadow="never" body-style="border: 0;">
        <el-table
          v-loading="isLoading"
          min-height="500"
          header-row-class-name="goodsTable"
          :data="tableData"
          size="medium"
          style="width: 100%;"
        >
          <el-table-column prop="name" min-width="150" label="商品名称">
            <template slot-scope="scope">
              <div class="goodsTit-box">
                <el-image
                  style="width: 40px; height: 40px; vertical-align: middle"
                  :src="scope.row.firstPicture"
                  title="点击预览"
                  fit="cover"
                  :preview-src-list="[scope.row.firstPicture]"
                >
                  <div slot="error" class="image-slot" title="暂无商品主图">
                    <img :src="noImg" width="40" height="40" />
                  </div>
                  <div slot="placeholder" class="image-slot">
                    <font size="1">load</font>
                    <span class="el-icon-loading"></span>
                  </div>
                </el-image>
                <div class="tooltip" :title="scope.row.name">{{ scope.row.name }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" width="150" prop="class.name" label="商品分类"></el-table-column>
          <el-table-column align="center" label="商品标签">
            <template slot-scope="scope">
              <template v-if="scope.row.tags.length">
                <div
                  :title="setGoodsGroup(scope.row.tags)"
                  class="goods-group-box"
                >{{ setGoodsGroup(scope.row.tags) }}</div>
              </template>
              <template v-else>-</template>
            </template>
          </el-table-column>
          <el-table-column column-key="publishTime" width="210" align="center" label="发布时间">
            <template slot-scope="scope">{{ setPulishTime(scope.row.publishTime) }}</template>
          </el-table-column>
          <el-table-column prop="showPrice" width="130" sortable label="显示价(￥)">
            <template slot-scope="scope">{{ setShowPrice(scope.row.showPrice) }}</template>
          </el-table-column>
          <el-table-column prop="totalStockNum" width="100" sortable label="总库存">
            <template slot-scope="scope">
              {{scope.row.totalStockNum}}
              <el-button type="text" @click="showGoodsSku(scope.row)">修改库存</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="rank" width="100" sortable align="center" label="排序">
            <template slot-scope="scope">
              {{scope.row.rank}}
              <el-button type="text" @click="changeGoodsRank(scope.row)">修改排序</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="salesNum" width="120" sortable align="center" label="累计销量"></el-table-column>
          <el-table-column
            width="100"
            align="center"
            :filters="statusList"
            :filter-method="filterTag"
            filter-placement="bottom-start"
            column-key="statusName"
            label="状态"
          >
            <template slot-scope="scope">
              <span :style="{ color: setFontColor(scope.row.statusName) }">
                {{ scope.row.statusName }}
              </span>
            </template>
          </el-table-column>
          <el-table-column prop="address" fixed="right" label="操作" width="120">
            <template slot-scope="scope">
              <el-button type="text" @click="edit(scope.row)">编辑</el-button>
              <el-button
                v-if="scope.row.status === 4"
                type="text"
                @click="updateStatus(scope.row, 3)"
                >上架</el-button
              >
              <el-button
                v-else-if="scope.row.status === 3"
                type="text"
                @click="updateStatus(scope.row, 4)"
                >下架</el-button
              >
              <el-button
                type="text"
                @click="showRecommendVis(scope.row)"
              >推荐
              </el-button>
              <el-button type="text" @click="updateStatus(scope.row, 5)">删除</el-button>
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
        ></el-pagination>
      </div>
    </el-main>
    <el-dialog
      title="修改商品库存"
      width="750px "
      destroy-on-close
      :close-on-click-modal="false"
      class="add-good-dialog"
      :visible.sync="skuCountDial"
    >
      <div class="good-main1" v-loading="skuCountLoad">
        <el-table v-loading="isShowSku" :data="skuCountData">
          <el-table-column
            v-for="item in skuCountHead"
            :key="item.id"
            property="date"
            :label="item"
          >
            <template slot-scope="scope">
              {{ scope.row[item] }}
            </template>
          </el-table-column>
          <el-table-column property="totalStockNum" label="当前库存"></el-table-column>
          <el-table-column property="change" label="库存增减">
            <template slot-scope="scope">
              <el-input-number v-model="scope.row.change" :step="1" step-strictly></el-input-number>
            </template>
          </el-table-column>
        </el-table>
        <el-alert show-icon title="点击加减号来增减库存；增减库存为负数：则减少当前库存" type="info"> </el-alert>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="skuCountDial = false">取 消</el-button>
        <el-button @click="updateSkuStock" :disabled="isShowSku" :loading="isUpdateSku" type="primary">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog
      title="推荐商品"
      width="600px"
      destroy-on-close
      :close-on-click-modal="false"
      class="add-good-dialog"
      :visible.sync="recommendVis"
    >
      <div class="good-main1">
        <el-form
          :model="recommendForm"
          size="medium"
          :rules="rules"
          ref="recommendForm"
          label-width="80px"
          class="demo-ruleForm"
        >
          <el-form-item label="推荐类型" prop="recommendType">
            <el-select
              v-model="recommendForm.recommendType"
              placeholder="请选择"
            >
              <el-option
                :title="item.name"
                style="width: 217px"
                v-for="item in recommendList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="推荐时间" prop="orderTime">
            <el-date-picker
              :editable="false"
              v-model="recommendForm.orderTime"
              :picker-options="bannerPickerOptions"
              type="datetimerange"
              unlink-panels
              value-format="timestamp"
              range-separator="至"
              :default-time="['12:00:00', '12:00:00']"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            ></el-date-picker>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="recommendVis = false">取 消</el-button>
        <el-button @click="updateRecommend" type="primary">确 定</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<script>
import {
  getGoodsList,
  delGoods,
  updateRank,
  getSkus,
  updateSkuStock,
  recommend
} from "../createGoods/controller/request";
import {
  successMsg,
  jsonDeepClone,
  STATUS_CODE,
  errorMsg,
  dataFormat,
  regFenToYuan
} from "@/commonutils/common";
import noImg from "@/assets/images/noImg.jpg";

export default {
  name: "index",
  data() {
    return {
      recommendVis: false,
      isShowSku: false,
      isUpdateSku: false,
      skuCountLoad: false,
      skuCountData: [],
      skuCountHead: [],
      skuCountDial: false,
      recommendForm: {
        recommendType: "",
        begin_time: "",
        end_time: "",
        orderTime: [],
        rank: ""
      },
      recommendList: [
        {
          name: "新品首发",
          id: 1
        },
        {
          name: "爆款推荐",
          id: 2
        }
      ],
      bannerPickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        }
      },
      rules: {
        recommendType: [
          { required: true, message: "请选择推荐类型", trigger: "change" }
        ],
        orderTime: [
          { required: true, message: "请选择推荐时间", trigger: "blur" }
        ]
      },
      pageSizes: JSON.parse(process.env.VUE_APP_PAGE_SIZE),
      noImg: noImg,
      isLoading: false,
      tableData: [],
      filter: {
        searchKey: "",
        category: 0
      },
      page: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      }
    };
  },
  props: ["goodsCategoryList"],
  computed: {
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
          case "上架中":
            return "#26AF61";
          case "草稿":
            return "#999";
          case "已删除":
            return "#ff7736";
          default:
            return "#333";
        }
      };
    }
  },
  methods: {
    showRecommendVis(item) {
      if (item.id) {
        this.$set(this.recommendForm, "id", item.id);
        this.recommendVis = true;
      }
    },
    updateRecommend() {
      this.$refs["recommendForm"].validate(async valid => {
        if (!valid) {
          return;
        }
        const { code, msg } = await recommend({
          id: this.recommendForm.id,
          recommendType: this.recommendForm.recommendType,
          begin_time: this.recommendForm.orderTime[0] / 1000,
          end_time: this.recommendForm.orderTime[1] / 1000
        });
        if (code !== STATUS_CODE.success) {
          errorMsg(this, msg);
          return;
        }
        successMsg(this, "推荐成功");
        this.recommendVis = false;
      })
    },
    /**
     * 修改商品库存
     * @returns {void}
     */
    async updateSkuStock() {
      const list = this.skuCountData;
      if (
        list.every(item => {
          return item.change === 0;
        })
      ) {
        this.skuCountDial = false;
      } else {
        this.isUpdateSku = true;
        const { code, msg } = await updateSkuStock({
          list: list
        });
        this.isUpdateSku = false;
        if (code !== STATUS_CODE.success) {
          errorMsg(this, msg);
          return;
        }
        await this.getGoodsList();
        this.skuCountDial = false;
      }
      this.skuCountData = [];
      this.skuCountHead = [];
    },
    /**
     * 获取商品库存
     * @param {Object} val
     * @returns {void}
     */
    async showGoodsSku(val) {
      this.skuCountData = [];
      this.skuCountHead = [];
      this.skuCountDial = true;
      this.isShowSku = true;
      const { code, msg, result } = await getSkus({
        id: val.id
      });
      if (code !== STATUS_CODE.success) {
        errorMsg(this, msg);
        return;
      }
      const sku = result.skus;
      const options = sku[0].options.list;
      const tableHead = [];
      const tableData = [];
      options.forEach(item => {
        tableHead.push(item.key);
      });
      // 遍历sku，生成表头和表格数据
      await sku.forEach(item => {
        const obj = {};
        item.options.list.forEach(option => {
          obj[option.key] = option.value;
        });
        obj["totalStockNum"] = item.totalStockNum;
        obj["change"] = 0;
        obj["id"] = item.id;
        tableData.push(obj);
      });
      this.$nextTick(() => {
        this.skuCountData = tableData;
        this.skuCountHead = tableHead;
        this.isShowSku = false;
      });
    },
    //校验正整数
    editName(val) {
      if (!/^([0]|[1-9][0-9]*)$/.test(val)) {
        return "排序数值不合法，必须为整数值";
      }
    },
    /**
     * 编辑商品排序
     * @param {Object} item
     * @param {Object} type
     * @returns {void}
     */
    changeGoodsRank(item) {
      this.$prompt("排序数值：", "编辑排序", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /\S/,
        inputValidator: this.editName,
        inputErrorMessage: "排序数值不能为空",
        beforeClose: (action, instance, done) => {
          if (action === "confirm") {
            this.interceptorFn(async () => {
              this.isLoading = true;
              const data = await updateRank({
                rank: instance.inputValue,
                id: item.id
              });
              this.isLoading = false;
              if (data.code !== STATUS_CODE.success) {
                errorMsg(this, data.msg);
                return;
              }
              done();
              this.getGoodsList();
            });
          } else {
            done();
          }
        }
      })
        .then(() => {
          successMsg(this, "编辑成功");
        })
        .catch(() => {});
    },
    setGoodsGroup(val) {
      let str = "";
      if (val.length) {
        val.forEach(item => {
          str += item.name + "/";
        });
      }
      return str.substring(0, str.length - 1);
    },
    /**
     * 根据条件查询商品
     * @returns {void}
     */
    filterData() {
      this.page.currentPage = 1;
      this.page.pageSize = 10;
      this.getGoodsList();
    },
    /**
     * 分转元
     * @param {Number} val
     * @returns {Route} 元
     */
    setShowPrice(val) {
      return regFenToYuan(val);
    },
    /**
     * 时间戳格式化
     * @param {Number} val
     * @returns {string} yyyy-m-d hh:mm:ss
     */
    setPulishTime(val) {
      if (!val || !parseInt(val)) {
        return "-";
      } else {
        return dataFormat(val);
      }
    },
    /**
     * 重置筛选
     * @returns {void}
     */
    restFilter() {
      this.filter.searchKey = "";
      this.filter.category = 0;
      this.page.currentPage = 1;
      this.page.pageSize = 10;
      this.getGoodsList();
    },
    /**
     * 根据条件获取商品列表
     * @returns {Promise<void>} 所有商品列表
     */
    async getGoodsList() {
      this.isLoading = true;
      const params = {
        name: this.filter.searchKey,
        classId: parseInt(this.filter.category),
        page: this.page.currentPage,
        pageSize: this.page.pageSize
      };
      const data = await getGoodsList(params);
      this.isLoading = false;
      if (data.code !== STATUS_CODE.success) {
        errorMsg(this, data.msg);
        return;
      }
      this.tableData = jsonDeepClone(data.result.list);
      this.tableData.forEach(item => {
        item.showPrice = parseInt(item.showPrice);
      });
      this.page.total = data.result.count;
    },
    /**
     * 过滤状态列
     * @param {Object} value
     * @param {Object} row
     * @param {Object} column
     * @returns {Object} Object
     */
    filterTag(value, row, column) {
      const property = column["property"];
      return row[property] === value;
    },
    /**
     * 翻页
     * @param {Number} val
     * @returns {void}
     */
    handleCurrentChange(val) {
      this.page.currentPage = val;
      this.getGoodsList();
    },
    /**
     * 设置页数
     * @param {Number} val
     * @returns {void}
     */
    handleSizeChange(val) {
      this.page.currentPage = 1;
      this.page.pageSize = val;
      this.getGoodsList();
    },
    /**
     * 创建商品，转跳页面
     * @returns {void}
     */
    addGoods() {
      this.$router.push({
        name: "createGoods",
        query: {
          title_: this.route.meta.title,
          path_: this.route.path
        }
      });
    },
    /**
     * 编辑标签
     * @param {Object}item
     * @returns {void}
     */
    edit(item) {
      this.$router.push({
        name: "createGoods",
        query: {
          title_: this.route.meta.title,
          path_: this.route.path,
          goodsId: item.id
        }
      });
    },
    /**
     * 商品状态
     * @param {Number} status
     * @description 返回:商品状态名称
     * @returns {String} status
     */
    setStatusName(status) {
      let statusName;
      if (status === STATUS_CODE.goodsDelete) {
        statusName = "删除";
      } else if (status === STATUS_CODE.goodsRelease) {
        statusName = "上架";
      } else if (status === STATUS_CODE.goodsLower) {
        statusName = "下架";
      } else {
        statusName = "未知状态";
      }
      return statusName;
    },
    /**
     * 修改商品状态
     * @param {Object} item
     * @param {Number} status
     * @returns {void}
     */
    updateStatus(item, status) {
      if (!status || !item) {
        return new Error("位置错误：!status || !item");
      }
      const statusName = this.setStatusName(status);
      this.$confirm(`确定要${statusName}商品【${item.name}】？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          this.isLoading = true;
          this.interceptorFn(async () => {
            const data = await delGoods({
              id: parseInt(item.id),
              status: status
            });
            this.isLoading = false;
            if (data.code !== STATUS_CODE.success) {
              errorMsg(this, data.msg);
              return;
            }
            successMsg(this, "操作成功");
            this.getGoodsList();
          });
        })
        .catch(() => {});
    }
  },
  created() {
    this.getGoodsList();
  }
};
</script>

<style scoped lang="scss">
/*.layout-title-box {*/
/*  margin-top: 10px;*/
/*  .titles {*/
/*    font-size: 20px;*/
/*  }*/
/*  display: flex;*/
/*  justify-content: space-between;*/
/*}*/
.goodsTit-box {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  .el-image {
    min-width: 40px;
    margin-right: 5px;
  }
}
.goods-group-box {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.layout-title-box.layout-title-filter {
  .filter {
    display: flex;
    justify-content: flex-start;
    .filter-item {
      margin-right: 40px;
      &.btnItem {
        margin-right: 20px;
      }
      &:last-child {
        margin-right: 0;
      }
    }
  }
}
</style>
