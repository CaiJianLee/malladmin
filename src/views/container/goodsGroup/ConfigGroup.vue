<template>
  <div class="config-group-container">
    <el-header height="50px" class="layout-title-box config-header">
      <el-breadcrumb separator="/" class="breadcrumb">
        <el-breadcrumb-item :to="{ path: '/goodsGroup' }" class="breadcrumb-group">{{breadTitle}}</el-breadcrumb-item>
        <el-breadcrumb-item class="breadcrumb-config">{{route.meta.title}}</el-breadcrumb-item>
      </el-breadcrumb>
    </el-header>
    <div class="config-header">
      <div class="config-name">
          <span>{{name}}</span>
        <div>
          <el-button size="medium" type="primary" icon="el-icon-refresh" @click="getGoodsList">刷新表格</el-button>
          <el-button size="medium" type="primary" icon="el-icon-plus" @click="addGood">添加商品</el-button>
        </div>
      </div>
    </div>
    <el-main class="layout-content">
      <el-card shadow="never" body-style="border: 0;">
        <el-table
          v-loading="isLoading"
          header-row-class-name="goodsTable"
          :data="tableData"
          size="medium"
          style="width: 100%"
        >
          <el-table-column prop="name" label="商品名称">
            <template slot-scope="scope">
              <div class="tooltip" :title="scope.row.name">{{scope.row.name}}</div>
            </template>
          </el-table-column>
          <!-- <el-table-column prop="tags[0].rank" width="130" label="商品权重">
            <template slot-scope="scope">
              <div class="weight">
                <el-input
                  v-model="weightData[scope.$index]"
                  maxlength="2"
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
          <el-table-column prop="class.name" align="center" label="商品分类"></el-table-column>
          <el-table-column prop="tags[0].name" align="center" label="商品标签"></el-table-column>
          <el-table-column prop="firstPicture" align="center" label="商品主图">
            <template slot-scope="scope">
              <el-image
                style="width: 36px; height: 36px"
                :src="scope.row.firstPicture"
                :preview-src-list="[scope.row.firstPicture]">
                <div slot="error" class="image-slot" title="暂无商品主图">
                  <img :src="noImg" width="36" />
                </div>
              </el-image>
            </template>
            >
          </el-table-column>
          <el-table-column prop="publishTime" align="center" label="发布时间">
            <template slot-scope="scope">
              <span v-if="scope.row.publishTime && parseInt(scope.row.publishTime) !== 0">{{dataFormat(scope.row.publishTime)}}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="showPrice"  label="展示价(￥)"></el-table-column>
          <el-table-column prop="totalStockNum" label="总库存"></el-table-column>
          <el-table-column prop="id" width="90" label="操作">
            <template slot-scope="scope">
              <el-button type="text" @click="handleDelete(scope.row)">移出</el-button>
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
    <el-dialog title="添加商品标签" destroy-on-close :visible.sync="showAddDialog" :close-on-click-modal="false" class="add-good-dialog">
      <div class="good-search">
        <el-input placeholder="商品名称" v-model="searchName"></el-input>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
      </div>
      <div class="good-main" v-loading="tableLoading">
        <h2>所有商品</h2>
        <el-checkbox-group v-model="checkedArray" @change="handleCheckboxChange">
          <el-checkbox v-for="(item) in allGoodData" :key="item.id" :label="item.id" :disabled="item.isInGroup">{{item.name}}</el-checkbox>
        </el-checkbox-group>
        <div class="content-pagination">
          <el-pagination
            background
            @current-change="handleAllGoodsChagne"
            :current-page="goodsPage"
            :page-size="5"
            layout="total, prev, pager, next, jumper"
            :total="goodsCount"
          >
          </el-pagination>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="showAddDialog = false">取 消</el-button>
        <el-button type="primary" @click="handleAddGoods">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  import Vue from "vue";
  import {dataFormat} from '@/commonutils/common'
  import {errorMsg, successMsg, STATUS_CODE} from '@/commonutils/common'
  import { reqGetGoods, reqGetAllGoods, reqChangeGoods,reqChangeGoodsRank } from './request'

  export default {
    data() {
      return {
        name: '',//标签名称
        groupId: 0,//标签的id
        breadTitle: '',
        showAddDialog: false,
        tableData: [],//以添加的商品列表
        allGoodData: [],//所有的商品列表
        checkedArray: [],//已选商品数组
        searchName: '',//搜索名称
        weightData: [], //权重数组
        activeData: {}, //需要操作的数组
        showButton: false,
        page: 1,
        pageSize: 10,
        pageSizes: JSON.parse(process.env.VUE_APP_PAGE_SIZE),
        count: 0,//数据数目
        isLoading: false,
        goodsPage: 1,
        goodsPageSize: 5,
        goodsCount: 0,//数据数目
        tableLoading: false,
        noImg: require('@/assets/images/noImg.jpg'),
      }
    },
    computed: {
      route() {
        return this.$route;
      }
    },
    mounted() {
      const {id, name, breadTitle} = this.route.query;
      this.name = name;
      this.breadTitle = breadTitle;
      this.groupId = Number(id);
      this.getGoodsList()
    },
    methods: {
      dataFormat,
      //获取该标签的商品列表
      async getGoodsList() {
        this.isLoading = true;
        const {page,pageSize,groupId} = this;
        const respond = await reqGetGoods(page, pageSize, groupId)
        const {code,msg,result} = respond;
        if(code === STATUS_CODE.success) {
          const {count, list} = result;
          this.tableData = list;
          this.weightData = this.tableData.map(item => item.tags[0].rank);
          this.count = count;
        }else if(code !== STATUS_CODE.tokenError ) {
          errorMsg(this,msg)
        }
        this.isLoading = false;
      },
      handleAddGoods() {//添加调用
        this.interceptorFn(async () => {
          if(this.checkedArray.length>0) {
            let goodsId = this.checkedArray;
            let groupId = this.groupId
            const respond = await reqChangeGoods(goodsId, groupId)
            const {code, msg} = respond;
            if(code === STATUS_CODE.success) {
              successMsg(this,'添加成功')
              this.showAddDialog = false;
              this.page = 1;
              this.getGoodsList()
            }else if (code!== STATUS_CODE.tokenError) {
              errorMsg(this,msg)
            }
          } else {
            errorMsg(this,'您还未选择商品')
          }
        })
      },
      handleSearch() {//搜索
        this.interceptorFn(() => {
          //当前页置为1
          this.goodsPage = 1;
          //查询商品列表
          this.getAllGoodsList()
        })

      },
      handleCheckboxChange() {//多选框改变触发
      },
      // 移除
      handleDelete(value) {
        this.$confirm('确定移出该标签吗', '移出标签', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(() => {
          this.interceptorFn(async () => {
            //删除该商品
            let goodsId = [Number(value.id)];
            let groupId = this.groupId;
            let isOut = true;
            const respond = await reqChangeGoods(goodsId, groupId, isOut)
            const {code, msg} = respond;
            if(code === STATUS_CODE.success) {
              successMsg(this,'移出成功')
              //重新请求数据
              this.getGoodsList()
            }else if(code!== STATUS_CODE.tokenError) {
              errorMsg(this,msg)
            }
          })
        }).catch(() => {
          // successMsg(this,'已取消删除')
        })
      },
      //添加商品
      addGood() {
        this.interceptorFn(() => {
          console.log("searchName",this.searchName)
          this.searchName = '';
          this.checkedArray=[];
          this.showAddDialog = true;
          //获取所有商品
          this.goodsPage = 1;
          this.goodsPageSize = 5;
          this.getAllGoodsList()
        })
      },
      //获取所有商品
      async getAllGoodsList() {
        this.tableLoading = true;
        const {goodsPage, goodsPageSize, groupId, searchName} = this;
        let params = {
          page: goodsPage,
          pageSize: goodsPageSize,
          includeGroupId: groupId,
          name: searchName
        };
        const respond = await reqGetAllGoods(params);
        const {code, msg, result} = respond
        if(code === STATUS_CODE.success) {
          const {list, count} =result
          this.allGoodData = list;
          this.goodsCount = count;
        }else if(code!== STATUS_CODE.tokenError) {
          errorMsg(this,msg)
        }
        this.tableLoading = false;
      },
      handleClearWeight(value, $index) {
        //放弃设置权重
        console.log("value",value)
        Vue.set(this.weightData, $index, value.tags[0].rank);
        this.showButton = false;
      },
      handleSetWeight(value, $index) {
        //设置权重
        this.interceptorFn(async () => {
          let reg = /^\d+$/;
          let weight = this.weightData[$index];
          let oldRankGroup = this.tableData[$index].tags;
          let oldRank = oldRankGroup[0].rank;
          if (reg.test(weight)) {
            if (weight !== oldRank) {
              // this.tableData[$index].rank = weight;
              let params = {
                goodsId: Number(this.activeData.id),
                rank: Number(weight),
                groupId: this.groupId
              };
              const respond = await reqChangeGoodsRank(params);
              const { code, msg } = respond;
              if (code === STATUS_CODE.success) {
                successMsg(this, "设置成功");
                this.page = 1;
                this.getGoodsList();
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
      setWeight(value) {
        //权重获取焦点
        this.activeData = value;
        this.showButton = true;
      },
      handleAllGoodsChagne(value) {
        this.goodsPage = value;
        this.getAllGoodsList()
      },
      handleSizeChange(value) {
        this.pageSize = Number(value);
        this.page = 1;
        this.getGoodsList()
      },
      handleCurrentChange(value) {
        this.interceptorFn(()=> {
          this.page = Number(value);
          this.getGoodsList()
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  .config-group-container {
    .config-header {
      /*margin-top: 10px;*/
      padding: 0 20px;
      .breadcrumb {
        span {
          font-size: 24px;
        }

        .breadcrumb-group {
          color: #999;
        }

        .breadcrumb-config {
          color: #333;
        }
      }

      .config-name {
        /*margin-top: 30px;*/
        /*margin-bottom: 30px;*/
        display: flex;
        justify-content: space-between;
        align-items: center;
        > span {
          padding-left: 14px;
          border-left: 5px solid #26af61;
          display: inline-block;
          height: 22px;
          font-size: 18px;
          line-height: 22px;
          font-weight: bold;
          color: #333;
        }
      }
    }
  }

</style>
<style lang="scss">
  .config-group-container {
    /*.el-main {*/
    /*  padding: 0;*/
    /*}*/

    .el-image {
      .el-image-viewer__wrapper {
        .el-image-viewer__btn.el-image-viewer__close { //关闭按钮
          color: #fff;
        }

        .el-image-viewer__btn.el-image-viewer__actions { //操作

        }

        .el-image-viewer__canvas {
          img {
          }
        }
      }
    }
    /*添加商品弹框样式*/
    .add-good-dialog {
      .el-dialog__body {
        .good-search {
          display: flex;
          .el-input {
            width: 400px;
            margin-right: 20px;
          }
          .el-button {
            /*width: 70px;*/
          }
        }
        .good-main {
          margin-top: 20px;
          background-color: #f5f6f9;
          padding: 20px 30px;
          >h2 {
            font-weight: bold;
            color: #333;
            font-size: 16px;
            padding-bottom: 20px;
            border-bottom: 1px solid #eee;
          }
          .el-checkbox-group {
            .el-checkbox {
              height: 57px;
              line-height: 57px;
              border-bottom: 1px solid #eee;
              width: 100%;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
          }
          .content-pagination {
          }
        }
      }
    }
  }
  .weight {
    display: flex;
    align-items: center;

    .weight-input {
      width: 64px;

      .el-input__inner {
        text-align: center;
        width: 64px;
        padding: 0;
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
      margin-left: 4px;
      margin-right: 4px;
    }
  }
</style>
