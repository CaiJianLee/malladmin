<template>
  <el-container class="layout">
    <el-header height="50px" class="layout-title-box">
      <div class="titles">{{ route.meta.title }}</div>
      <div class="operation">
        <el-button size="medium" type="primary" icon="el-icon-refresh" @click="getGoodsCategoryList">刷新表格</el-button>
        <!-- <el-button size="medium" type="primary" icon="el-icon-plus" @click="changeGoodsCategory">新增分类</el-button> -->
      </div>
    </el-header>
    <el-main class="layout-content">
      <el-card shadow="never" body-style="border: 0;">
        <el-table
          :tree-props="{ children: 'children' }"
          row-key="id"
          v-loading="isLoading"
          header-row-class-name="goodsTable"
          :data="tableData"
          size="medium"
          style="width: 100%"
        >
          <el-table-column
            prop="name"
            label="商品分类名称"
            show-overflow-tooltip
          ></el-table-column>
          <el-table-column prop="rank" label="排序"></el-table-column>
          <el-table-column prop="statusName" label="显示状态"></el-table-column>
          <el-table-column prop="address" label="操作" width="200">
            <template slot-scope="scope">
              <el-button v-if="scope.row.level === 1" type="text" @click="changeGoodsCategory(scope.row)">新增子类</el-button>
              <el-button type="text" @click="changeGoodsCategory(scope.row, 'edit')">编辑</el-button>
              <el-button type="text" v-if="scope.row.status === 1" @click="updateStatus(scope.row, 2)">下架</el-button>
              <el-button type="text" v-else @click="updateStatus(scope.row, 1)">上架</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>
      <!-- <div class="content-pagination">
        <el-pagination
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="page.currentPage"
          :page-sizes="pageSizes"
          :page-size="page.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="page.total"
        >
        </el-pagination>
      </div> -->
    </el-main>
  </el-container>
</template>

<script>
import * as toast from "@/commonutils/common";
import * as request from "./request";

export default {
  name: "index",
  data() {
    return {
      pageSizes: JSON.parse(process.env.VUE_APP_PAGE_SIZE),
      status: {
        // 请求状态码
        success: parseInt(process.env.VUE_APP_BASE_SUCC_CODE),
        tokenError: parseInt(process.env.VUE_APP_BASE_ERR_TOKEN_CODE)
      },
      isLoading: false,
      tableData: [],
      filter: {
        searchKey: "",
        category: ""
      },
      page: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      }
    };
  },
  computed: {
    route() {
      return this.$route;
    }
  },
  methods: {
    /**
     * 获取商品分类列表
     * @returns {Promise<void>} void
     */
    async getGoodsCategoryList() {
      this.isLoading = true;
      const data = await request.getGoodsCategory({
        isAll: true
      });
      this.isLoading = false;
      if (data.code !== toast.STATUS_CODE.success) {
        toast.errorMsg(this, data.msg);
        return;
      }
      this.page.total = data.result.count;
      this.tableData = data.result.list;
    },
    /**
     * 翻页
     * @param {String} val
     * @returns {Promise<void>} void
     */
    handleCurrentChange(val) {
      this.page.currentPage = val;
      this.getGoodsCategoryList();
    },
    /**
     * 设置页数
     * @param {String} val
     * @returns {Promise<void>} void
     */
    handleSizeChange(val) {
      this.page.currentPage = 1;
      this.page.pageSize = val;
      this.getGoodsCategoryList();
    },
    //校验编辑名称
    editName(name) {
      if (name.length > 10) {
        return "分类名称不能超过10个字符";
      }
    },
    /**
     * 编辑商品分类
     * @param {Object} item
     * @param {Object} type
     * @returns {void}
     */
    changeGoodsCategory(item, type) {
      const isType = Boolean(type === "edit")
      this.$prompt("分类名称：", `${isType ? "编辑" : "新增"}分类`, {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /\S/,
        inputValidator: this.editName,
        inputValue: isType ? item.name : undefined,
        inputErrorMessage: "分类名称不能为空",
        beforeClose: (action, instance, done) => {
          if (action === "confirm") {
            let valueOld = item.name;
            let valueNew = instance.inputValue;
            if (valueNew === valueOld) {
              done();
            } else {
              this.interceptorFn(async () => {
                this.isLoading = true;
                const data = await request.setGoodsCategory({
                  fatherId: isType ? item.fatherId : item.id,
                  rank: item.rank,
                  name: valueNew,
                  id: isType ? item.id : undefined
                });
                this.isLoading = false;
                if (data.code !== toast.STATUS_CODE.success) {
                  toast.errorMsg(this, data.msg);
                  return;
                }
                done();
                this.getGoodsCategoryList();
              });
            }
          } else {
            done();
          }
        }
      })
        .then(({ value }) => {
          toast.successMsg(this, isType ? "编辑成功" : "创建成功");
        })
        .catch(() => {});
    },
    /**
     * 修改商品分类状态
     * @param {Object} item
     * @param {Object} status
     * @returns {void}
     */
    updateStatus(item, status) {
      const statusName = status === 1 ? "上架" : "下架";
      this.$confirm(`确定要${statusName}分类【${item.name}】？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        beforeClose: (action, instance, done) => {
          if (action === "confirm") {
            this.interceptorFn(async () => {
              this.isLoading = true;
              const data = await request.updateStatus({
                id: item.id,
                status: status
              });
              this.isLoading = false;
              if (data.code !== this.status.success) {
                toast.errorMsg(this, data.msg);
                return;
              }
              done();
              this.getGoodsCategoryList();
            });
          } else {
            done();
          }
        }
      })
        .then(() => {
          toast.successMsg(this, "操作成功");
        })
        .catch(() => {});
    }
  },
  created() {
    this.getGoodsCategoryList();
  }
};
</script>

<style scoped lang="scss">
/*.layout-title-box {*/
/*  !*margin-top: 10px;*!*/
/*  .titles {*/
/*    font-size: 20px;*/
/*  }*/
/*  display: flex;*/
/*  justify-content: space-between;*/
/*}*/
</style>
