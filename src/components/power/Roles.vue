<template>
<div>
  <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
  <el-card>
    <el-row>
      <el-col>
        <el-button type="primary">添加角色</el-button>
      </el-col>
    </el-row>
    <!-- 角色列表区 -->
    <el-table :data="rolesList" border stripe>
      <el-table-column type="expand" label="详细">
        <template v-slot="scope">
          <el-row
              :class="['bdbottom',i1 === 0 ? 'bdtop' : '','vcenter']"
              v-for="(item1,i1) in scope.row.children"
              :key="item1.id"
          >
            <!-- 一级权限 -->
            <el-col :span="5">
              <el-tag
                  closable
                  @close="removeRightById(scope.row,item3.id)"
              >
                {{item1.authName}}
              </el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <!-- 二级权限和三级权限 -->
            <el-col :sapn="19" >
              <!-- 二级权限 -->
              <el-row
                  :class="[i2 === 0 ? '' : 'bdtop','vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
              >
                <el-col :span="6">
                  <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                  >
                    {{item2.authName}}
                  </el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>

                <el-col :span="18">
                  <el-tag type="warning"
                          v-for="(item3) in item2.children"
                          :key="item3"
                          closable
                          @close="removeRightById(scope.row,item3.id)"
                  >
                    {{item3.authName}}
                  </el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column type="index" label="序号"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template v-slot="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
            <el-button type="danger" icon="el-icon-edit" size="mini">删除</el-button>
            <el-button
                type="warning"
                icon="el-icon-edit"
                size="mini"
                @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
    </el-table>
  </el-card>
  <!-- 分配权限对话框 -->
      <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <el-tree
        :data="rightsList"
        :props="treeProps"
        ref="treeRef"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defKeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

</div>
</template>

<script>
export default {
  name: "Roles",
  data() {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 控制分配权限对话框的显示与隐藏
      setRightDialogVisible: false,
      // 所有权限的列表
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的id值数组
      defKeys: [],
      // 当前即将分配角色的id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    getRolesList() {
      this.$http.get('roles').then(response => {
        const { data } = response
        if (data.meta.status !== 200) {
          return this.$message.error('获取权限列表失败')
        } else {
          this.rolesList = data.data
        }
      })
    },
    // 根据id删除对应的权限tag
    removeRightById(role, rightId) {
      this.$confirm('此操作将删除该权限，是否继续','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }).then(() => {
        this.$http.delete(`roles/${role.id}/rights/${rightId}`).then(response => {
          const { data } = response
          if (data.meta.status !== 200) {
            return this.$message.error('获取用户失败，删除失败')
          } else {
            role.children = data.data
            this.$message.success('删除成功')
          }
        })
      }
      ).catch(() => {
        this.$message.error('已取消删除')
      })
    },
    // 展示权限分配的对话框
    showSetRightDialog(role) {
      this.roleId = role.id
      // 获取所有权限列表
      this.$http.get('rights/tree').then(response => {
        const { data } = response
        if (data.meta.status !== 200) {
          return this.$message.error('获取权限列表失败')
        } else {
          this.rightsList = data.data
        }
      })
      this.getLeafKeys(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id，并保存到defKeys数组中
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id)
      } else {
        node.children.forEach(item => {
          this.getLeafKeys(item, arr)
        })
      }
    },
    // 监听分配权限对话框的关闭事件
    setRightDialogClosed() {
      this.defKeys = []
    },
    // 点下确定分配权限
    allotRights() {
       const keys = [
           ...this.$refs.treeRef.getCheckedKeys(),
           ...this.$refs.treeRef.getHalfCheckedKeys()
       ]
      const idStr = keys.join(',')
      this.$http.post(`roles/${this.roleId}/rights`,{ rids: idStr }).then(response => {
        const { data } = response
        if (data.meta.status !== 200) {
          return this.$message.error('分配权限列表失败')
        } else {
          this.$message.success('分配权限列表成功')
          this.getRolesList()
          this.setRightDialogVisible = false
        }
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eeeeee;
}
.bdbottom {
  border-bottom: 1px solid #eeeeee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>