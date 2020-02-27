<template>
  <section class="layout">
    <div class="specifications-set">
      <div class="type-sub" v-if="this.specificationsData.length < 2 && !isEdit">
        <div class="red">*</div>
        <el-button
          size="medium"
          type="primary"
          icon="el-icon-plus"
          @click="addSpecifications"
          >添加规格</el-button
        >
      </div>
      <div class="min-scrollbar">
        <template v-for="(item, index) in specificationsData">
          <div :key="index" class="tag-list">
            <div class="tag-item name">
              <el-form-item label="规格名称">
                <el-input
                  size="medium"
                  style="width: 150px;"
                  v-model="item.specifications"
                >
                  <el-button
                    v-if="!isEdit"
                    type="text"
                    slot="suffix"
                    icon="el-icon-error"
                    @click="delSpecifications(item)"
                  ></el-button>
                </el-input>
              </el-form-item>
            </div>
            <div class="type-list">
              <div class="tag-item" v-for="type in item.type" :key="type.id">
                <el-input
                  size="medium"
                  style="width: 150px;"
                  v-model="type.name"
                >
                  <el-button
                    v-if="type.isNew"
                    type="text"
                    size="medium"
                    slot="suffix"
                    icon="el-icon-error"
                    @click="delType(type, item)"
                  ></el-button>
                </el-input>
              </div>
              <div class="tag-item" v-if="item.type.length < 10">
                <el-button
                  size="medium"
                  icon="el-icon-plus"
                  @click="addType(item)"
                  >添加规格值</el-button
                >
              </div>
            </div>
          </div>
        </template>
        <div class="type-sub" v-if="this.specificationsData.length">
          <el-button class="save" type="primary" title="点击保存并生成规格明细" @click="saveData">保存</el-button>
        </div>
      </div>
      <main class="specifications-table" v-if="tableData.length">
        <div class="table-title">
          规格明细
        </div>
        <el-table
          :data="tableData"
          border
          max-height="400"
          size="mini"
          style="width: 100%"
        >
          <el-table-column v-for="(item, index) in headData" :key="item + index" :label="item">
            <template slot-scope="scope">
              <span>{{ scope.row[item] }}</span>
            </template>
          </el-table-column>
          <el-table-column label="原价">
            <template slot-scope="scope">
              <el-input-number
                style="width:100%"
                size="mini"
                v-model="scope.row.showPrice"
                controls-position="right"
                :precision="2"
                :step="0.1"
                :min="0.01"
                :max="99999"
              />
            </template>
          </el-table-column>
          <el-table-column label="售价">
            <template slot-scope="scope">
              <el-input-number
                size="mini"
                style="width:100%"
                v-model="scope.row.costPrice"
                controls-position="right"
                :precision="2"
                :step="0.1"
                :min="0.01"
                :max="99999"
              />
            </template>
          </el-table-column>
          <el-table-column label="当前库存">
            <template slot-scope="scope">
              <el-input-number
                style="width:100%"
                size="mini"
                v-model="scope.row.count"
                controls-position="right"
                step-strictly
                type="number"
                :min="1"
                :max="99999"
              />
            </template>
          </el-table-column>
          <el-table-column label="商品编码">
            <template slot-scope="scope">
              <el-input
                size="mini"
                v-model="scope.row.snCode"
                :min="1"
                :max="30"
              />
            </template>
          </el-table-column>
          <el-table-column label="图片(750*750,<1MB)">
            <template slot-scope="scope">
              <image-upload
                :width="'50px'"
                :height="'50px'"
                :isShowTip="false"
                :image.sync="scope.row.cover"
              ></image-upload>
            </template>
          </el-table-column>
          <el-table-column v-if="isEdit" label="状态" width="80">
            <template slot-scope="scope">
              {{ scope.row.statusName }}
            </template>
          </el-table-column>
          <el-table-column v-if="isEdit" label="操作" width="80">
            <template slot-scope="scope">
              <el-button v-if="!scope.row.isNew" @click="changeStatus(scope.row)" type="text">
                {{ scope.row.status === 3 ? "下架" : "上架" }}
              </el-button>
              <template v-else>-</template>
            </template>
          </el-table-column>
        </el-table>
      </main>
      <main class="specifications-table" v-if="tableData.length">
        <div class="table-title">
          总库存
        </div>
        <div class="">{{ total }}</div>
      </main>
    </div>
  </section>
</template>

<script>
import {
  jsonDeepClone,
  warningMsg,
  uuid,
  successMsg,
  STATUS_CODE
} from "@/commonutils/common";
import imageUpload from "@/components/imageUpload";
import { updateStatus } from "../createGoods/controller/request";
export default {
  name: "GoodsSpecifications",
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    options: {
      type: Array,
      default() {
        return [];
      }
    },
    sku: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  components: {
    imageUpload
  },
  data() {
    return {
      total: 0,
      tableData: [],
      headData: [],
      priceList: [],
      specificationsData: []
    };
  },
  watch: {
    // 父组件传入规格列表，监听并同步到规格列表：specificationsData
    options: {
      handler(val) {
        if (val && val.length) {
          this.specificationsData = jsonDeepClone(val);
          this.headData = val.map(item => {
            return item.specifications;
          });
        }
      },
      immediate: true
    },
    // 父组件传入sku列表，监听并同步到规格详情表格：tableData
    sku: {
      handler(val) {
        if (val.length) {
          this.tableData = jsonDeepClone(val);
        }
      },
      deep: true,
      immediate: true
    },
    // 监听规格详情表格数据并实时存入备份数据：priceList
    tableData: {
      handler(val) {
        if (val.length) {
          let count = 0;
          this.priceList = val;
          val.forEach(item => (count += item["count"]));
          this.total = count;
        }
      },
      deep: true,
      immediate: true
    }
  },
  methods: {
    /**
     * @description 修改sku状态
     * @param {Object} val
     * @returns { void }
     */
    async changeStatus(val) {
      const status = val.status === 3 ? 4 : 3;
      this.$confirm(`确定要${status === 3 ? "上架" : "下架"}sku？`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消"
      })
        .then(() => {
          this.isLoading = true;
          this.interceptorFn(async () => {
            const { code, msg } = await updateStatus({
              id: val.id,
              status: status
            });
            if (code !== STATUS_CODE.success) {
              warningMsg(this, msg);
              return;
            }
            this.$set(
              val,
              "statusName",
              val.status === 3 ? "已下架" : "上架中"
            );
            this.$set(val, "status", status);
            successMsg(this, "操作成功");
          });
        })
        .catch(() => {});
    },
    /**
     * @description 判断数组是否重复
     * @param {Array} list
     * @returns { void }
     */
    isRepeat(list) {
      let hash = {};
      for (let i in list) {
        if (hash[list[i]]) {
          return true;
        }
        hash[list[i]] = true;
      }
      return false;
    },
    /**
     * @description 保存规格，并将规格列表更新到父组件
     * @returns { void }
     */
    saveData() {
      let originObj = this.specificationsData;
      let tableData = [];
      let headData = [];
      const checkTypeList = [];
      // 规格判空
      if (!originObj.length) {
        warningMsg(this, "请先添加规格");
        return;
      }
      // 规格数据校验
      for (let item of originObj) {
        if (!item.specifications) {
          warningMsg(this, "规格名称不能为空");
          return;
        }
        if (item.specifications.length > 10) {
          warningMsg(this, "规格名称不能超过10个字符");
          return;
        }
        if (!item.type.length) {
          warningMsg(
            this,
            `请至少给【${item.specifications}】规格添加一种类型`
          );
          return;
        }
        for (let child of item.type) {
          if (!child.name) {
            warningMsg(this, "规格值不能为空");
            return;
          }
          if (child.name.length > 10) {
            warningMsg(this, "规格值不能超过10个字符");
            return;
          }
        }
        headData.push(item.specifications);
      }
      if (originObj[1]) {
        // 循环第一种规格，并将规格值插入checkTypeList数组，后续进行去重判断
        for (let item of originObj[1].type) {
          checkTypeList.push(item.name);
        }
      }
      // 循环第二种规格
      for (let node of originObj[0].type) {
        // 将规格值插入checkTypeList数组，后续进行去重判断
        checkTypeList.push(node.name);
        // 如果存在多种规格则循环该规格列表，并组合数据
        if (originObj[1]) {
          // 循环规格值列表。格式化规格，并组合规格详情表格数据
          for (let item of originObj[1].type) {
            let obj = {};
            if (item.name && node.name) {
              // 循环规格1和规格2规格值拼接作为uid后续用来数据对比
              let key = node.name + "-" + item.name;
              if (this.priceList.length) {
                // 开始对比数据，将当前key和之前checkTypeList数组保存的数据进行对比
                for (let item of this.priceList) {
                  // 如果key相同将checkTypeList数组保存的数据回填到当前对象中，并且中止循环
                  if (item.uid === key) {
                    obj["showPrice"] = item.showPrice;
                    obj["costPrice"] = item.costPrice;
                    obj["count"] = item.count;
                    obj["snCode"] = item.snCode;
                    obj["snstatusNameCode"] = item.statusName || "-";
                    obj["cover"] = item.cover;
                    break;
                  } else {
                    // 如果key不相同，判断当前数据为新增数据，并设置初始值
                    obj["showPrice"] = 1;
                    obj["costPrice"] = 1;
                    obj["count"] = 1;
                    obj["snCode"] = "";
                    obj["cover"] = "";
                    obj["statusName"] = "-";
                    obj["isNew"] = true;
                  }
                }
              } else {
                obj["showPrice"] = 1;
                obj["costPrice"] = 1;
                obj["count"] = 1;
                obj["snCode"] = "";
                obj["statusName"] = "-";
                obj["cover"] = "";
                obj["isNew"] = true;
              }
              // 用规格值作为key设置对象数据
              obj[originObj[0].specifications] = node.name;
              obj[originObj[1].specifications] = item.name;
              obj.uid = key;
              obj.valueList = [node.name, item.name];
              // 将组合好的数据插入到规格详情表格tableData
              tableData.push(obj);
            }
          }
        } else {
          // 如果只有一种规格
          let obj = {};
          let key = node.name;
          if (!node.name) {
            return;
          }
          obj[originObj[0].specifications] = node.name;
          obj.uid = key;
          obj.valueList = [key];
          // 判断当前对象key是否和备份数据priceList的key是否相同
          if (this.priceList.length) {
            for (let item of this.priceList) {
              // 如果相同则回填
              if (item.uid === key) {
                obj["showPrice"] = item.showPrice;
                obj["costPrice"] = item.costPrice;
                obj["count"] = item.count;
                obj["snCode"] = item.snCode;
                obj["cover"] = item.cover;
                obj["statusName"] = item.statusName || "-";
                break;
              } else {
                obj["showPrice"] = 1;
                obj["costPrice"] = 1;
                obj["count"] = 1;
                obj["snCode"] = "";
                obj["statusName"] = "-";
                obj["cover"] = "";
                obj["isNew"] = true;
              }
            }
          } else {
            obj["showPrice"] = 1;
            obj["costPrice"] = 1;
            obj["count"] = 1;
            obj["snCode"] = "";
            obj["statusName"] = "-";
            obj["cover"] = "";
            obj["isNew"] = true;
          }
          tableData.push(obj);
        }
      }
      if (this.isRepeat(checkTypeList)) {
        warningMsg(this, "规格值不能重复，请重新输入");
        return;
      }
      this.tableData = tableData;
      this.headData = headData;
      // 将组合后的数据更新到父组件
      this.$emit("update:options", this.specificationsData);
    },
    /**
     * @description 删除类型
     * @param {Object} type
     * @param {Object} item
     * @returns {void}
     */
    delType(type, item) {
      item.type = item.type.filter(val => val.id !== type.id);
    },
    /**
     * @description 删除规格
     * @param {Object} item
     * @returns {void}
     */
    delSpecifications(item) {
      this.specificationsData = this.specificationsData.filter(
        val => val.id !== item.id
      );
      this.tableData = [];
      this.headData = [];
    },
    /**
     * @description 添加规格值
     * @param {Object} item
     * @returns {void}
     */
    addType(item) {
      if (item.type.length >= 10) {
        warningMsg(this, "规格最多只能添加10种");
        return;
      }
      item.type.push({
        name: "",
        id: uuid(),
        isNew: true
      });
    },
    /**
     * 新增规格
     * @returns {void}
     */
    addSpecifications() {
      if (this.specificationsData.length >= 2) {
        warningMsg(this, "规格最多只能添加两种");
        return;
      }
      this.specificationsData.push({
        specifications: "",
        id: uuid(),
        type: [
          {
            name: "",
            id: uuid()
          }
        ]
      });
    }
  }
};
</script>

<style scoped lang="scss">
.specifications-set {
  width: auto;
  margin: 0 auto;
  .tag-list {
    margin-top: 20px;
    max-height: 300px;
    display: flex;
    flex-direction: column;
    .type-list {
      display: flex;
      padding-left: 68px;
      margin-top: 20px;
      flex-wrap: wrap;
      .tag-item {
        margin-right: 20px;
        margin-bottom: 20px;
      }
    }
  }
  .specifications-table {
    min-width: 1000px;
    display: flex;
    /*padding-left: 30px;*/
    margin-top: 20px;
    .table-title {
      font-size: 14px;
      color: #333333;
      font-weight: bolder;
      padding-right: 15px;
    }
  }
  .type-sub {
    display: flex;
    align-items: center;
    > .save {
      margin-left: 68px;
    }
    > div.red {
      color: #f00;
      margin-right: 5px;
    }
  }
}
</style>
