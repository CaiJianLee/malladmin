<template>
  <div class="videoUpload">
    <el-upload
      class="avatar-uploader"
      action=""
      :auto-upload="false"
      accept=".mp4,.mkv,.avi"
      :on-change="videoSelect"
      :show-file-list="false"
    >
      <div class="el-upload--picture-card" title="点击上传视频">
        <video
          ref="video"
          v-if="videoUrl"
          width="100%"
          height="224px"
          controls="controls"
        >
          <source :src="videoUrl" type="video/mp4" />
        </video>
        <div v-else-if="!isUpload" class="upload-tip">
          <i class="el-icon-plus avatar-uploader-icon" />
          <!--                      <font size="1">(仅限上传不超过50M的视频文件)</font>-->
        </div>
        <div v-if="isUpload" class="upload-tip progress">
          <el-progress
            :color="customColor"
            :text-inside="true"
            :stroke-width="13"
            :status="exception"
            :percentage="progress"
          ></el-progress>
          <i
            style="font-size: 16px; color: #ff7736"
            title="取消上传"
            @click.stop="cancelUpload"
            class="el-icon-error"
          />
        </div>
      </div>
    </el-upload>
    <div class="tip-text">
      仅限上传不超过50M的视频文件
    </div>
  </div>
</template>

<script>
import { errorMsg, uuid, warningMsg } from "@/commonutils/common";
import { OssRequset } from "@/commonutils/aliOSS";
import { mapState } from "vuex";

export default {
  name: "videoUpload",
  data() {
    return {
      client: null,
      progress: 0,
      customColor: "26AF61",
      isUpload: false,
      videoUrl: "",
      exception: "success"
    };
  },
  props: {
    video: {
      type: String,
      default: ""
    }
  },
  watch: {
    video: {
      handler(val) {
        this.videoUrl = val;
      },
      immediate: true
    }
  },
  computed: {
    ...mapState(["user", "aliyunOss"])
  },
  methods: {
    /**
     * 取消文件上传
     * @returns {void}
     */
    cancelUpload() {
      if (this.client) {
        this.client.cancel();
        setTimeout(() => {
          this.isUpload = false;
          this.progress = 0;
        }, 200);
      }
    },
    /**
     * 添加视频成功时返回
     * @param {Object} file
     * @returns {void}
     */
    async videoSelect(file) {
      if (this.client) {
        warningMsg(this, "视频正在上传请不要重复上传！");
        return;
      }
      const isLt2M = file.size / 1024 / 1024 < 50; // 图片大小
      if (!isLt2M) {
        this.$message.error("视频文件大小不能超过 50MB!");
      }
      const image = file.raw;
      this.isUpload = true;
      this.customColor = "#26AF61";
      if (this.videoUrl) {
        this.$refs.video.load();
      }
      this.client = await OssRequset("video");
      const _obj = this.aliyunOss.vdoPath + "/" + uuid();
      this.client
        .multipartUpload(_obj, image, {
          progress: p => {
            //获取进度条的值
            this.progress = parseInt(p * 100);
          }
        })
        .then(result => {
          //下面是如果对返回结果再进行处理，根据项目需要
          this.videoUrl = this.aliyunOss.vdoHost + result.name;
          this.$emit("update:video", this.aliyunOss.vdoHost + result.name);
          this.$nextTick(() => {
            this.$refs.video.load();
          });
          this.$forceUpdate();
          this.isUpload = false;
          this.progress = 0;
          this.client = null;
        })
        .catch(err => {
          if (err.status === 0 && err.name === "cancel") {
            warningMsg(this, "已取消上传");
          } else {
            errorMsg(this, err);
          }
          this.isUpload = false;
          this.customColor = "#f56c6c";
          this.client = null;
        });
    }
  }
};
</script>
<style lang="scss" scoped>
@import "./videoUpload";
</style>
