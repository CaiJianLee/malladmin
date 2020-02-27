<template>
  <section class="page-layout" :class="{'fullScreen': isfullScreen}" :style="{width: layout.width, height: layout.height}">
    <div ref="editorElem" v-loading="loading" style="height: 100%"></div>
    <el-button type="text" :title="isfullScreen ? '退出全屏' : '点击进入全屏编辑'" class="fullScreenBtn" @click="setfullScreen">{{isfullScreen ? "退出全屏编辑" : "全屏"}}</el-button>
  </section>
</template>

<script>
import E from "wangeditor";
import { mapState } from "vuex";
import { warningMsg, uuid, errorMsg } from "@/commonutils/common";
import appData from "@/assets/js/emoji.json";
import * as aliRequest from "@/commonutils/aliOSS";

export default {
  name: "index",
  props: {
    content: {
      type: String,
      default: ""
    },
    layout: {
      type: Object,
      default() {
        return {
          width: "100%",
          height: "100%"
        };
      }
    }
  },
  data() {
    return {
      FILE_TYPE_AVATAR: process.env.VUE_APP_FILE_TYPE_AVATAR,
      SUCC_CODE: process.env.VUE_APP_BASE_SUCC_CODE,
      ERR_TOKEN_CODE: process.env.VUE_APP_BASE_ERR_TOKEN_CODE,
      loading: false,
      faceList: [],
      editor: null,
      isfullScreen: false,
      isChange: false
    };
  },
  watch: {
    content(val) {
      if (!this.isChange) {
        this.editor.txt.html(val);
      }
      this.isChange = false;
    }
  },
  computed: {
    ...mapState(["user", "aliyunOss"])
  },
  created() {
    this.faceContent();
  },
  methods: {
    setfullScreen() {
      this.isfullScreen = !this.isfullScreen;
    },
    /**
     *载入表情数组
     * @return {void}
     */
    faceContent() {
      for (let i in appData) {
        this.faceList.push(appData[i].char);
      }
    }
  },
  mounted() {
    const this_ = this;
    this.editor = new E(this.$refs.editorElem);
    // 编辑器的事件，每次改变会获取其html内容
    this.editor.customConfig.onchange = html => {
      this.isChange = true;
      this.$emit("update:content", html);
    };
    this.editor.customConfig.height = "100%";
    this.editor.customConfig.uploadImgMaxSize = 5 * 1024 * 1024; // 图片大小不超过5M
    this.editor.customConfig.uploadImgMaxLength = 1; // 一次最多能传几张图片
    this.editor.customConfig.customAlert = function(info) {
      warningMsg(this_, info);
    };
    this.editor.customConfig.customUploadImg = async (files, insert) => {
      let imgFile = files[0];
      this_.loading = true;
      if (
        imgFile.type === "image/jpg" ||
        imgFile.type === "image/png" ||
        imgFile.type === "image/jpeg"
      ) {
        imgFile = await aliRequest.CompressorImg(files[0]);
      }
      const client = await aliRequest.OssRequset();
      const _obj = this.aliyunOss.imgPath + "/" + uuid();
      client
        .put(_obj, imgFile)
        .then(r1 => {
          insert(this.aliyunOss.imgHost + r1.name);
          this_.loading = false;
        })
        .catch(err => {
          errorMsg(this, err);
          this_.loading = false;
        });
    };
    this.editor.customConfig.menus = [
      "head", // 标题
      "bold", // 粗体
      "fontSize", // 字号
      "fontName", // 字体
      "italic", // 斜体
      "underline", // 下划线
      "strikeThrough", // 删除线
      "foreColor", // 文字颜色
      "backColor", // 背景颜色
      "link", // 插入链接
      "list", // 列表
      "justify", // 对齐方式
      "quote", // 引用
      "emoticon", // 表情
      "image", // 插入图片
      // 'table', // 表格
      "code", // 插入代码
      "undo", // 撤销
      "redo", // 重复
      "fullscreen"
    ];
    this.editor.customConfig.zIndex = 0;
    this.editor.customConfig.emotions = [
      {
        // tab 的标题
        title: "默认",
        // type -> 'emoji' / 'image'
        type: "image",
        // content -> 数组
        content: [
          {
            alt: "[坏笑]",
            src:
              "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/50/pcmoren_huaixiao_org.png"
          },
          {
            alt: "[舔屏]",
            src:
              "http://img.t.sinajs.cn/t4/appstyle/expression/ext/normal/40/pcmoren_tian_org.png"
          }
        ]
      },
      {
        // tab 的标题
        title: "emoji",
        // type -> 'emoji' / 'image'
        type: "emoji",
        // content -> 数组
        content: this.faceList
      }
    ];
    this.editor.create(); // 创建富文本实例
  }
};
</script>
<style lang="scss" scoped>
.page-layout {
  position: relative;
  &.fullScreen {
    position: fixed;
    top: 0;
    right: 0;
    z-index: 9999;
    height: 100vh !important;
    width: 100% !important;
  }
  .fullScreenBtn {
    position: absolute;
    z-index: 1;
    top: 7px;
    right: 10px;
    padding: 0;
    span {
      font-size: 22px;
    }
  }
}
</style>
<style lang="scss">
.w-e-text-container{
  height: calc(100% - 50px) !important;/*!important是重点，因为原div是行内样式设置的高度300px*/
}
</style>
