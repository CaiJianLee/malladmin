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
            <div>商品信息</div>
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
              <el-form-item label="商品分类" prop="category">
                <el-cascader
                  :append-to-body="false"
                  style="width: 260px;"
                  filterable
                  clearable
                  v-model="form.category"
                  :props="{ value: 'id', label: 'name', emitPath: false }"
                  :options="goodsCategoryList"
                  :show-all-levels="false"
                  placeholder="请选择商品分类"
                >
                  <template slot-scope="{ node, data }">
                    <span>{{ data.name }}</span>
                    <span v-if="!node.isLeaf">
                      ({{ data.children.length }})
                    </span>
                  </template>
                </el-cascader>
              </el-form-item>
              <el-form-item label="商品名称" prop="name">
                <el-input
                  style="width: 500px;"
                  clearable
                  placeholder="请输入商品名称(2~50字符)"
                  v-model="form.name"
                ></el-input>
              </el-form-item>
              <el-form-item label="商品标签" prop="tags">
                <template slot="label">
                  <font color="#F56C6C">*</font>
                  商品标签
                </template>
                <el-select
                  :popper-append-to-body="false"
                  style="width: 500px;"
                  v-model="form.tags"
                  multiple
                  placeholder="请选择商品标签(支持多选)"
                >
                  <el-option
                    v-for="item in goodsGroup"
                    :key="item.id"
                    :label="item.name"
                    :title="item.name"
                    :value="item.id"
                  ></el-option>
                </el-select>
              </el-form-item>
              <el-form-item prop="showPrice">
                <template slot="label">
                  <font color="#F56C6C">*</font>
                  商品价格
                </template>
                <el-input
                  style="width: 260px;"
                  clearable
                  placeholder="请输入商品售价(0~99999)"
                  v-model="form.showPrice"
                >
                  <template slot="append"
                    >元</template
                  >
                </el-input>
              </el-form-item>
              <el-form-item prop="costPrice">
                <template slot="label">
                  <font color="#F56C6C">*</font>
                  商品原价
                </template>
                <el-input
                  style="width: 260px;"
                  clearable
                  placeholder="请输入商品原价(0~99999)"
                  v-model="form.costPrice"
                >
                  <template slot="append"
                    >元</template
                  >
                </el-input>
              </el-form-item>
              <el-form-item label="商品描述" prop="name">
                <el-input
                  style="width: 500px;"
                  type="textarea"
                  maxlength="100"
                  show-word-limit
                  placeholder="请输入商品描述"
                  v-model="form.description"
                ></el-input>
              </el-form-item>
              <el-form-item>
                <template slot="label"
                  ><font color="#F56C6C">*</font>
                  上传主图
                </template>
                <image-upload :image.sync="form.imgList" :isMulti="true" />
              </el-form-item>
            </el-main>
          </el-collapse-transition>
        </el-card>
        <el-card class="box-card" shadow="never" body-style="border: 0;">
          <div slot="header" class="from-layout-title">
            <div>商品规格</div>
            <el-button type="text" @click="show2 = !show2" size="mini">
              {{ show2 ? "收起" : "展开" }}
              <i
                style="font-weight: bolder"
                :class="[show2 ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"
              ></i>
            </el-button>
          </div>
          <el-collapse-transition>
            <el-main v-show="show2" class="card-content">
              <goods-specifications
                :isEdit="isEdit"
                :options.sync="form.specificationsData"
                :sku="form.sku"
                ref="specificationsData"
              ></goods-specifications>
            </el-main>
          </el-collapse-transition>
        </el-card>

        <el-card class="box-card" shadow="never" body-style="border: 0;">
          <div slot="header" class="from-layout-title">
            <div>运费信息</div>
            <el-button type="text" @click="show2 = !show2" size="mini">
              {{ show2 ? "收起" : "展开" }}
              <i
                style="font-weight: bolder"
                :class="[show2 ? 'el-icon-arrow-up' : 'el-icon-arrow-down']"
              ></i>
            </el-button>
          </div>
          <el-collapse-transition>
            <el-main v-show="show2" class="card-content">
              <el-form
                :rules="rules"
                size="medium"
                class="from-layout"
                ref="goodsForm"
                label-position="left"
                :model="form"
              >
                <el-form-item label="运费模板" prop="freightId">
                  <el-select
                    :popper-append-to-body="false"
                    style="width: 260px"
                    v-model="form.freightId"
                    placeholder="请选择运费模板"
                  >
                    <el-option
                      v-for="item in transf"
                      :key="item.id"
                      :label="item.name"
                      :title="item.name"
                      :value="item.id"
                    ></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item prop="weight">
                  <template slot="label">
                    <font color="#F56C6C">*</font>
                    物流重量
                  </template>
                  <el-input
                    style="width: 260px;"
                    :min="0"
                    clearable
                    placeholder="请输入商品重量(含包装)"
                    v-model="form.weight"
                  >
                    <template slot="append"
                      >Kg</template
                    >
                  </el-input>
                </el-form-item>
              </el-form>
            </el-main>
          </el-collapse-transition>
        </el-card>

        <el-card class="box-card" shadow="never" body-style="border: 0;">
          <div slot="header" class="from-layout-title">
            <div>商品详情</div>
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
              <div class="form-titles">产品参数</div>
              <el-form :inline="true" class="demo-form-inline">
                <el-form-item v-if="form.goodsParams[0]">
                  <template slot="label">
                    <font color="red">*</font>
                    {{ form.goodsParams[0].key }}
                  </template>
                  <el-input
                    size="medium"
                    style="width: 150px"
                    v-model="form.goodsParams[0].value"
                  ></el-input>
                </el-form-item>
                <el-form-item v-if="form.goodsParams[1]">
                  <template slot="label">
                    <font color="red">*</font>
                    {{ form.goodsParams[1].key }}
                  </template>
                  <el-input
                    size="medium"
                    style="width: 150px"
                    v-model="form.goodsParams[1].value"
                  ></el-input>
                </el-form-item>
                <el-form-item v-if="form.goodsParams.length < 10">
                  <el-button
                    size="medium"
                    v-if="goodsParamsNew.length < 10"
                    type="primary"
                    icon="el-icon-plus"
                    @click.prevent="addGoodsParams"
                    >添加自定义产品参数</el-button
                  >
                </el-form-item>
              </el-form>

              <div class="goodsParams" v-if="goodsParamsNew.length">
                <div
                  class="goodsParams-content"
                  v-for="(item, index) in goodsParamsNew"
                  :key="index"
                >
                  <el-form-item>
                    <template slot="label">
                      <!--                    <font color="red">*</font>-->
                      参数名称
                    </template>
                    <el-input v-model="item.key" style="width: 150px;">
                    </el-input>
                  </el-form-item>
                  <el-form-item>
                    <template slot="label">
                      <!--                      <font color="red">*</font>-->
                      参数值
                    </template>
                    <el-input
                      v-model="item.value"
                      style="width: 150px"
                    ></el-input>
                    <el-button
                      size="small"
                      style="margin-left: 40px;"
                      type="info"
                      @click="delGoodsParams(item)"
                    >
                      删除
                    </el-button>
                  </el-form-item>
                </div>
              </div>

              <editor
                :content.sync="form.goodsInfo"
                :layout="editLayout"
              ></editor>
            </el-main>
          </el-collapse-transition>
        </el-card>
        <el-card class="box-card" shadow="never" body-style="border: 0;">
          <div slot="header" class="from-layout-title">
            <div>服务详情</div>
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
              <editor
                :content.sync="form.serviceContent"
                :layout="editLayout"
              ></editor>
            </el-main>
          </el-collapse-transition>
        </el-card>

        <el-form-item class="from-operation">
          <el-button
            type="info"
            v-if="!isEdit"
            :disabled="isDraft"
            :loading="isDraft"
            @click="save('goodsForm', Draft)"
          >
            存为草稿
          </el-button>
          <el-button
            type="primary"
            :disabled="isRelease"
            :loading="isRelease"
            @click="save('goodsForm', Release)"
            >保存并发布</el-button
          >
        </el-form-item>
      </el-form>
    </el-main>
    <el-dialog
      title="商品详情预览"
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
<style src="./css/index.scss" scoped lang="scss" />
<style lang="scss" src="./css/global.scss" />
