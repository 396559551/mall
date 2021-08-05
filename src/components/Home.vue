<template>
<el-container class="home-container">
  <!--头部区域-->
  <el-header>
    <div>
      <img src="../assets/logo.png" alt="" >
      <span>电商后台管理</span>
    </div>
    <el-button type="info" @click="logout">退出</el-button>
  </el-header>
  <!--页面主体区域-->
  <el-container>
    <!--侧边栏-->
    <el-aside :width="isCollapse ? '64px' : '200px'">
      <div class="toggle-button"
           @click="toggleCollapse"
      >|||</div>
      <el-menu
      background-color="#333744"
      text-color="#fff"
      active-text-color="#ffd04b"
      unique-opened
      :collapse="isCollapse"
      :collapse-transition="false"
      router
      :default-active="$route.path"
      >
        <!--一级菜单-->
      <el-submenu :index="item.id + ''" v-for="item in menuList" :key="item.id">
        <!--一级菜单模板区域-->
        <template slot="title">
          <!--图标-->
          <i class="el-icon-location"></i>
          <!--文本-->
          <span>{{ item.authName}}</span>
        </template>
          <!--二级菜单-->
        <el-menu-item
            :index="'/' + subItem.path"
            v-for="subItem in item.children"
            :key="subItem.id"
        >
          <!--二级菜单模板区域-->
          <template slot="title">
          <!--图标-->
          <i class="el-icon-menu"></i>
          <!--文本-->
          <span>{{ subItem.authName}}</span>
        </template>
        </el-menu-item>
      </el-submenu>
    </el-menu>
    </el-aside>

    <!--右侧内容区域-->
    <el-main>
      <router-view />
    </el-main>
  </el-container>
</el-container>
</template>

<script>
export default {
  name: "Home",
  created() {
    this.getList()
  },
  data() {
    return {
      menuList: [],
      isCollapse: false
    }
  },
  methods: {
    logout() {
      sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取菜单
    getList() {
      this.$http.get('menus' ).then(response => {
        const { data } = response
        // console.log(response);
        // console.log(data);
        if (data.meta.status !==200) {
          return this.$message.error(data.meta.msg)
        } else {
          this.menuList = data.data
        }
      })
    },
    toggleCollapse() {
      return !this.isCollapse
    }
  }
}
</script>

<style  lang="scss" scoped>
.home-container {
  height: 100%;
}
.el-header {
  display: flex;
  background-color: #B3C0D1;
  color: #fff;
  justify-content: space-between;
  font-size: 20px;
  padding-left: 0;
  align-items: center;
  div {
    display: flex;
    align-items: center;
    img {
      height: 60px;
      width: 60px;
    }
    span {
      margin-left: 15px;
    }
  }

  }
.el-aside {
    background-color: #D3DCE6;
    .el-menu {
      border-right: 0;
    }
  }
.el-main {
    background-color: #E9EEF3;
    color: #333;
    text-align: center;
    line-height: 160px;
  }
.toggle-button {
  background-color: #4A5064;
  font-size: 10px;
  line-height: 24px;
  color: #fff;
  text-align: center;
  letter-spacing: .2em;
  cursor: pointer;

}

</style>