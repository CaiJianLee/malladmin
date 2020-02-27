<template>
  <div class="imageUpload">
    <div class="uploader-layout">
      <template v-if="isMulti">
        <draggable
          class="el-upload-list el-upload-list--picture-card"
          tag="ul"
          v-if="imageList.length"
          v-model="imageList"
          v-bind="dragOptions"
          @start="drag = true"
          @end="drag = false"
        >
          <li
            class="el-upload-list__item"
            :class="{ isDrap: drag }"
            v-for="(item, index) in imageList"
            :key="index"
          >
            <el-image
              style="width: 148px; height: 148px; cursor: move"
              :src="item"
              fit="contain"
            >
              <div slot="placeholder" class="image-slot">
                图片加载中<span class="el-icon-loading"></span>
              </div>
            </el-image>
            <i
              class="el-icon-error btn"
              @click="delImg(item)"
              title="删除图片"
            />
          </li>
        </draggable>
        <el-upload
          v-if="imageList.length < 5"
          class="avatar-uploader"
          action=""
          :auto-upload="false"
          accept=".jpg,.png"
          :on-change="pictureSelect"
          :show-file-list="false"
        >
          <div class="el-upload--picture-card">
            <i class="el-icon-plus avatar-uploader-icon"></i>
          </div>
        </el-upload>
      </template>
      <template v-else>
        <el-upload
          :style="{width: width, height: height}"
          class="avatar-uploader"
          action=""
          :auto-upload="false"
          accept=".jpg,.png"
          :on-change="pictureSelect"
          :show-file-list="false"
        >
          <div
            class="el-upload--picture-card"
            :style="{ width: width, height: height }"
            title="点击上传图片"
          >
            <el-image
              class="article-img"
              v-if="imageUrl"
              style="width: 100%; height: 100%;"
              :src="imageUrl"
              fit="scale-down"
            >
              <div slot="error" class="image-slot" title="图片加载失败">
                <img :src="noImg" width="100%" />
                <!-- <span>图片加载失败</span> -->
              </div>
              <div slot="placeholder" class="image-slot">
                图片加载中<span class="el-icon-loading"></span>
              </div>
            </el-image>
            <div v-else class="upload-tip">
              <i class="el-icon-plus avatar-uploader-icon" />
<!--              <font size="1"-->
<!--                >(仅限上传尺寸:1920x1080，大小不超过1M的图片文件)</font-->
<!--              >-->
            </div>
          </div>
        </el-upload>
      </template>
    </div>
    <div class="tip-text" v-if="isShowTip">
      最多上传{{ isMulti ? 5 : 1 }}张图片，建议尺寸{{ size.width }} x
      {{ size.height }} 像素，图片大小不能超过5MB；
      <span v-if="isMulti">你可以左右拖拽图片调整图片顺序</span>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex";
import { CompressorImg } from "@/commonutils/compressor";
import { OssRequset } from "@/commonutils/aliOSS";
import { errorMsg, uuid, warningMsg } from "@/commonutils/common";
import draggable from "vuedraggable";

export default {
  name: "imageUpload",
  data() {
    return {
      noImg: require("@/assets/images/noImg.jpg"),
      imageUrl: "",
      imageList: [],
      drag: false,
      client: null
    };
  },
  components: {
    draggable
  },
  props: {
    isShowTip: {
      type: Boolean,
      default: true
    },
    width: {
      type: String,
      default: "148px"
    },
    height: {
      type: String,
      default: "148px"
    },
    size: {
      type: Object,
      default() {
        return {
          width: 750,
          height: 750
        };
      }
    },
    isMulti: {
      type: Boolean,
      default: false
    },
    image: [String, Array]
  },
  watch: {
    image: {
      handler(val) {
        if (this.isMulti) {
          this.imageList = val;
        } else {
          this.imageUrl = val;
        }
      },
      immediate: true
    }
  },
  computed: {
    ...mapState(["user", "aliyunOss"]),
    /**
     * 拖拽
     * @returns {{ghostClass: string, disabled: boolean, animation: number, group: string}} 拖拽信息
     */
    dragOptions() {
      this.updateImage();
      return {
        animation: 500,
        group: "description",
        disabled: false,
        ghostClass: "ghost"
      };
    }
  },
  methods: {
    /**
     * 更新父组件图片
     * @returns {void}
     */
    updateImage() {
      this.$emit("update:image", this.isMulti ? this.imageList : this.imageUrl);
    },
    /**
     * 删除商品主图
     * @param {Object} val
     * @returns {void}
     */
    delImg(val) {
      this.imageList = this.imageList.filter(item => item !== val);
      this.updateImage();
    },
    /**
     * 图片上传之前
     * @param {Object} file
     * @returns {Promise<Object>} 返回是否上传状态
     */
    beforeAvatarUpload(file) {
      const _this = this;
      const isJPG = file.type === "image/jpeg" || file.type === "image/png"; // 图片类型
      const isLt2M = file.size / 1024 / 1024 < 5; // 图片大小
      // const fileLen = this.form.imgList.length < 5; // 最多上传数量
      const width = this.size.width; // 图片宽
      const height = this.size.height; // 图片高
      if (!isJPG) {
        this.$message.error("内容主图只能是 JPG或者PNG 格式!");
      }
      if (!isLt2M) {
        this.$message.error("内容主图大小不能超过 5MB!");
      }
      // eslint-disable-next-line no-unused-vars
      const isSize = new Promise(function(resolve, reject) {
        let _URL = window.URL || window.webkitURL;
        let img = new Image();
        img.onload = () => {
          let valid = img.width === width && img.height === height;
          valid ? resolve() : reject();
        };
        img.src = _URL.createObjectURL(file);
      }).then(
        () => {
          return file;
        },
        () => {
          warningMsg(
            _this,
            `图片尺寸限制为${this.size.width} x ${this.size.height}，请重新上传`
          );
          return Promise.reject(
            `图片尺寸限制为${this.size.width} x ${this.size.height}，请重新上传`
          );
        }
      );
      return isJPG && isLt2M && isSize;
    },
    /**
     * 添加内容主图成功时返回
     * @param {Object} file
     * @param {Array} fileList
     * @returns {void}
     */
    async pictureSelect(file) {
      if (!(await this.beforeAvatarUpload(file.raw))) {
        return;
      }
      const image = await CompressorImg(file.raw);
      const client = await OssRequset();
      const _obj = this.aliyunOss.imgPath + "/" + uuid();
      client
        .put(_obj, image)
        .then(r1 => {
          if (this.isMulti) {
            this.imageList.push(this.aliyunOss.imgHost + r1.name);
          } else {
            this.imageUrl = this.aliyunOss.imgHost + r1.name;
          }
          this.updateImage();
        })
        .catch(err => {
          errorMsg(this, err);
        });
    }
  }
};
</script>
<style lang="scss" scoped src="./_imageUpload.scss" />
