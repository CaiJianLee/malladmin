<template>
  <el-container class="page-layout">
    <left-menu :isCollapse.sync="isCollapse"/>
    <el-container class="is-vertical">
      <top-menu :isCollapse.sync="isCollapse"/>
      <el-main class="page-content min-scrollbar">
        <router-view/>
      </el-main>
      <!--      <foot-content></foot-content>-->
    </el-container>
  </el-container>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import leftMenu from "./leftMenu";
// import footContent from "./footContent";
import topMenu from "./topMenu";
import ajax from "@/api/ajax";
import {
  successMsg,
  STATUS_CODE,
  errorMsg,
} from "@/commonutils/common";

export default {
  name: "home",
  data() {
    return {
      isCollapse: false,
      tableData: []
    };
  },
  components: {
    leftMenu,
    // footContent,
    topMenu
  },
  methods: {
    /**
     * 获取物流公司列表
     * @returns {void}
     */
    async getExprressList() {
      const { code, msg, result } = await ajax(
        "/api/mall/manager/exprress/company/list",
        {},
        "POST"
      );
      if (code !== STATUS_CODE.success) {
        errorMsg(this, msg);
        return;
      }
      this.$store.commit("setExprressList", result.list);
    }
  },
  watch: {},
  created() {
    const userInfo = localStorage.getItem("user_key");
    if (userInfo) {
      this.$store.commit("setUser", JSON.parse(userInfo));
      this.$store.commit("setAliyunOss", JSON.parse(userInfo).aliyunOss);
      this.getExprressList();
    }
  },
  computed: {
    ...mapState(["user", "aliyunOss", "exprressList"]),
    ...mapGetters(["systemAdmin", "guestAdmin"])
  }
};
</script>
<style scoped lang="scss">
.page-layout {
  height: 100%;
  .page-nav {
    height: 100vh;
    background-color: #2d2d2d;
    .el-menu {
      border-right: 0;
      font-size: 15px;
    }
  }
  .page-content {
    height: calc(100vh - 120px);
    overflow: hidden;
    overflow-y: auto;
  }
}
</style>
<style lang="scss">
.page-layout {
  .page-nav {
    .el-menu {
      border-right: 0;
      background-color: transparent !important;
    }
  }
  .el-menu-item {
    height: 120px;
    display: flex;
    justify-content: center;
    align-items: center;
    line-height: unset;
    .menu-content {
      height: 60px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      > span {
        margin-top: 15px;
      }
      > i {
        font-size: 24px;
      }
    }

    &.is-active {
      background: #26af61;
    }
    &:hover {
      background-color: #26af617a;
    }
  }
}
.layout-content {
  .el-card {
    border: 0;
  }
  .el-table tr.goodsTable th.is-leaf {
    border-bottom: 0;
    font-size: 16px;
    padding-bottom: 17px;
    > .cell {
      // word-break: keep-all;
    }
  }
}
.content-pagination {
  display: flex;
  justify-content: flex-end;
  .el-pagination {
    margin-top: 24px;
    &.is-background {
      .el-pager li {
        background-color: #fff;
        border-radius: 4px;
      }
    }
  }
  .el-pagination.is-background .btn-next,
  .el-pagination.is-background .btn-prev {
    background-color: #fff;
  }
}
</style>
