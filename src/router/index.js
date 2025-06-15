import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import ModuleSelection from '../components/ModuleSelection.vue'
import EHModule from '../components/EHModule.vue'
import RHModule from '../components/RHModule.vue'

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
    path: '/eh',
    name: 'EHModule',
    component: EHModule,
    meta: { requiresAuth: true }
  },
  {
    path: '/rh',
    name: 'RHModule',
    component: RHModule,
    meta: { requiresAuth: true }
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