import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import ModuleSelection from '../components/ModuleSelection.vue'
import EHModulesScreen from '../components/EHModulesScreen.vue'
import RHModule from '../components/RHModule.vue'
import PatientManagement from '../components/PatientManagement.vue'
import Settings from '../components/Settings.vue'
import SystemStatus from '../views/SystemStatus.vue'
import PatientView from '../views/PatientView.vue'
import EnvironmentalDashboard from '../components/EnvironmentalDashboard.vue'
import LandingDashboard from '../views/LandingDashboard.vue'
import NavyDashboard from '../views/NavyDashboard.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/select-module',
    name: 'ModuleSelection',
    component: ModuleSelection,
    meta: { requiresAuth: true }
  },
  {
    path: '/eh-module',
    name: 'EHModulesScreen',
    component: EHModulesScreen,
    meta: { requiresAuth: true }
  },
  {
    path: '/rh-module',
    name: 'RHModule',
    component: RHModule,
    meta: { requiresAuth: true }
  },
  {
    path: '/patients',
    name: 'PatientManagement',
    component: PatientManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/patients/view/:id',
    name: 'PatientView',
    component: PatientView,
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
    path: '/environmental-dashboard',
    name: 'EnvironmentalDashboard',
    component: EnvironmentalDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/',
    name: 'LandingDashboard',
    component: LandingDashboard
  },
  {
    path: '/navy-dashboard',
    name: 'NavyDashboard',
    component: NavyDashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to check authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/')
  } else if (to.path === '/' && isAuthenticated) {
    next('/select-module')
  } else {
    next()
  }
})

export default router
