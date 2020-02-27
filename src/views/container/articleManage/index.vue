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
          <label>关键字</label>
          <el-input
            v-model="filter.keyword"
            clearable
            placeholder="请输入标题或创建人搜索"
            style="width: 210px;"
          ></el-input>
        </div>
        <div class="filter-item">
          <label>内容分类</label>
          <el-select v-model="filter.type" style="width: 150px" placeholder="请选择">
            <el-option
              :title="item.name"
              v-for="item in contentTypeList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </div>
        <div class="filter-item">
          <label>状态</label>
          <el-select v-model="filter.status" style="width: 150px" placeholder="请选择">
            <el-option
              :title="item.name"
              v-for="item in statusList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </div>
        <div class="filter-item btnItem">
          <el-button type="primary" @click="filterData">查询</el-button>
        </div>
        <div class="filter-item btnItem">
          <el-button type="info" @click="restFilter">重置</el-button>
        </div>
      </div>
      <div class="operation">
        <el-button
          size="medium"
          type="primary"
          icon="el-icon-refresh"
          @click="getGoodsList"
        >
          刷新表格
        </el-button>
        <el-button
          size="medium"
          type="primary"
          icon="el-icon-plus"
          @click="createArticle"
        >
          新增内容
        </el-button>
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
          <el-table-column prop="title" label="标题">
            <template slot-scope="scope">
              <div class="tooltip" :title="scope.row.title">
                {{ scope.row.title }}
              </div>
            </template>
          </el-table-column>
          <el-table-column align="center" prop="typeName" label="分类">
          </el-table-column>
          <el-table-column align="center" label="描述">
            <template slot-scope="scope">
              <div :title="scope.row.describe" class="goods-group-box">
                {{ scope.row.describe }}
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="date" align="center" label="封面图">
            <template slot-scope="scope">
              <span>
                <el-image
                  style="width: 40px; height: 40px; vertical-align: middle"
                  :src="scope.row.cover"
                  title="点击预览"
                  fit="cover"
                  :preview-src-list="[scope.row.cover]"
                >
                  <div slot="error" class="image-slot" title="暂无内容主图">
                    <img :src="noImg" width="40" />
                  </div>
                  <div slot="placeholder" class="image-slot">
                    <font size="1">load</font>
                    <span class="el-icon-loading"></span>
                  </div>
                </el-image>
              </span>
            </template>
          </el-table-column>
          <el-table-column
            column-key="createTime"
            align="center"
            label="创建时间"
          >
            <template slot-scope="scope">
              {{ setPulishTime(scope.row.createTime) }}
            </template>
          </el-table-column>
          <el-table-column align="center" label="状态">
            <template slot-scope="scope">
              <span :style="{ color: setFontColor(scope.row.statusName) }">{{
                scope.row.statusName
              }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="address" label="操作" width="100">
            <template slot-scope="scope">
              <el-button type="text" @click="edit(scope.row)">编辑</el-button>
              <el-button
                type="text"
                v-if="scope.row.status === 1"
                @click="setStatus(scope.row, '下架')"
                >下架</el-button
              >
              <el-button type="text" v-else @click="setStatus(scope.row, '上架')"
                >上架</el-button
              >
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
        >
        </el-pagination>
      </div>
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
import noImg from "@/assets/images/noImg.jpg";
import { getContentList, contentTypeList, updateStatus } from "./request";

export default {
  name: "index",
  data() {
    return {
      pageSizes: JSON.parse(process.env.VUE_APP_PAGE_SIZE),
      noImg: noImg,
      isLoading: false,
      tableData: [],
      filter: {
        keyword: "",
        status: 0,
        type: 0
      },
      page: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      statusList: [
        {
          name: "全部",
          id: 0
        },
        {
          name: "上架",
          id: 1
        },
        {
          name: "下架",
          id: 2
        }
      ],
      contentTypeList: contentTypeList
    };
  },
  computed: {
    /**
     * 路由信息
     * @returns {Route} 路由信息
     */
    route() {
      return this.$route;
    },
    /**
     * 设置状态颜色
     * @returns {String} color
     */
    setFontColor() {
      return val => {
        switch (val) {
          case "已上架":
            return "#26AF61";
          case "已下架":
            return "#999";
          default:
            return "#333";
        }
      };
    }
  },
  methods: {
    /**
     * 根据条件查询内容
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
      this.filter.keyword = "";
      this.filter.type = 0;
      this.page.currentPage = 1;
      this.page.pageSize = 10;
      this.getGoodsList();
    },
    /**
     * 根据条件获取内容列表
     * @returns {Promise<void>} 所有内容列表
     */
    async getGoodsList() {
      this.isLoading = true;
      const params = {
        keyword: this.filter.keyword ? this.filter.keyword : undefined,
        status: this.filter.status !== 0 ? this.filter.status : undefined,
        type: this.filter.type !== 0 ? this.filter.type : undefined,
        page: this.page.currentPage,
        pageSize: this.page.pageSize
      };
      const data = await getContentList(params);
      this.isLoading = false;
      if (data.code !== STATUS_CODE.success) {
        errorMsg(this, data.msg);
        return;
      }
      this.tableData = jsonDeepClone(data.result.list);
      this.page.total = data.result.count;
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
     * 创建内容，转跳页面
     * @returns {void}
     */
    createArticle() {
      this.$router.push({
        path: "/ArticleManage/CreateArticle",
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
        name: "CreateArticle",
        query: {
          title_: this.route.meta.title,
          path_: this.route.path,
          contentId: item.id
        }
      });
    },
    /**
     * 变更内容状态
     * @param {Object} item
     * @param {String} type
     * @returns {void}
     */
    setStatus(item, type) {
      this.$confirm(`确定要${type}内容【${item.title}】？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          this.isLoading = true;
          this.interceptorFn(async () => {
            const data = await updateStatus({
              id: parseInt(item.id),
              status: type === "下架" ? 2 : 1
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
.goods-group-box {
  text-overflow: -o-ellipsis-lastline;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
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
