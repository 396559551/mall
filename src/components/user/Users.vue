<template>
<div>
  <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
  <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索框 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList" />
          </el-input>
        </el-col>
        <!-- 搜索框 -->
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
  <!-- 用户列表区域 -->
  <el-table :data="userList" border stripe >
    <el-table-column type="index" label="序号" />
    <el-table-column label="用户名" prop="username" />
    <el-table-column label="邮箱" prop="email" />
    <el-table-column label="电话" prop="mobile" />
    <el-table-column label="角色" prop="role_name" />
    <el-table-column label="状态" prop="mg_state" >
      <template v-slot="scope">
        <el-switch
            v-model="scope.row.mg_state"
            @change="userStateChanged(scope.row)"
        />
      </template>
    </el-table-column>
    <el-table-column label="操作" width="180px">
      <template v-slot="scope">
        <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="showEditDialog(scope.row.id)"
        />

        <el-button
            type="danger"
            icon="el-icon-delete" s
            ize="mini"
            @click="removeUserById(scope.row.id)"
        />

        <el-tooltip
            effect="dark"
            content="分配角色"
            placement="top"
            :enterable="false">
          <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="setRole(scope.row)"
          />
        </el-tooltip>
      </template>
    </el-table-column>
  </el-table>
  <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[ 5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

  <!-- 添加用户的对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 内容主体 -->
      <el-form
        :model="addUserForm"
        ref="addUserFormRef"
        :rules="addUserFormRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
  <!-- 修改用户的对话框 -->
    <el-dialog
      title="修改用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <!-- 内容主体 -->
      <el-form
        :model="editUserForm"
        ref="editUserFormRef"
        :rules="editUserFormRules"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editUserForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
  <!-- 分配角色的对话框 -->
      <el-dialog
          title="分配角色"
          :visible.sync="setRoleDialogVisible"
          width="50%"
          @close="setRoleDialogClosed">
      <div>
        <p>当前用户：{{userInfo.username}}</p>
        <p>当前角色：{{userInfo.role_name}}</p>
        <p>
          分配新角色：
          <el-select
            v-model="selectRoleId"
            filterable
            allow-create
            default-first-option
            placeholder="请选择分配角色"
          >
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>

</div>
</template>

<script>
export default {
  name: "Users",
  data() {
    // 验证邮箱规则
      let checkEmail = (rule, value, cb) => {
        const regEmail = /^\w+@\w+(\.\w+)+$/
        if (regEmail.test(value)) {
          // 合法邮箱
          return cb()
        }
        cb(new Error('请输入合法邮箱'))
      }
      // 验证手机号的规则
      let checkMobile = (rule, value, cb) => {
        const regMobile = /^1[34578]\d{9}$/
        if (regMobile.test(value)) {
          return cb()
        }
        // 返回一个错误提示
        cb(new Error('请输入合法的手机号码'))
      }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      userList: [],
      total: 0,
      // 控制添加用户对话框的隐藏和显示
      addDialogVisible: false,
      // 控制修改用户对话框的隐藏和显示
      editDialogVisible: false,
      // 控制分配用户角色对话框的隐藏和显示
      setRoleDialogVisible: false,
      // 添加用户表单数据
      addUserForm: {
        username: '',
        password: '',
        email: '',
        mobile: '',
      },
      // 查询用户表单数据
      editUserForm: {

      },
      // 添加表单验证规则对象
      addUserFormRules: {
         username: [
           { required: true, message: '请输入用户名', trigger: 'blur'},
           { min: 3, max: 10, message: '长度在3~10个字符', trigger: 'blur'}
         ],
        password: [
           { required: true, message: '请输入密码', trigger: 'blur'},
           { min: 6, max: 15, message: '长度在6~15个字符', trigger: 'blur'}
         ],
        email: [
            { required: true, message: '请输入邮箱', trigger: 'blur'},
            { validator: checkEmail, trigger: 'blur'}
        ],
        mobile: [
            { required: true, message: '请输入手机号码', trigger: 'blur'},
            { validator: checkMobile, trigger: 'blur'}
        ]
      },
      // 编辑表单验证规则对象
      editUserFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号码', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' }
        ]
      },
      // 需要被分配角色的用户信息
      userInfo: {},
      // 所有角色数据列表
      rolesList: [],
      // 已选中的角色id值
      selectRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    getUserList() {
      this.$http.get('users',{ params: this.queryInfo }).then(response => {
       const { data } = response
        // console.log(response);
        // console.log(data);
        if (data.meta.status !== 200) {
          return this.$message.error('获取用户列表失败')
        } else {
          this.userList = data.data.users
          this.total = data.data.total
        }
      })
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newpage) {
      this.queryInfo.pagenum = newpage
      this.getUserList()
    },
    // 监听switch状态改变
    userStateChanged(userInfo) {
      this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`).then(response => {
        const { data } = response
        console.log(data);
        if (data.meta.status !== 200) {
          userInfo.mg_state = !userInfo.mg_state
          return this.$message.error('用户状态改变失败')
        } else {
          return this.$message.success('用户状态改变成功')
        }
      })
    },
    // 监听添加用户对画框关闭事件
    addDialogClosed() {
      this.$refs.addUserFormRef.resetFields()
    },
    // 添加新用户
    addUser() {
      this.$refs.addUserFormRef.validate(valid => {
        if (!valid) {
          this.$message.error('添加用户验证失败')
        } else {
          this.$http.post('users',this.addUserForm).then(response => {
            const { data } = response
             if (data.meta.status !== 201) {
               this.$message.error('添加用户失败')
             } else {
               this.$message.success('添加用户成功')
               this.addDialogVisible = false
               this.getUserList()
             }
          })
        }
      })
    },
    // 展示编辑对话框
    showEditDialog(id) {
      this.editDialogVisible =true
      this.$http.get('users/' + id).then(response => {
        const { data } = response
        console.log(data);
        if (data.meta.status !== 200) {
          return this.$message.error('查询用户失败')
        } else {
          this.editUserForm = data.data
          this.editDialogVisible = true
        }
      })
    },
    // 修改用户信息并提交
    editUser() {
      this.$refs.editUserFormRef.validate(valid => {
        if (!valid) {
          return this.$message.error('修改用户验证失败')
        } else {
          this.$http.put('users/' + this.editUserForm.id,{
            email: this.editUserForm.email,
            mobile: this.editUserForm.mobile
          }).then(response => {
            const { data } = response
            if (data.meta.status !==200) {
              return this.$message.error('更新用户验证失败')
            } else {
              this.editDialogVisible = false
              this.getUserList()
              this.$message.success('更新用户信息成功')
            }
          })
        }
      })
    },
    editDialogClosed() {
      this.$refs.editUserFormRef.resetFields()
    },
    // 删除用户信息
    removeUserById(id) {
      // 弹框是否删除
      this.$confirm('此操作将永久删除该用户，是否继续？','提示',{
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
        // 点击确定 返回值为：confirm
      // 点击取消 返回值为： cancel
      }).then(() => {
        this.$http.delete('users/' + id)
            .then(response => {
              const { data } = response
              if (data.meta.status !== 200) {
                return this.$message.error('删除用户失败')
              } else {
                this.$message.success('删除用户成功')
                this.getUserList()
              }
            })
      }).catch(() =>this.$message.error('删除用户失败') )
    },
    // 展示分配角色对话框
    setRole(userInfo) {
      this.userInfo = userInfo
      this.$http.get('roles').then(response => {
        const { data } = response
        if (data.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
        } else {
          this.rolesList = data.data
        }
      this.setRoleDialogVisible = true
      })
    },
    // 点击确定，分配角色
    saveRoleInfo() {
      if (!this.selectRoleId) {
        return this.$message.error('请选择要分配的角色')
      } else {
        this.$http.put(`users/${this.userInfo.id}/role`, { rid: this.selectRoleId }).then(response => {
          const {data} = response
          if (data.meta.status !== 200) {
            return this.$message.error('更新用户角色失败！')
          } else {
            this.$message.success('更新角色成功！')
            this.getUserList()
            this.setRoleDialogVisible = false
          }
        })
      }
    },
    setRoleDialogClosed() {
      this.selectRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>

</style>