import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import TodoListView from '@/views/TodoListView.vue'
import TodoDetailsView from '@/views/TodoDetailsView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ProfileView from '@/views/ProfileView.vue'
import NotFoundView from '@/views/NotFoundView.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: TodoListView,
    meta: { title: 'Todo App' }
  },
  {
    path: '/todos/:id',
    component: TodoDetailsView,
    meta: { title: 'Todo Details' }
  },
  {
    path: '/login',
    component: LoginView,
    meta: { title: 'Login' }
  },
  {
    path: '/register',
    component: RegisterView,
    meta: { title: 'Register' }
  },
  {
    path: '/profile',
    component: ProfileView,
    meta: { title: 'Profile', requiresAuth: true }
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFoundView,
    meta: { title: 'Not Found' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for protected routes
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.meta.requiresAuth as boolean

  if (requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else {
    next()
  }
})

// Update document title
router.afterEach((to) => {
  document.title = (to.meta.title as string) || 'Todo App'
})

export default router
