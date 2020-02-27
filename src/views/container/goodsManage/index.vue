<template>
  <el-container class="layout goodsManage-style">
    <el-header height="50px" class="layout-title-box">
      <div class="titles">{{ route.meta.title }}</div>
    </el-header>
    <el-tabs v-model="activeName" class="asd">
      <el-tab-pane label="全部商品" name="allGoods"></el-tab-pane>
      <el-tab-pane label="新品首发" name="newGoods"></el-tab-pane>
      <el-tab-pane label="爆款推荐" name="hotGoods"></el-tab-pane>
    </el-tabs>
    <component :goodsCategoryList="goodsCategoryList" :is="activeName" />
  </el-container>
</template>

<script>
import allGoods from "./allGoods";
import newGoods from "./newGoods";
import hotGoods from "./hotGoods";
import { getGoodsCategory } from "../goodsCategory/request";
import { STATUS_CODE } from "@/commonutils/common";

export default {
  name: "index",
  data() {
    return {
      activeName: "allGoods",
      goodsCategoryList: []
    };
  },
  components: {
    allGoods,
    newGoods,
    hotGoods
  },
  computed: {
    route() {
      return this.$route;
    }
  },
  created() {
    this.getGoodsCategoryList();
  },
  methods: {
    /**
     * 获取所有商品分类
     * @returns {Promise<void>} 所有商品分类
     */
    async getGoodsCategoryList() {
      const data = await getGoodsCategory({
        isAll: true
      });
      const lookData = arr => {
        if (arr.length) {
          arr.forEach(item => {
            if (!item.children.length) {
              delete item.children;
            } else {
              lookData(item.children);
            }
          });
        }
      };
      if (data.code === STATUS_CODE.success) {
        lookData((this.goodsCategoryList = data.result.list));
      }
    }
  }
};
</script>

<style lang="scss">
.goodsManage-style {
  .el-tabs__nav-scroll {
    padding-left: 22px;
  }
}
</style>
