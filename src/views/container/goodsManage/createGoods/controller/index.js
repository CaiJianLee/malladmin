/**
 *  Created by wangAlen on 2019-11-12 11:49
 */
import { mapState } from "vuex";
import draggable from "vuedraggable";
import {
  warningMsg,
  successMsg,
  uuid,
  jsonDeepClone,
  STATUS_CODE,
  regYuanToFen,
  errorMsg,
  regFenToYuan,
  toDecimal2
} from "@/commonutils/common";
import { createGoods, getGoodsInfo } from "./request";
import CollapseTransition from "element-ui/lib/transitions/collapse-transition";
import GoodsSpecifications from "../../goodsSpecifications/goodsSpecifications";
import editor from "@/components/editor";
import { getGoodsCategory } from "../../../goodsCategory/request";
import { reqGetGoodsGroup } from "../../../goodsGroup/request";
import imageUpload from "@/components/imageUpload";

export default {
  name: "CreateGoods",
  data() {
    /**
     * 商品价格正则过滤
     * @param {Object} rule
     * @param {Object} value
     * @param {Object} callback
     * @returns {Object} callback
     */
    let validatePrice = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入价格"));
      } else if (value <= 0 || !/^[0-9]+(.[0-9]{1,5})?$/.test(value)) {
        callback(new Error("价格不合法，请重新输入"));
      } else if (value > 99999) {
        callback(new Error("价格不合法，请重新输入"));
      } else {
        callback();
      }
    };
    let checkWeight = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("重量不能为空"));
      }
      if (value <= 0 || !/^[0-9]+(.[0-9]{1,5})?$/.test(value)) {
        callback(new Error("重量不合法，请重新输入"));
      } else {
        if (value > 9999) {
          callback(new Error("重量不合法，请重新输入"));
        } else {
          callback();
        }
      }
    };
    let validateTags = (rule, value, callback) => {
      if (!value.length) {
        return callback(new Error("请选择商品标签"));
      } else {
        callback();
      }
    };
    return {
      Draft: STATUS_CODE.goodsDraft,
      Release: STATUS_CODE.goodsRelease,
      goodsGroup: [],
      goodsCategoryList: [],
      show1: true,
      show2: true,
      show3: true,
      drag: false,
      transf: [
        {
          name: "包邮",
          id: 1
        }
      ],
      form: {
        category: "", // 商品分类
        name: "", // 商品名称
        costPrice: "", // 商品售卖价格
        showPrice: "", // 商品展示价格
        description: "", // 商品描述
        serviceContent: "", // 服务说明
        freightId: "", // 运费模板
        weight: "", // 物流重量
        temporaryImgList: [],
        imgList: [], // 商品主图列表
        tags: [], // 商品标签
        video: "", // 商品视频
        specificationsData: [], // 商品规格列表
        goodsInfo: "", // 商品富文本
        goodsParams: [
          {
            key: "品牌",
            value: ""
          },
          {
            key: "型号",
            value: ""
          }
        ],
        sku: []
      },
      loading: false,
      faceList: [],
      editorContent: "",
      FILE_TYPE_AVATAR: process.env.VUE_APP_FILE_TYPE_AVATAR,
      SUCC_CODE: process.env.VUE_APP_BASE_SUCC_CODE,
      ERR_TOKEN_CODE: process.env.VUE_APP_BASE_ERR_TOKEN_CODE,
      rules: {
        name: [
          {
            required: true,
            message: "请输入商品名称",
            trigger: ["change"]
          },
          {
            min: 2,
            max: 50,
            message: "长度在 2 到 50 个字符",
            trigger: "change"
          }
        ],
        category: [
          { required: true, message: "请选择商品分类", trigger: "change" }
        ],
        freightId: [
          { required: true, message: "请选择运费模板", trigger: "change" }
        ],
        costPrice: [
          {
            validator: validatePrice,
            trigger: "change"
          }
        ],
        showPrice: [
          {
            validator: validatePrice,
            trigger: "change"
          }
        ],
        tags: [
          {
            validator: validateTags,
            trigger: "change"
          }
        ],
        weight: [
          {
            validator: checkWeight,
            trigger: "change"
          }
        ]
      },
      isDraft: false,
      isRelease: false,
      goodsInfoOrigin: {},
      dialogVisible: false,
      isLoading: false,
      editLayout: {
        width: "100%",
        height: "400px"
      }
    };
  },
  // beforeRouteLeave(to, from, next) {
  //   this.$confirm("表单数据未保存，你确定要离开吗?", "提示", {
  //     confirmButtonText: "确定",
  //     cancelButtonText: "取消"
  //   })
  //     .then(() => {
  //       next();
  //     })
  //     .catch(() => {
  //       next(false);
  //     });
  // },
  components: {
    draggable,
    CollapseTransition,
    GoodsSpecifications,
    editor,
    imageUpload
  },
  created() {
    this.getGoodsInfoData();
    this.getGoodsCategoryList();
    this.getGoodsGroup();
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
    },
    /**
     * 拖拽
     * @returns {{ghostClass: string, disabled: boolean, animation: number, group: string}} 拖拽信息
     */
    dragOptions() {
      return {
        animation: 500,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
      };
    },
    /**
     * 新增商品参数
     * @returns {Array} 新增商品参数
     */
    goodsParamsNew() {
      if (this.form.goodsParams.length >= 3) {
        return this.form.goodsParams.slice(2);
      } else {
        return [];
      }
    }
  },
  methods: {
    /**
     * 根据路由id查询商品详情
     * @returns {Promise<void>} goodsInfo
     */
    async getGoodsInfoData() {
      const params = this.routeData.query;
      // 判断是否为编辑状态
      if (!params.goodsId) {
        // 根据编辑状态设置title
        // this.$route.meta.title = "创建商品";
        return;
      }
      this.isLoading = true;
      // this.$route.meta.title = "编辑商品";
      // 请求商品详情数据
      const data = await getGoodsInfo({ id: params.goodsId });
      if (data.code !== STATUS_CODE.success) {
        errorMsg(this, data.msg);
        return;
      }
      this.goodsInfoOrigin = jsonDeepClone(data.result.goods); // 备份原始数据
      const goodsInfo = data.result.goods;
      const sku = [];
      const specificationsData = [];
      // 按照编辑格式来格式化规格列表
      goodsInfo.options.list.forEach(item => {
        let arr = [];
        item.values.forEach(item => {
          arr.push({
            name: item,
            id: uuid()
          });
        });
        specificationsData.push({
          specifications: item.key,
          id: uuid(),
          type: arr
        });
      });
      // 格式化返回Sku数据
      goodsInfo.skus.forEach(item => {
        let obj = {};
        let uid = "";
        let valueList_ = [];
        // 循环sku value list并插入uid，valueList_
        item.options.list.forEach(item => {
          obj[item.key] = item.value;
          valueList_.push(item.value);
          uid += item.value + "-";
        });
        obj["showPrice"] = regFenToYuan(parseInt(item.showPrice)); // 单位分转换元，并插入sku价格
        obj["costPrice"] = regFenToYuan(parseInt(item.costPrice)); // 单位分转换元，并插入sku价格
        obj["count"] = parseInt(item.totalStockNum); // 插入商品库存
        obj["snCode"] = item.snCode;
        obj["cover"] = item.cover;
        obj["statusName"] = item.statusName;
        obj["status"] = item.status;
        obj["id"] = item.id;
        obj.uid = uid.substring(0, uid.length - 1);
        obj.valueList = valueList_; // 插入商品valueList
        sku.push(obj);
      });
      const tags = () => {
        const arr = [];
        goodsInfo.tags.forEach(item => {
          arr.push(item.id);
        });
        return arr;
      }
      // 设置商品信息
      this.form = {
        category: goodsInfo.classId, // 商品分类
        description: goodsInfo.description, // 商品描述
        serviceContent: goodsInfo.serviceContent, // 服务详情
        freightId: parseInt(goodsInfo.freightId), // 运费模板
        weight: goodsInfo.weight, // 商品分类
        name: goodsInfo.name, // 商品名称
        showPrice: regFenToYuan(goodsInfo.showPrice), // 商品价格
        costPrice: regFenToYuan(goodsInfo.costPrice), // 商品价格
        imgList: goodsInfo.pictures.list, // 商品主图列表
        temporaryImgList: goodsInfo.pictures.list,
        video: goodsInfo.video, // 商品视频
        specificationsData: specificationsData, // 商品规格列表
        goodsParams: goodsInfo.extraInfo.list,
        tags: tags(),
        sku: sku
      };
      this.$set(this.form, "goodsInfo", goodsInfo.details); // 初始化富文本内容
      this.$set(this.form, "id", this.routeData.query.goodsId); // 设置商品id，更新编辑状态
      this.isLoading = false;
    },
    /**
     * 获取所有商品分类
     * @returns {Promise<void>} 所有商品分类
     */
    async getGoodsCategoryList() {
      const data = await getGoodsCategory({
        isAll: true
      });
      if (data.code === STATUS_CODE.success) {
        // 递归数组，去除长度为0的children字段
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
        lookData((this.goodsCategoryList = data.result.list));
      }
    },
    /**
     * 获取所有商品标签
     * @returns {Promise<void>} 所有商品标签
     */
    async getGoodsGroup() {
      const data = await reqGetGoodsGroup(undefined, undefined, true);
      if (data.code === STATUS_CODE.success) {
        this.goodsGroup = data.result.list;
      }
    },
    /**
     * 删除自定义参数
     * @param {Object} val
     * @returns {void}
     */
    delGoodsParams(val) {
      this.form.goodsParams = this.form.goodsParams.filter(
        item => val.uid !== item.uid
      );
    },
    /**
     * 添加自定义商品参数
     * @returns {void}
     */
    addGoodsParams() {
      this.form.goodsParams.push({
        uid: uuid(),
        key: "",
        value: ""
      });
    },
    /**
     * 保存商品
     * @param {String} goodsForm
     * @param {number} type
     * @returns {void}
     */
    async save(goodsForm, type) {
      this.form.type = type;
      const data = jsonDeepClone(this.form);
      const sku = this.$refs.specificationsData.tableData;
      const skuList = [];
      const options = [];
      data.specificationsData.forEach(item => {
        let arr = [];
        item.type.forEach(type => {
          arr.push(type.name);
        });
        options.push({
          key: item.specifications,
          values: arr
        });
      });
      // 循环从子组件拿到的sku构造数组
      sku.forEach(item => {
        let optionList = [];
        let valueList = item.valueList;
        for (let key in item) {
          let obj = {};
          // 循环option将sku的key和option每一项对比
          valueList.forEach(ele => {
            // 过滤掉单规格key为uid时对应的值和key重复
            if (item[key] === ele && key !== "uid") {
              obj.key = key;
              obj.value = ele;
              optionList.push(obj);
            }
          });
        }
        skuList.push({
          showPrice: regYuanToFen(item.showPrice),
          costPrice: regYuanToFen(item.costPrice),
          totalStockNum: item.count,
          snCode: item.snCode,
          cover: item.cover,
          options: {
            list: optionList || []
          }
        });
      });
      // 根据选择标签匹配标签对象
      const tags = val => {
        const arr = [];
        if (val && val.length) {
          this.goodsGroup.forEach(item => {
            if (val.indexOf(item.id) >= 0) {
              arr.push(item);
            }
          });
        }
        return arr;
      };
      // 自定义参数判空
      const goodsParamsStatus = data.goodsParams.every(item => {
        return (
          item.value &&
          item.key &&
          item.value.length < 20 &&
          item.key.length < 20
        );
      });
      this.$refs[goodsForm].validate(async valid => {
        if (type === this.Draft && !data.name.length) {
          warningMsg(this, "请输入商品名称");
          return false;
        } else if (type === this.Release) {
          if (!valid) {
            warningMsg(this, "商品信息不完整，请填写相关信息");
            return false;
          }
          if (!this.form.imgList.length) {
            warningMsg(this, "请上传商品主图");
            return false;
          }
          if (!this.form.specificationsData.length) {
            warningMsg(this, "请添加商品规格");
            return false;
          }
          if (
            skuList.some(item => {
              return !item.snCode.trim();
            })
          ) {
            warningMsg(this, "请完善规格明细：商品编码不能为空");
            return false;
          }
          if (!data.freightId) {
            warningMsg(this, "请选择运费模板");
            return false;
          }
          if (!sku.length) {
            warningMsg(this, "请保存商品规格并填写规格详细");
            return false;
          }
          if (!data.goodsInfo.trim().length) {
            warningMsg(this, "请填写商品详情");
            return false;
          }
          if (!goodsParamsStatus) {
            warningMsg(this, "自定义参数不能为空1到20字符");
            return false;
          }
        } else {
          // eslint-disable-next-line no-console
          console.info("存草稿", data);
        }
        type === this.Draft ? (this.isDraft = true) : (this.isRelease = true);
        const params = {
          goods: {
            id: data.id || undefined, // 商品id
            name: data.name, // 商品名称
            classId: data.category, // 商品分类
            showPrice: regYuanToFen(toDecimal2(data.showPrice)), // 展示价格(商品价格)
            costPrice: regYuanToFen(toDecimal2(data.costPrice)), // 实际售卖价格，预留
            pictures: {
              // 轮播图，第一张为主图
              list: data.imgList || []
            },
            video: data.video || undefined, // 视频，预留
            details: data.goodsInfo, // 商品详情(富文本)
            status: data.type, // 状态.新增商品的时候只允许新增草稿和上架状态。
            totalStockNum: data.totalStockNum, // 总库存
            description: data.description, // 描述
            serviceContent: data.serviceContent, // 总库存
            freightId: data.freightId, // 运费模板
            weight: parseInt(data.weight), // 商品重量
            tags: tags(data.tags), // 商品标签
            options: {
              // 商品的所有规格
              list: options || []
            },
            extraInfo: {
              // 商品额外自定义参数
              list: data.goodsParams || []
            },
            skus: skuList || [] // SKU列表
          }
        };
        const response = await createGoods(params);
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
