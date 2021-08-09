import Vue from 'vue'
import VueRouter from 'vue-router'


Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('../components/Login')
  },
  {
    path: '/home',
    name: 'Home',
    component: () => import('../components/Home'),
    redirect: '/welcome',
    children: [
      {
        path: '/welcome',
        name: 'Welcome',
        component: () => import('../components/Welcome')
      },
      {
        path: '/users',
        name: 'Users',
        component: () => import('../components/user/Users')
      },
      {
        path: '/rights',
        name: 'Rights',
        component: () => import('../components/power/Rights')
      },
      {
        path: '/roles',
        name: 'Roles',
        component: () => import('../components/power/Roles')
      },
      {
        path: '/categories',
        name: 'Cates',
        component: () => import('../components/goods/Cate')
      },
      {
        path: '/params',
        name: 'Params',
        component: () => import('../components/goods/Params')
      },
      {
        path: '/goods',
        name: 'List',
        component: () => import('../components/goods/List')
      },
      {
        path: '/goods/add',
        name: 'Add',
        component: () => import('../components/goods/Add')
      },
    ]
  },

]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

//挂载路由守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/login') return next()
  const tokenStr = sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
