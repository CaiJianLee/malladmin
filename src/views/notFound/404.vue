<template>
  <el-row class="not-found">
    <el-col :span="12" class="left"></el-col>
    <el-col :span="12" class="right">
      <h1>404</h1>
      <h2>抱歉，你访问的页面不存在</h2>
      <div>
        <el-button type="primary">
          回到首页
        </el-button>
      </div>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: "404"
};
</script>

<style scoped lang="scss">
.not-found {
  background-color: #f0f2f5;
  height: 100%;

  .left {
    height: 100%;
    min-height: 360px;
    margin-top: 150px;
    background: url("../../assets/images/404.png") no-repeat center;
  }

  .right {
    text-align: left;
    padding-left: 50px;
    margin-top: 150px;

    h1 {
      font-size: 35px;
    }

    h2 {
      margin: 20px 0;
      font-size: 20px;
    }
  }
}
</style>
