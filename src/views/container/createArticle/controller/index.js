/**
 *  Created by wangAlen on 2019-11-12 11:49
 */
import { mapState } from "vuex";
import {
  warningMsg,
  successMsg,
  uuid,
  jsonDeepClone,
  STATUS_CODE,
  errorMsg
} from "@/commonutils/common";
import { createContent, getContentInfo } from "./request";
import CollapseTransition from "element-ui/lib/transitions/collapse-transition";
import editor from "@/components/editor";
import { contentTypeList } from "../../articleManage/request";
import imageUpload from "@/components/imageUpload";
import videoUpload from "@/components/videoUpload";

export default {
  name: "CreateGoods",
  data() {
    return {
      contentTypeList: contentTypeList,
      show1: true,
      show2: true,
      show3: true,
      progress: {
        count: 0,
        status: ""
      },
      form: {
        type: "", // 内容类别
        describe: "", // 内容描述
        title: "", // 内容名称
        cover: "", // 内容主图列表
        tags: [], // 内容标签列表
        video: "", // 内容视频
        details: "" // 富文本
      },
      loading: false,
      faceList: [],
      editorContent: "",
      FILE_TYPE_AVATAR: process.env.VUE_APP_FILE_TYPE_AVATAR,
      SUCC_CODE: process.env.VUE_APP_BASE_SUCC_CODE,
      ERR_TOKEN_CODE: process.env.VUE_APP_BASE_ERR_TOKEN_CODE,
      rules: {
        title: [
          {
            required: true,
            message: "请输入内容名称",
            trigger: ["change"]
          },
          {
            min: 2,
            max: 50,
            message: "长度在 2 到 50 个字符",
            trigger: "change"
          }
        ],
        describe: [
          {
            required: true,
            message: "请输入内容描述",
            trigger: ["change"]
          }
        ],
        type: [{ required: true, message: "请选择内容分类", trigger: "change" }]
      },
      isDraft: false,
      isRelease: false,
      goodsInfoOrigin: {},
      tagsList: [],
      dialogVisible: false,
      isLoading: false,
      editLayout: {
        width: "100%",
        height: "400px"
      }
    };
  },
  components: {
    CollapseTransition,
    editor,
    imageUpload,
    videoUpload
  },
  created() {
    this.getContentInfoData();
  },
  computed: {
    ...mapState(["user", "aliyunOss"]),
    /**
     * 是否可编辑
     * @returns {boolean} 编辑状态
     */
    isEdit() {
      return Boolean(this.routeData.query.goodsId);
    },
    /**
     * 路由信息
     * @returns {Route} 路由信息
     */
    routeData() {
      return this.$route;
    }
  },
  methods: {
    /**
     * 根据路由id查询内容详情
     * @returns {Promise<void>} goodsInfo
     */
    async getContentInfoData() {
      const params = this.routeData.query;
      // 判断是否为编辑状态
      if (!params.contentId) {
        // 根据编辑状态设置title
        // this.$route.meta.title = "创建内容";
        return;
      }
      this.isLoading = true;
      // this.$route.meta.title = "编辑内容";
      // 请求内容详情数据
      const data = await getContentInfo({ id: params.contentId });
      if (data.code !== STATUS_CODE.success) {
        errorMsg(this, data.msg);
        return;
      }
      this.goodsInfoOrigin = jsonDeepClone(data.result.content); // 备份原始数据
      const contentInfo = data.result.content;
      // const tags = contentInfo.tags.list.map(item => {
      //   return item.id;
      // });
      this.form = {
        type: contentInfo.type, // 内容类别
        describe: contentInfo.describe, // 内容类别
        title: contentInfo.title, // 内容名称
        video: contentInfo.video, // 适配
        // tags: tags, // 内容名称
        cover: contentInfo.cover // 内容主图列表
      };
      this.$set(this.form, "details", contentInfo.details); // 初始化富文本内容
      this.$set(this.form, "status", contentInfo.status); // 初始化富文本内容
      this.$set(this.form, "id", this.routeData.query.contentId); // 设置内容id，更新编辑状态
      this.isLoading = false;
    },
    /**
     * 保存内容
     * @param {String} goodsForm
     * @returns {void}
     */
    async save(goodsForm) {
      const data = jsonDeepClone(this.form);
      this.$refs[goodsForm].validate(async valid => {
        if (!valid) {
          return false;
        }
        if (!this.form.cover) {
          warningMsg(this, "请上传内容主图");
          return false;
        }
        if (!data.details.trim()) {
          warningMsg(this, "请填写内容详情");
          return false;
        }
        // const tags = data.tags.map(item => {
        //   return {
        //     id: item
        //   };
        // });
        const params = {
          content: {
            id: data.id || undefined, // 内容id
            title: data.title, // 内容名称
            cover: data.cover, // 内容背景图
            details: data.details, // 内容详情(富文本)
            status: data.status, // 内容详情(富文本)
            type: data.type, // 内容分类
            video: data.video, // 视频
            // tags: {
            //   list: tags
            // }, // 标签
            describe: data.describe // 内容描述
          }
        };
        const response = await createContent(params);
        setTimeout(() => {
          this.isDraft = false;
          this.isRelease = false;
        }, 500);
        if (response.code !== STATUS_CODE.success) {
          errorMsg(this, response.msg);
          return;
        }
        successMsg(this, `${data.id ? "编辑成功" : "创建成功"}`);
        await this.$router.replace(this.routeData.query.path_);
      });
    }
  }
};
