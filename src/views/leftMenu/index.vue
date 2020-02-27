<template>
  <el-aside class="page-nav" :width="isCollapse ? '55px' : '200px'">
    <el-image
      style="width: 200px; height: 128px"
      :src="logoUrl"
      fit="scale-down"
      @click="goHome"
    />
    <el-menu
      router
      :default-active="defaultIndex"
      active-text-color="#fff"
      class="el-menu-vertical-demo"
      style="background: none"
    >
      <el-menu-item
        v-for="item in menuData"
        :key="item.path"
        :route="item.path"
        :index="item.path"
        :disabled="item.disabled"
        class="menu-link"
      >
        <div class="menu-content">
          <i :class="item.icon" />
          <span v-if="!isCollapse" slot="title">{{ item.title }}</span>
        </div>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script>
export default {
  name: "index",
  props: {
    isCollapse: {
      type: Boolean
    }
  },
  data() {
    return {
      pathWhite: [
        {
          path: "/goodsGroup/configGroup",
          redirect: "/goodsGroup"
        },
        {
          path: "/goodsManage/createGoods",
          redirect: "/goodsManage"
        },
        {
          path: "/orderRecording/orderDetail",
          redirect: "/orderRecording"
        },
        {
          path: "/ArticleManage/CreateArticle",
          redirect: "/ArticleManage"
        }
      ],
      menuData: [
        {
          title: "商品标签管理",
          icon: "iconfont icon-fenzu",
          path: "/goodsGroup"
        },
        {
          title: "商品分类管理",
          icon: "iconfont icon-shangpin",
          path: "/GoodsCategory"
        },
        {
          title: "商品管理",
          icon: "iconfont icon-ziyuan",
          path: "/goodsManage"
        },
        {
          title: "内容管理",
          icon: "el-icon-s-claim",
          path: "/ArticleManage"
        },
        {
          title: "广告管理",
          icon: "el-icon-video-camera-solid",
          path: "/BannerManage"
        },
        {
          title: "订单记录",
          icon: "el-icon-s-order",
          path: "/orderRecording"
        }
      ], //左侧导航数组
      logoUrl: require("../../assets/images/homeLogo.png"), //logo地址
      defaultIndex: ""
    };
  },
  methods: {
    goHome() {},
    setPathWhite() {
      const pathName = this.route.path;
      if (pathName === "/") {
        this.defaultIndex = pathName !== "/" ? "/goodsGroup" : "/goodsGroup";
      } else {
        for (let item of this.pathWhite) {
          if (item.path === pathName) {
            this.defaultIndex = item.redirect;
            break;
          } else {
            this.defaultIndex = pathName;
          }
        }
      }
    }
  },
  computed: {
    route() {
      return this.$route;
    }
  },
  mounted() {
    this.setPathWhite();
  }
};
</script>
<style lang="scss" scoped>
.page-nav {
  transition: width 0.3s ease 0s;
}
</style>
<style lang="scss">
.page-layout {
  .el-image {
    cursor: pointer;
  }
}
</style>
