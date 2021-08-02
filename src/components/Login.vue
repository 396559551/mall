<template>
<div class="login_container">
  <div class="login_box">
    <!--头像区域-->
    <div class="avatar_box">
      <img src="../assets/logo.png" alt="">
    </div>
    <!--登录表单区域-->
    <el-form
        class="login_form"
        :model="loginForm"
        :rules="loginFormRules"
        ref="loginFormRef"
    >

      <el-form-item prop="username">
        <el-input
            prefix-icon="el-icon-user"
            v-model="loginForm.username"
        />
      </el-form-item>

      <el-form-item prop="password">
        <el-input
            prefix-icon="el-icon-lock"
            v-model="loginForm.password"
            type="password"
        />
      </el-form-item>

      <el-form-item class="btns">
        <el-button type="primary" @click="login">登录</el-button>
        <el-button type="info" @click="resetLoginForm">重置</el-button>
      </el-form-item>
    </el-form>
  </div>
</div>
</template>

<script>
export default {
  name: "login",
  data() {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur'},
          { min: 3, max: 5, message: '长度在3到5个字符', trigger: 'blur'}
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur'},
          { min: 6, max: 8, message: '长度在6到8个字符', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    //重置表单
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      this.$refs.loginFormRef.validate(valid => {
        if (valid) {
          this.$http.post('login',this.loginForm).then(response => {
            const { data } = response
            if (data.meta.status !== 200) {
              this.$message({
                message: '登录失败',
                type: 'error'
              })
            } else {
              this.$message({
                message: '登录成功',
                type: 'success'
              })
              sessionStorage.setItem('token', data.data.token)

              this.$router.push('/home')
            }
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.login_container {
  background-color: #2b4b6b;
  height: 100%;

  .login_box {
    width: 450px;
    height: 300px;
    background-color: #fff;
    border-radius: 5px;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    .avatar_box {
      height: 130px;
      width: 130px;
      border: 1px solid #eee;
      border-radius: 50%;
      padding: 10px;
      box-shadow: 0 0 10px #5a5050;
      position: absolute;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: #fff;
      img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        border-color: #eee;
      }
    }
  }

  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding:0 20px;
    box-sizing: border-box;
  }
  .btns {
    display: flex;
    justify-content: flex-end;// 尾部对齐
  }
}
</style>