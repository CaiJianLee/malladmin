<template>
  <el-container class="layout">
    <el-header height="50px" class="layout-title-box">
      <div class="titles">{{ route.meta.title }}</div>
    </el-header>
    <el-header style="min-height: 42px; height: auto" class="layout-title-box layout-title-filter">
      <div class="filter">
        <div class="filter-item">
          <label>广告名称</label>
          <el-input v-model="filter.name" clearable placeholder="请输入关键字搜索" style="width: 210px;" />
        </div>
        <div class="filter-item">
          <label>广告位置</label>
          <el-select style="width: 150px" v-model="filter.position" placeholder="请选择">
            <el-option
              :title="item.name"
              style="width: 217px"
              v-for="item in contentCategoryList"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            ></el-option>
          </el-select>
        </div>
        <div class="filter-item">
          <label>注册时间</label>
          <el-date-picker
            v-model="filter.orderTime"
            type="daterange"
            unlink-panels
            :picker-options="pickerOptions"
            value-format="timestamp"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          ></el-date-picker>
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
          @click="getBannerListData"
        >刷新表格</el-button>
        <el-button
          size="medium"
          type="primary"
          icon="el-icon-plus"
          @click="showAddDialog = true"
        >新增广告</el-button>
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
          <el-table-column prop="name" label="广告名称">
            <template slot-scope="scope">
              <div class="tooltip" :title="scope.row.name">{{ scope.row.name }}</div>
            </template>
          </el-table-column>
          <el-table-column align="center" label="广告链接">
            <template slot-scope="scope">
              <div :title="scope.row.linkUrl" class="tooltip">{{ scope.row.linkUrl }}</div>
            </template>
          </el-table-column>
          <el-table-column prop="date" align="center" width="100" label="广告图片">
            <template slot-scope="scope">
              <span>
                <el-image
                  style="width: 40px; height: 40px; vertical-align: middle"
                  :src="scope.row.picture"
                  title="点击预览"
                  fit="cover"
                  :preview-src-list="[scope.row.picture]"
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
          <el-table-column column-key="createTime" align="center" label="创建时间">
            <template slot-scope="scope">{{ setPulishTime(scope.row.createTime) }}</template>
          </el-table-column>
          <el-table-column column-key="startDate" align="center" label="开始时间">
            <template slot-scope="scope">{{ setPulishTime(scope.row.startDate) }}</template>
          </el-table-column>
          <el-table-column column-key="endDate" align="center" label="结束时间">
            <template slot-scope="scope">{{ setPulishTime(scope.row.endDate) }}</template>
          </el-table-column>
          <el-table-column align="center" width="90" prop="position" label="广告位置">
            <template slot-scope="scope">
              {{
              contentCategoryList.filter(item => {
              return item.id === scope.row.position;
              })[0].name
              }}
            </template>
          </el-table-column>
          <el-table-column width="90" align="center" label="状态">
            <template slot-scope="scope">
              <span :style="{ color: setFontColor(scope.row.statusName) }">
                {{
                scope.row.statusName
                }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="90">
            <template slot-scope="scope">
              <template v-if="scope.row.statusName !== '已结束'">
                <el-button type="text" @click="edit(scope.row)">编辑</el-button>
                <el-button
                  type="text"
                  v-if="scope.row.status !== 2"
                  @click="setBannerStatus(scope.row, 2)"
                >上架</el-button>
                <el-button
                  type="text"
                  v-else-if="scope.row.status !== 1"
                  @click="setBannerStatus(scope.row, 4)"
                >下架</el-button>
              </template>
              <template v-else>-</template>
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
      :before-close="isClose"
      :title="bannerForm.id ? '编辑广告' : '新增广告'"
      width="580px"
      destroy-on-close
      :visible.sync="showAddDialog"
      :close-on-click-modal="false"
      class="add-good-dialog"
    >
      <div class="banner-main">
        <el-form
          v-loading="formIsLoading"
          :model="bannerForm"
          size="medium"
          :rules="rules"
          ref="bannerForm"
          label-width="80px"
          class="demo-ruleForm"
        >
          <el-form-item label="广告位置" prop="position">
            <el-select
              v-model="bannerForm.position"
              :disabled="!!bannerForm.id"
              placeholder="请选择"
            >
              <el-option
                :title="item.name"
                style="width: 217px"
                v-for="item in contentCategoryList"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="广告图片" prop="picture">
            <image-upload :image.sync="bannerForm.picture" :size="imageSize" />
          </el-form-item>
          <!-- <el-form-item :label="bannerForm.position === 3 ? '视频封面' : '广告图片'" prop="picture">
            <image-upload :image.sync="bannerForm.picture" :size="imageSize" />
          </el-form-item>
          <el-form-item v-if="bannerForm.position === 3" label="视频" prop="video">
            <video-upload :video.sync="bannerForm.video" :size="{ width: 1440, height: 600 }" />
          </el-form-item> -->
          <el-form-item label="广告名称" prop="name">
            <el-input
              style="width: 400px;"
              maxlength="30"
              v-model="bannerForm.name"
            />
          </el-form-item>
          <el-form-item label="广告链接" prop="linkUrl">
            <el-input style="width: 400px;" maxlength="50" v-model="bannerForm.linkUrl" />
          </el-form-item>
          <el-form-item label="时间" prop="orderTime">
            <el-date-picker
              :editable="false"
              v-model="bannerForm.orderTime"
              :picker-options="bannerPickerOptions"
              type="datetimerange"
              unlink-panels
              value-format="timestamp"
              range-separator="至"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            ></el-date-picker>
          </el-form-item>
        </el-form>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isClose('')">取 消</el-button>
        <el-button type="primary" @click="putBannerForm">确 定</el-button>
      </span>
    </el-dialog>
  </el-container>
</template>

<script>
import {
  getBannerList,
  createdBanner,
  getBannerInfo,
  updateBanner
} from "./request";
import {
  successMsg,
  jsonDeepClone,
  STATUS_CODE,
  errorMsg,
  dataFormat,
  warningMsg
} from "@/commonutils/common";
import noImg from "@/assets/images/noImg.jpg";
import { mapState } from "vuex";
import imageUpload from "@/components/imageUpload";
import videoUpload from "@/components/videoUpload";

export default {
  name: "index",
  components: {
    imageUpload,
    videoUpload
  },
  data() {
    const checkUrl = (rule, value, callback) => {
      // if (!value) {
      //   return callback(new Error("请输入广告链接"));
      // }
      if (
        value &&
        !/[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+\.?/.test(
          value
        )
      ) {
        callback(new Error("链接地址不正确"));
      } else {
        callback();
      }
    };
    return {
      bannerPickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
          // return time.getTime() < Date.now() - 3600 * 1000 * 24;
        }
      },
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
      showAddDialog: false,
      pageSizes: JSON.parse(process.env.VUE_APP_PAGE_SIZE),
      noImg: noImg,
      formIsLoading: false,
      isLoading: false,
      tableData: [],
      rules: {
        name: [
          { required: true, message: "请输入广告名称", trigger: "change" },
          {
            min: 2,
            max: 30,
            message: "长度在 2 到 20 个字符",
            trigger: "change"
          }
        ],
        position: [
          { required: true, message: "请选择广告位置", trigger: "change" }
        ],
        picture: [
          { required: true, message: "请上传广告图片", trigger: "change" }
        ],
        video: [{ required: true, message: "请上传视频", trigger: "change" }],
        linkUrl: [{ validator: checkUrl, trigger: "change" }],
        orderTime: [
          { required: true, message: "请选择广告时间", trigger: "blur" }
          // { validator: checkTime, trigger: "change" }
        ]
      },
      bannerForm: {
        position: "",
        name: "",
        picture: "",
        linkUrl: "",
        orderTime: [],
        endDate: "",
        startDate: "",
        video: ""
      },
      filter: {
        name: "",
        position: 0,
        orderTime: [],
        begin: "",
        end: ""
      },
      page: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      contentCategoryList: JSON.parse(process.env.VUE_APP_PAGE_BANNER_POSITION)
    };
  },
  computed: {
    imageSize() {
      // 如果选择banner广告，尺寸切换为1440x550
      if (this.bannerForm.position === 1) {
        return {
          width: 1920,
          height: 550
        };
      } else if (
        this.bannerForm.position === 2 ||
        this.bannerForm.position === 3
      ) {
        // 如果选择首页广告位，尺寸切换为1180*340
        return {
          width: 1180,
          height: 340
        };
      } else {
        // 其他类型为1920*400
        return {
          width: 1920,
          height: 400
        };
      }
    },
    /**
     * 路由信息
     * @returns {Route} 路由信息
     */
    route() {
      return this.$route;
    },
    ...mapState(["user", "aliyunOss"]),
    /**
     * 设置状态颜色
     * @returns {String} color
     */
    setFontColor() {
      return val => {
        switch (val) {
          case "进行中":
            return "#26AF61";
          case "已下架":
            return "#999";
          case "已结束":
            return "#ff7736";
          default:
            return "#333";
        }
      };
    }
  },
  watch: {
    imageSize: {
      handler() {
        this.$set(this.bannerForm, "picture", "");
      },
      immediate: true
    }
  },
  methods: {
    /**
     * 保存广告banner编辑
     * @returns {Promise<Object>} 返回是否上传状态
     */
    putBannerForm() {
      this.$refs["bannerForm"].validate(async valid => {
        if (!valid) {
          return;
        }
        const params = jsonDeepClone(this.bannerForm);
        if (params.orderTime[0] < Date.now()) {
          warningMsg(this, "开始时间不能小于当前时间,请重新设置开始时间");
          return;
        }
        if (params.orderTime[1] - params.orderTime[0] <= 3600 * 1000) {
          warningMsg(this, "开始时间/结束时间，间隔不能小于一小时");
          return;
        }
        const { code, msg } = await createdBanner({
          picture: params.picture || undefined,
          position: params.position,
          name: params.name,
          linkType: params.linkType || undefined,
          isJump: params.isJump || undefined,
          keepTime: params.keepTime || undefined,
          startDate: parseInt(params.orderTime[0] / 1000),
          endDate: parseInt(params.orderTime[1] / 1000),
          id: params.id,
          video: params.position !== 3 ? undefined : params.video,
          linkUrl: params.linkUrl
        });
        if (code !== STATUS_CODE.success) {
          errorMsg(this, msg);
          return;
        }
        successMsg(this, "操作成功");
        this.showAddDialog = false;
        this.bannerForm = {
          id: undefined,
          position: "",
          name: "",
          picture: "",
          linkUrl: "",
          endDate: "",
          orderTime: [],
          startDate: ""
        };
        this.getBannerListData();
      });
    },
    /**
     * 关闭广告弹窗
     * @param {Function}done
     * @returns {void}
     */
    isClose(done) {
      if (
        !this.bannerForm.position &&
        !this.bannerForm.name &&
        !this.bannerForm.picture &&
        !this.bannerForm.linkUrl &&
        !this.bannerForm.orderTime.length
      ) {
        if (done) {
          done();
        } else {
          this.showAddDialog = false;
        }
        return;
      }
      this.$confirm(`内容还未保存，是否放弃编辑并退出？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          if (done) {
            done();
          } else {
            this.showAddDialog = false;
          }
          this.bannerForm = {
            position: "",
            name: "",
            picture: "",
            linkUrl: "",
            endDate: "",
            orderTime: [],
            startDate: ""
          };
          if (this.client) {
            try {
              this.client.cancel();
            } catch (e) {
              new Error(e);
            }
          }
        })
        .catch(() => {});
    },
    /**
     * 根据条件查询内容
     * @returns {void}
     */
    filterData() {
      this.page.currentPage = 1;
      this.page.pageSize = 10;
      this.getBannerListData();
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
      this.filter.name = "";
      this.filter.position = 0;
      this.filter.orderTime = [];
      this.page.currentPage = 1;
      this.page.pageSize = 10;
      this.getBannerListData();
    },
    /**
     * 根据条件获取内容列表
     * @returns {Promise<void>} 所有内容列表
     */
    async getBannerListData() {
      this.isLoading = true;
      const params = {
        name: this.filter.name || undefined,
        begin:
          this.filter.orderTime && this.filter.orderTime[0]
            ? parseInt(this.filter.orderTime[0] / 1000)
            : undefined,
        end:
          this.filter.orderTime && this.filter.orderTime[1]
            ? parseInt(this.filter.orderTime[1] / 1000)
            : undefined,
        position: this.filter.position || undefined,
        page: this.page.currentPage,
        pageSize: this.page.pageSize
      };
      const data = await getBannerList(params);
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
      this.getBannerListData();
    },
    /**
     * 设置页数
     * @param {Number} val
     * @returns {void}
     */
    handleSizeChange(val) {
      this.page.currentPage = 1;
      this.page.pageSize = val;
      this.getBannerListData();
    },
    /**
     * 编辑分组
     * @param {Object}item
     * @returns {void}
     */
    async edit(item) {
      this.showAddDialog = true;
      this.formIsLoading = true;
      const { code, msg, result } = await getBannerInfo({
        id: item.id
      });
      this.formIsLoading = false;
      if (code !== STATUS_CODE.success) {
        errorMsg(this, msg);
        return;
      }
      const bannerInfo = jsonDeepClone(result.advance);
      this.bannerForm = {
        id: bannerInfo.id,
        position: bannerInfo.position,
        name: bannerInfo.name,
        video: bannerInfo.video,
        picture: bannerInfo.picture,
        linkUrl: bannerInfo.linkUrl,
        orderTime: [bannerInfo.startDate * 1000, bannerInfo.endDate * 1000]
      };
    },
    /**
     * 修改广告状态
     * @param {Object} item
     * @returns {void}
     */
    setBannerStatus(item, status) {
      let statusName = "下架";
      if (status === 4) {
        statusName = "下架";
      } else if (status === 2) {
        statusName = "上架";
      }
      this.$confirm(`确定要${statusName}广告【${item.name}】？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          this.isLoading = true;
          this.interceptorFn(async () => {
            const data = await updateBanner({
              id: item.id,
              status: status
            });
            this.isLoading = false;
            if (data.code !== STATUS_CODE.success) {
              errorMsg(this, data.msg);
              return;
            }
            successMsg(this, "操作成功");
            this.getBannerListData();
          });
        })
        .catch(() => {});
    }
  },
  created() {
    this.getBannerListData();
  }
};
</script>

<style scoped lang="scss">
.avatar-uploader {
  height: auto;
  .el-upload--picture-card {
    width: 400px;
    height: auto;
    min-height: 140px;
    line-height: 1.5;
    font-size: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    .upload-tip {
      display: flex;
      align-items: center;
      flex-flow: column;
      color: #8c939d;
      width: 100%;
      &.progress {
        position: absolute;
        width: 400px;
        height: 100%;
        flex-flow: nowrap;
        top: 0;
        left: 0;
        z-index: 1;
      }
      .el-progress {
        width: 85%;
        margin: 0 10px 0 17px;
      }
    }
    > div {
      font-size: 14px;
    }
    .article-img {
      line-height: 140px;
    }
    > i {
      line-height: 148px;
    }
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
