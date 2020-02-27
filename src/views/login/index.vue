<template>
  <el-row class="login-from-layout">
    <el-col :span="12" class="form-container">
      <el-form
        :model="ruleForm2"
        :rules="rules2"
        ref="ruleForm2"
        @keyup.enter.native="submitForm('ruleForm2')"
        class="login-box"
        size="medium"
      >
        <el-form-item class="login-form-title">
          <div class="titles">WELCOME</div>
          <div class="contents">欢迎登录创想三维商城后台管理系统</div>
        </el-form-item>
        <el-form-item label="账号" prop="account" class="login-form-content">
          <el-input
            type="text"
            v-model="ruleForm2.account"
            auto-complete="on"
          ></el-input>
        </el-form-item>
        <el-form-item
          label="密码"
          prop="password"
          style="margin-bottom: 10px"
          class="login-form-content"
        >
          <el-input
            :type="visible ? 'password' : 'text'"
            v-model="ruleForm2.password"
            auto-complete="off"
          >
            <i
              slot="suffix"
              :title="visible ? '显示密码' : '隐藏密码'"
              @click="visible = !visible"
              :style="{ color: visible ? '' : '#51bf81' }"
              class="el-icon-view"
            ></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="type" style="margin-bottom: 30px" align="left">
          <el-checkbox
            v-model="ruleForm2.remember"
            label="记住密码"
            name="type"
          ></el-checkbox>
        </el-form-item>
        <el-form-item class="login-form-content">
          <el-button
            :type="isDisabled ? 'info' : 'primary '"
            :disabled="isDisabled"
            :loading="isLoading"
            @click="submitForm('ruleForm2')"
            >登录</el-button
          >
        </el-form-item>
      </el-form>
    </el-col>
    <el-col :span="12" class="form-bg">
      <div class="bg-purple-light">
        <img src="../../assets/images/bg-logo.png" />
      </div>
    </el-col>
  </el-row>
</template>

<script>
import ajax from "@/api/ajax";
import storageUtils from "@/commonutils/storageUtils";
import { successMsg, warningMsg } from "@/commonutils/common";
export default {
  data() {
    let validatePass = (rule, value, callback) => {
      if (value === "") {
        this.isDisabled = true;
        callback(new Error("请输入密码"));
      } else if (value.length < 6 || value.length >= 16) {
        callback(new Error("密码长度为6到16个字符"));
      } else {
        if (this.ruleForm2.account) {
          this.isDisabled = false;
        }
        callback();
      }
    };
    let validatePass2 = (rule, value, callback) => {
      if (value === "") {
        this.isDisabled = true;
        callback(new Error("请输入账号"));
      } else {
        if (this.ruleForm2.password) {
          this.isDisabled = false;
        }
        callback();
      }
    };
    return {
      isLoading: false,
      visible: true,
      SUCC_CODE: process.env.VUE_APP_BASE_SUCC_CODE,
      isDisabled: true,
      ruleForm2: {
        password: "",
        account: "",
        remember: false
      },
      rules2: {
        password: [{ validator: validatePass, trigger: ["blur", "change"] }],
        account: [{ validator: validatePass2, trigger: ["blur", "change"] }]
      }
    };
  },
  created() {
    const userName = localStorage.getItem("user_name");
    const passWord = localStorage.getItem("user_pwd");
    if (userName && passWord) {
      this.ruleForm2.password = passWord;
      this.ruleForm2.account = userName;
      this.isDisabled = false;
    }
  },
  methods: {
    /**
     * 登录
     * @method
     * @param {String} account 登录名
     * @param {String} password 密码
     * @param {Number} osLang 登录预言类型
     * @return {Object} 返回值 包括code,msg,result
     */
    reqLogin(account, password, osLang) {
      return ajax(
        "/api/mall/manager/user/login",
        { account, password, clientCtx: { platformType: 3, osLang: osLang } },
        "POST"
      );
    },
    /**
     * 登录方法
     * @param {Object} formName
     * @returns {void}
     */
    submitForm(formName) {
      const this_ = this;
      this.$refs[formName].validate(async valid => {
        if (valid) {
          this.isLoading = true;
          const { account, password, remember } = this.ruleForm2;
          let relAccount = account === "root" ? account : `admin_${account}`; // 真实账户需要加上前缀admin_
          // let osLang = this.$i18n.locale === "zh" ? 1 : 0;
          let osLang = 1;
          const response = await this.reqLogin(relAccount, password, osLang);
          if (response.code === parseInt(this_.SUCC_CODE)) {
            successMsg(this, "登录成功");
            this.token = response.result.token;
            const user = response.result;
            await storageUtils.saveUser(user);
            if (remember) {
              storageUtils.saveUserName(account);
              storageUtils.savePwd(password);
            } else {
              storageUtils.removeUserName();
              storageUtils.removeUserPwd();
            }
            await this.$store.commit("setUser", user);
            this.$router.replace("/");
          } else {
            warningMsg(this, response.msg);
          }
          setTimeout(() => {
            this.isLoading = false;
          }, 1000);
        }
      });
    },
    resetForm(formName) {
      this.$refs[formName].resetFields();
    }
  }
};
</script>

<style scoped lang="scss">
.login-from-layout {
  height: 100vh;
  overflow-y: hidden;
  .form-bg {
    height: 100%;
    background-color: #26af61;
    .bg-purple-light {
      background: url("../../assets/images/bg-1.png") no-repeat center;
      background-size: cover;
      height: 100%;
      display: flex;
      justify-content: center;
      justify-items: center;
      align-items: center;
    }
  }
  .form-container {
    padding: 0 20px;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .login-form-title {
    margin-bottom: 55px;
    width: 100%;
    .titles {
      font-family: fantasy;
      font-size: 46px;
      font-weight: bolder;
      font-stretch: normal;
      line-height: 1;
      letter-spacing: 1px;
      color: #27b062;
    }
    .contents {
      font-family: MicrosoftYaHei;
      font-size: 22px;
      font-weight: normal;
      font-stretch: normal;
      line-height: 2.5;
      letter-spacing: 2px;
      color: #27b062;
    }
  }
}
.login-box {
  width: 460px;
}
/*  14寸显示屏样式  */
@media screen and (max-width: 1370px) {
  .login-from-layout {
    .login-box {
      width: 400px;
    }
    .bg-purple-light {
      > img {
        width: 180px;
      }
    }
    .login-form-title {
      .contents {
        font-size: 18px;
      }
      .titles {
        font-size: 40px;
      }
    }
  }
}
/*  13寸显示屏样式  */
@media screen and (max-width: 1270px) {
  .login-from-layout {
    .form-container {
      padding: 0 50px;
    }
    .bg-purple-light {
      > img {
        width: 150px;
      }
    }
    .login-form-title {
      .contents {
        font-size: 16px;
      }
      .titles {
        font-size: 35px;
      }
    }
  }
}
</style>
<style lang="scss">
.login-form-content {
  position: relative;
  width: 100%;
  .el-form-item__label {
    font-size: 14px;
    color: #333;
    font-weight: bolder;
  }
  .el-form-item__content {
    width: 100%;
    line-height: 54px;
    .el-input__inner {
      height: 54px;
    }
    .el-input__suffix {
      right: 10px;
    }
    .el-button {
      width: 100%;
      line-height: 32px;
      font-size: 16px;
      > span {
        letter-spacing: 6px;
      }
      &.el-button--info.is-disabled {
        background-color: #cccccc;
        border-color: #cccccc;
      }
    }
  }
}
/*  13寸显示屏样式  */
@media screen and (max-width: 1270px) {
  .login-from-layout {
    .login-form-title {
      margin-bottom: 40px !important;
    }
    .login-form-content {
      margin-bottom: 16px;
      .el-form-item__content {
        .el-input__inner {
          height: 40px;
        }
        .el-button {
          line-height: 22px;
          font-size: 14px;
        }
        .el-form-item__error {
          padding: 0;
        }
      }
    }
  }
}
</style>
