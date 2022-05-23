import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },
  {
    path: '/',
    component: Layout,
    name: '',
    redirect: '/markMap',
    meta: { title: '地图标绘管理', icon: 'el-icon-notebook-1' },
    children: [
      {
        path: 'markMap',
        component: () => import('@/views/markMap/index'),
        meta: { title: '地图标绘管理', icon: '' }
      }
    ]
  },
  {
    path: '/dataManage',
    component: Layout,
    redirect: '/dataManage/trackMatch',
    name: '航迹数据管理',
    meta: { title: '航迹数据管理', icon: 'el-icon-data-analysis' },
    children: [
      {
        path: 'shipTrackTarget',
        name: '民船航迹目标数据',
        component: () => import('@/views/dataManage/shipTrackTarget/index'),
        meta: { title: '民船航迹目标数据', icon: '' }
      },
      {
        path: 'trackMatch',
        name: '航迹匹配',
        component: () => import('@/views/dataManage/trackMatch/index'),
        meta: { title: '航迹匹配', icon: '' }
      },
      {
        path: 'centralTrack',
        name: '民航中心航线',
        component: () => import('@/views/dataManage/centralTrack/index'),
        meta: { title: '民航中心航线', icon: '' }
      },
      {
        path: 'shipCentralTrack',
        name: '民船中心航线',
        component: () => import('@/views/dataManage/shipCentralTrack/index'),
        meta: { title: '民船中心航线', icon: '' }
      },
      {
        path: 'shipTrackStore',
        name: '民航航迹存储表',
        component: () => import('@/views/dataManage/shipTrackStore/index'),
        meta: { title: '民航航迹存储表', icon: '' }
      },
      {
        path: 'clusterProperty',
        name: '航线次数统计表',
        component: () => import('@/views/dataManage/clusterProperty/index'),
        meta: { title: '航线次数统计表', icon: '' }
      },
      {
        path: 'dataImport',
        name: '数据导入',
        // hidden: true,
        component: () => import('@/views/dataManage/dataImport/index'),
        meta: { title: '数据导入', icon: '' }
      }
    ]
  },
  {
    path: '/theme',
    component: Layout,
    children: [
      {
        path: 'index',
        name: 'Form',
        component: () => import('@/views/theme/index'),
        meta: { title: '主题切换', icon: 'el-icon-tickets' }
      }
    ]
  },
  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },
  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

export const asyncRouterMap = []

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
