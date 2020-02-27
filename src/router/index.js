import Vue from "vue";
import VueRouter from "vue-router";

const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err);
};
Vue.use(VueRouter);
//一级路由
const Home = () => import("@/views/Home.vue");
const NotFound = () => import("@/views/notFound/404.vue");
const Login = () => import("@/views/login");
//二级路由
const GoodsCategory = () => import("@/views/container/goodsCategory/index"); // 商品分类管理主页
const GoodsGroup = () => import("@/views/container/goodsGroup/index"); // 商品标签管理
const GoodsManage = () => import("@/views/container/goodsManage/index"); // 商品管理
const createGoods = () => import("@/views/container/goodsManage/createGoods/index"); // 发布商品
const ConfigGroup = () => import("@/views/container/goodsGroup/ConfigGroup"); // 配置标签
const OrderRecording = () => import("@/views/container/orderRecording/index"); // 订单管理
const OrderDetail = () => import("@/views/container/orderDetail/index"); // 订单详情
const ArticleManage = () => import("@/views/container/articleManage/index"); // 内容管理
const CreateArticle = () => import("@/views/container/createArticle/index"); // 发布内容
const BannerManage = () => import("@/views/container/bannerManage/index"); // 广告管理

const router = new VueRouter({
  routes: [
    {
      path: "/",
      // name: "home",
      component: Home,
      meta: {
        title: "首页"
      },
      children: [
        {
          path: "/",
          component: GoodsGroup,
          meta: {
            title: "商品标签管理"
          }
        },
        {
          path: "/goodsCategory",
          name: "goodsCategory",
          component: GoodsCategory,
          meta: {
            title: "商品分类管理"
          }
        },
        {
          path: "/goodsGroup",
          component: GoodsGroup,
          meta: {
            title: "商品标签管理"
          }
        },
        {
          path: "/goodsGroup/configGroup",
          component: ConfigGroup,
          meta: {
            title: "配置标签"
          }
        },
        {
          path: "/goodsManage",
          component: GoodsManage,
          meta: {
            title: "商品管理"
          }
        },
        {
          path: "/goodsManage/createGoods",
          name: "createGoods",
          component: createGoods,
          meta: {
            title: "发布商品"
          }
        },
        {
          path: "/orderRecording/orderDetail",
          name: "orderDetail",
          component: OrderDetail,
          meta: {
            title: "订单详情"
          }
        },
        {
          path: "/ArticleManage",
          name: "ArticleManage",
          component: ArticleManage,
          meta: {
            title: "内容管理"
          }
        },
        {
          path: "/ArticleManage/CreateArticle",
          name: "CreateArticle",
          component: CreateArticle,
          meta: {
            title: "创建内容"
          }
        },
        {
          path: "/BannerManage",
          name: "BannerManage",
          component: BannerManage,
          meta: {
            title: "广告管理"
          }
        },
        {
          path: "/orderRecording",
          name: "orderRecording",
          component: OrderRecording,
          meta: {
            title: "订单记录"
          }
        }
      ]
    },
    {
      path: "*",
      name: "404",
      component: NotFound,
      meta: {
        title: "该页面无法找到"
      }
    },
    {
      path: "/login",
      name: "login",
      component: Login,
      meta: {
        title: "用户登录"
      }
    }
  ]
});

export default router;
