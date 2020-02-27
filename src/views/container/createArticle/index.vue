<template>
  <el-container class="layout">
    <el-header height="31px" class="goods-created-layout">
      <el-breadcrumb v-if="routeData.query.path_">
        <el-breadcrumb-item :to="{ path: routeData.query.path_ }">
          {{ routeData.query.title_ }}
        </el-breadcrumb-item>
        <el-breadcrumb-item>{{ routeData.meta.title }}</el-breadcrumb-item>
      </el-breadcrumb>
    </el-header>
    <el-main>
      <el-form
        v-loading="isLoading"
        :rules="rules"
        size="medium"
        class="from-layout"
        ref="goodsForm"
        label-position="left"
        :model="form"
      >
        <el-card class="box-card" shadow="never" body-style="border: 0;">
          <div slot="header" class="from-layout-title">
            <div>基本信息</div>
            <el-button type="text" @click="show1 = !show1" size="mini">
              {{ show1 ? "收起" : "展开" }}
              <i
                style="font-weight: bolder"
                :class="[show1 ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"
              ></i>
            </el-button>
          </div>
          <el-collapse-transition>
            <el-main v-show="show1" class="card-content">
              <el-form-item label="内容分类" prop="type">
                <el-select
                  v-model="form.type"
                  filterable
                  placeholder="请选择内容分类"
                >
                  <el-option
                    style="width: 217px"
                    v-for="item in contentTypeList"
                    :key="item.id"
                    :label="item.name"
                    :title="item.name"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item label="内容标题" prop="title">
                <el-input
                  style="width: 350px;"
                  clearable
                  placeholder="请输入内容标题"
                  v-model="form.title"
                ></el-input>
              </el-form-item>
              <el-form-item label="内容描述" prop="describe">
                <el-input
                  type="textarea"
                  maxlength="200"
                  show-word-limit
                  style="width: 750px;"
                  clearable
                  placeholder="请输入内容描述"
                  v-model="form.describe"
                />
              </el-form-item>
              <el-form-item>
                <template slot="label">
                  <font color="#F56C6C">*</font>
                  视频封面
                </template>
                <image-upload :image.sync="form.cover" :size="{width: 430, height: 240}" />
              </el-form-item>
              <el-form-item prop="video">
                <template slot="label">
                  <font color="#F56C6C">*</font>
                  商品视频
                </template>
                <video-upload :video.sync="form.video" />
              </el-form-item>
            </el-main>
          </el-collapse-transition>
        </el-card>
        <el-card class="box-card" shadow="never" body-style="border: 0;">
          <div slot="header" class="from-layout-title">
            <div>内容详情</div>
            <el-button type="text" @click="show3 = !show3" size="mini">
              {{ show3 ? "收起" : "展开" }}
              <i
                style="font-weight: bolder"
                :class="[show3 ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"
              ></i>
            </el-button>
          </div>
          <el-collapse-transition>
            <el-main v-show="show3" class="card-content">
              <div class="form-titles">
                <font color="#F56C6C">*</font> 内容正文
              </div>
              <editor :content.sync="form.details" :layout="editLayout" />
            </el-main>
          </el-collapse-transition>
        </el-card>
        <el-form-item class="from-operation">
          <el-button
            type="primary"
            :disabled="isRelease"
            :loading="isRelease"
            @click="save('goodsForm')"
            >保存</el-button
          >
        </el-form-item>
      </el-form>
    </el-main>
    <el-dialog
      title="内容详情预览"
      class="goodsInfoView-box"
      fullscreen
      :visible.sync="dialogVisible"
      width="50%"
    >
      <div class="goodsInfoView-content" v-html="form.goodsInfo"></div>
      <!--      <span slot="title" class="dialog-footer">-->
      <!--        <el-button type="primary" @click="dialogVisible = true">确 定</el-button>-->
      <!--      </span>-->
    </el-dialog>
  </el-container>
</template>
<script>
import index from "./controller/index";
export default index;
</script>
<style src="./css/index.scss" scoped lang="scss"></style>
<style lang="scss" src="./css/global.scss"></style>
