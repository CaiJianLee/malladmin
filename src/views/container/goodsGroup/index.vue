<template>
  <el-container class="goods-group-container">
    <el-header height="50px" class="layout-title-box">
      <div class="titles">{{ route.meta.title }}</div>
      <div class="operation">
        <el-button
          size="medium"
          type="primary"
          icon="el-icon-refresh"
          @click="getTableData"
          >刷新表格
        </el-button>
        <el-button
          size="medium"
          type="primary"
          icon="el-icon-plus"
          @click="addGroup"
          >新增标签
        </el-button>
      </div>
    </el-header>
    <el-main class="layout-content">
      <el-card shadow="never" body-style="border: 0;">
        <el-table
          v-loading="isLoading"
          header-row-class-name="goodsTable"
          :data="tableData"
          size="medium"
          style="width: 100%"
        >
          <el-table-column prop="name" label="商品标签名称"></el-table-column>
          <!-- <el-table-column prop="rank" label="标签权重">
            <template slot-scope="scope">
              <div class="weight">
                <el-input
                  maxlength="2"
                  v-model="weightData[scope.$index]"
                  class="weight-input"
                  @focus="setWeight(scope.row)"
                ></el-input>
                <i
                  v-if="scope.row.id == activeData.id && showButton"
                  class="iconfont icon-queding"
                  @click="handleSetWeight(scope.row, scope.$index)"
                ></i>
                <i
                  v-if="scope.row.id == activeData.id && showButton"
                  class="iconfont icon-shanchu1"
                  @click="handleClearWeight(scope.row, scope.$index)"
                ></i>
              </div>
            </template>
          </el-table-column> -->
          <el-table-column prop="goodsCount" class-name="fontCenter" label="商品数量"></el-table-column>
          <el-table-column prop="id" label="操作" width="200">
            <template slot-scope="scope">
              <el-button
                type="text"
                @click="handleEdit(scope.row, scope.$index)"
                >编辑</el-button
              >
              <el-button type="text" @click="goConfig(scope.row)"
                >配置</el-button
              >
              <el-button
                type="text"
                @click="handleDelete(scope.row, scope.$index)"
                >删除</el-button
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
          :current-page="page"
          :page-sizes="pageSizes"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="count"
        >
        </el-pagination>
      </div>
    </el-main>
  </el-container>
</template>

<script>
import { errorMsg, successMsg, STATUS_CODE } from "@/commonutils/common";
import { reqGetGoodsGroup, reqEditGroup, reqDeleteGroup } from "./request";
import Vue from "vue";
// import {interceptor} from "@/mixins/interceptor";

export default {
  // mixins: [interceptor],
  created() {
    this.getTableData();
  },
  data() {
    return {
      tableData: [], //标签数据
      activeData: {}, //需要操作的数组
      weightData: [], //权重数组
      showButton: false,
      page: 1,
      pageSize: 10,
      isLoading: false,
      pageSizes: JSON.parse(process.env.VUE_APP_PAGE_SIZE),
      count: 0 //数据数目
    };
  },
  methods: {
    //得到数据
    async getTableData() {
      this.isLoading = true;
      const respond = await reqGetGoodsGroup(this.page, this.pageSize);
      const { code, msg, result } = respond;
      if (code === STATUS_CODE.success) {
        this.tableData = result.list;
        this.weightData = this.tableData.map(item => item.rank);
        this.count = result.count;
      } else if (code !== STATUS_CODE.tokenError) {
        errorMsg(this, msg);
      }
      this.isLoading = false;
    },

    //配置跳转到页
    goConfig(value) {
      this.interceptorFn(() => {
        this.$router.push({
          path: "/goodsGroup/configGroup",
          query: {
            id: value.id,
            name: value.name,
            breadTitle: this.route.meta.title
          }
        });
      });
    },
    setWeight(value) {
      //权重获取焦点
      this.activeData = value;
      this.showButton = true;
    },
    handleClearWeight(value, $index) {
      //放弃设置权重
      Vue.set(this.weightData, $index, value.rank);
      this.showButton = false;
    },
    handleSetWeight(value, $index) {
      //设置权重
      this.interceptorFn(async () => {
        let reg = /^\d+$/;
        let weight = this.weightData[$index];
        if (reg.test(weight)) {
          if (weight !== this.tableData[$index].rank) {
            this.tableData[$index].rank = weight;
            let params = {
              id: Number(this.activeData.id),
              rank: Number(weight),
              name: value.name
            };
            const respond = await reqEditGroup(params);
            const { code, msg } = respond;
            if (code === STATUS_CODE.success) {
              successMsg(this, "设置成功");
              this.page = 1;
              this.getTableData();
            } else if (code !== STATUS_CODE.tokenError) {
              errorMsg(this, msg);
            }
          }
          this.showButton = false;
        } else {
          errorMsg(this, "请输入正确值");
          Vue.set(this.weightData, $index, value.rank);
        }
      });
    },
    addGroup() {
      //新增分类
      this.$prompt("标签名称：", "新增标签", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPattern: /\S/,
        inputValidator: this.editName,
        confirmButtonClass: "",
        inputErrorMessage: "分类名称不能为空",
        beforeClose: async (action, instance, done) => {
          if (action === "confirm") {
            let params = {
              name: instance.inputValue
            };
            const editResult = await this.changeGoodsGroup(params);
            if (editResult) {
              done();
            }
          } else {
            done();
          }
        }
      })
        .then(() => {
          successMsg(this, "添加成功");
          this.page = 1;
          this.getTableData();
        })
        .catch(() => {});
    },
    async changeGoodsGroup(params) {
      //添加或编辑接口
      const respond = await reqEditGroup(params);
      const { code, msg } = respond;
      if (code === STATUS_CODE.success) {
        return true;
      } else if (code !== STATUS_CODE.tokenError) {
        errorMsg(this, msg);
      }
    },
    handleEdit(value, $index) {
      //编辑标签
      this.$prompt("标签名称：", "编辑标签", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputValue: value.name,
        inputPattern: /\S/,
        inputValidator: this.editName,
        confirmButtonClass: "",
        inputErrorMessage: "分类名称不能为空",
        beforeClose: (action, instance, done) => {
          this.interceptorFn(async () => {
            if (action === "confirm") {
              let valueOld = value.name;
              let valueNew = instance.inputValue;
              if (valueNew === valueOld) {
                done();
              } else {
                let params = {
                  id: Number(value.id),
                  name: valueNew,
                  rank: value.rank
                };
                const editResult = await this.changeGoodsGroup(params);
                if (editResult) {
                  this.tableData[$index].name = valueNew;
                  done();
                }
              }
            } else {
              done();
            }
          });
        }
      })
        .then(() => {
          // this.tableData[$index].name = groupName.name;
          successMsg(this, "编辑成功");
        })
        .catch(() => {});
    },
    //校验编辑名称
    editName(name) {
      if (name.length > 10) {
        return "不能超过10个字符";
      }
    },
    handleDelete(value) {
      this.$confirm("确定删除该标签吗", "删除标签", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          //删除该标签
          this.interceptorFn(async () => {
            let id = Number(value.id);
            const respond = await reqDeleteGroup(id);
            const { code, msg } = respond;
            if (code === STATUS_CODE.success) {
              successMsg(this, "删除成功");
              this.getTableData();
            } else if (code !== STATUS_CODE.tokenError) {
              errorMsg(this, msg);
            }
          });
        })
        .catch(() => {
          // successMsg(this,'已取消删除')
        });
    },
    handleSizeChange(value) {
      //更换pageSize触发
      this.pageSize = value;
      this.page = 1;
      this.getTableData();
    },
    handleCurrentChange(value) {
      //改变page触发
      this.page = value;
      this.getTableData();
    }
  },
  computed: {
    route() {
      return this.$route;
    }
  }
};
</script>

<style scoped lang="scss"></style>
<style lang="scss">
.weight {
  display: flex;
  align-items: center;

  .weight-input {
    width: 64px;

    .el-input__inner {
      text-align: center;
      border-color: transparent;
      height: 36px;
      line-height: 36px;
      -webkit-transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);
      transition: border-color 0.2s cubic-bezier(0.645, 0.045, 0.355, 1);

      &:focus {
        border-color: #e5e5e5;
        text-align: center;
      }
    }
  }

  .iconfont {
    font-size: 24px;
    cursor: pointer;
  }

  .icon-queding {
    color: #26af61;
    margin-left: 10px;
    margin-right: 6px;
  }
}
</style>
