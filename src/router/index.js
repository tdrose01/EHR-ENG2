import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import EHModulesScreen from '../components/EHModulesScreen.vue'
import PatientManagement from '../components/PatientManagement.vue'
import EnvironmentalDashboard from '../components/EnvironmentalDashboard.vue'
import RadiationDashboard from '../views/RadiationDashboard.vue'
import TrendChartDashboard from '../components/TrendChartDashboard.vue'
import DataTableDashboard from '../components/DataTableDashboard.vue'
import AdminBackupRestore from '../components/AdminBackupRestore.vue'
import MonitoringDashboard from '../components/MonitoringDashboard.vue'
import SystemStatus from '../components/SystemStatus.vue'
import Settings from '../components/Settings.vue'
import UserManagement from '../components/UserManagement.vue'
import RealTimeMonitoringDashboard from '../components/RealTimeMonitoringDashboard.vue'
import NavMedTestPage from '../views/NavMedTestPage.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/select-module',
    name: 'EHModulesScreen',
    component: EHModulesScreen,
    meta: { requiresAuth: true }
  },
  {
    path: '/patients',
    name: 'PatientManagement',
    component: PatientManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/environmental-dashboard',
    name: 'EnvironmentalDashboard',
    component: EnvironmentalDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/radiation-dashboard',
    name: 'RadiationDashboard',
    component: RadiationDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/backup-restore',
    name: 'AdminBackupRestore',
    component: AdminBackupRestore,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/monitoring-dashboard',
    name: 'MonitoringDashboard',
    component: MonitoringDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/status',
    name: 'SystemStatus',
    component: SystemStatus,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  },
  {
    path: '/real-time-monitoring',
    name: 'RealTimeMonitoringDashboard',
    component: RealTimeMonitoringDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/navmed-test',
    name: 'NavMedTestPage',
    component: NavMedTestPage,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check authentication and admin role
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
  const userRole = localStorage.getItem('userRole')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/')
  } else if (to.meta.requiresAdmin && userRole !== 'admin') {
    next('/select-module')
  } else if (to.path === '/' && isAuthenticated) {
    next('/select-module')
  } else {
    next()
  }
})

export default router
