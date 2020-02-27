<template>
  <el-header
    height="88px"
    class="layout"
    style="text-align: right; font-size: 12px"
  >
<!--    <div class="collapse"><el-button  @click=" $emit('update:isCollapse', !isCollapse)">展开</el-button></div>-->
    <div class="login-info">
      <el-avatar :size="48" :src="user.userInfo.userAvatar" @error="errorHandler">
        <img src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"/>
      </el-avatar>
      <el-dropdown @command="exit" class="login-dropdown">
        <div class="login-box">
          <span class="userNick">{{ user.userInfo.nickName }}</span>
          <i
            class="el-icon-caret-bottom el-icon--right"
            style="margin-right: 15px; font-size: 18px; color: #999"
          />
        </div>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item command="exit">退出登录</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script>
import { mapState } from "vuex";
import storageUtils from "@/commonutils/storageUtils";
export default {
  name: "index",
  props: {
    isCollapse: {
      type: Boolean
    }
  },
  computed: {
    ...mapState(["user"])
  },
  watch: {},
  methods: {
    errorHandler() {
      return true;
    },
    exit(val) {
      if (val === "exit") {
        this.$confirm("你确定要退出登录？", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消"
        })
          .then(() => {
            storageUtils.removeUser();
            this.$router.push({
              path: "/login"
            });
          })
          .catch(() => {});
      }
    }
  }
};
</script>

<style scoped lang="scss">
.layout {
  display: flex;
  justify-content: flex-end;
  background-color: #fff;
  border: 1px solid #eeeeee;
  .login-dropdown {
    margin-left: 15px;
    cursor: pointer;
  }
  .login-info {
    display: flex;
    justify-content: center;
    align-items: center;
    .userNick {
      font-size: 16px;
    }
  }
}
</style>
