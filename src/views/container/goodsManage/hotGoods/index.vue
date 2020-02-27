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
          <el-table-column prop="showPrice" width="130" sortable label="显示价(￥)">
            <template slot-scope="scope">{{ setShowPrice(scope.row.showPrice) }}</template>
          </el-table-column>
          <el-table-column prop="rank" width="100" sortable align="center" label="排序">
            <template slot-scope="scope">
              {{scope.row.rank}}
              <el-button type="text" @click="changeGoodsRank(scope.row)">修改排序</el-button>
            </template>
          </el-table-column>
          <el-table-column column-key="publishTime" width="210" align="center" label="推荐时间">
            <template slot-scope="scope">{{ setPulishTime(scope.row.publishTime) }}</template>
          </el-table-column>
          <el-table-column prop="address" fixed="right" label="操作" width="120">
            <template slot-scope="scope">
              <el-button type="text" @click="cancelRecommend(scope.row)">取消推荐</el-button>
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
  </el-container>
</template>

<script>
import { recommendList, updateRecommendRank } from "../createGoods/controller/request";
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
      isShowSku: false,
      isUpdateSku: false,
      skuCountLoad: false,
      skuCountData: [],
      skuCountHead: [],
      skuCountDial: false,
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
    }
  },
  methods: {
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

              const data = await updateRecommendRank({
                goodsId: item.id,
                rank: instance.inputValue,
                recommendType: 2
              });
              this.isLoading = false;
              if (data.code !== STATUS_CODE.success) {
                errorMsg(this, data.msg);
                return;
              }
              successMsg(this, "操作成功");
              this.getGoodsList();
              done();
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
        pageSize: this.page.pageSize,
        recommendType: 2
      };
      const data = await recommendList(params);
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
     * 取消推荐
     * @param {Object} item
     * @param {Number} status
     * @returns {void}
     */
    cancelRecommend(item) {
      if (!item) {
        return new Error("位置错误：!status || !item");
      }
      this.$confirm(`确定要取消推荐商品【${item.name}】？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          this.isLoading = true;
          this.interceptorFn(async () => {
            const data = await updateRecommendRank({
              goodsId: parseInt(item.id),
              rank: -1,
              recommendType: 2
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
