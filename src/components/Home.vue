<template>
<el-container>
  <el-header>Header<el-button type="info" @click="logout">退出</el-button></el-header>
  <el-container>
    <el-aside width="200px">Aside</el-aside>
    <el-main>Main</el-main>
  </el-container>
</el-container>
</template>

<script>
export default {
  name: "Home",
  methods: {
    logout() {
      sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style  lang="scss" scoped>
.el-aside {
    background-color: #D3DCE6;
    color: #333;
    text-align: center;
    line-height: 200px;
  }
.el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    line-height: 160px;
  }
.el-header,{
    background-color: #B3C0D1;
    color: #333;
    text-align: center;
    line-height: 60px;
  }
body > .el-container {
    margin-bottom: 40px;
  }

  .el-container:nth-child(5) .el-aside,
  .el-container:nth-child(6) .el-aside {
    line-height: 260px;
  }

  .el-container:nth-child(7) .el-aside {
    line-height: 320px;
  }
</style>