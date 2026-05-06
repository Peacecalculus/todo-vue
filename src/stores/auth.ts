import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { loginUser, registerUser, getMe, logoutUser, refreshAccessToken } from '@/api'

export interface User {
  id?: string
  email?: string
  username?: string
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('accessToken') || localStorage.getItem('token'))
  const user = ref<User | null>(null)
  const loading = ref(!!token.value)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function initializeAuth() {
    if (!token.value) {
      loading.value = false
      return
    }

    try {
      const userData = await getMe()
      user.value = userData
    } catch (e) {
      console.error('auth load failed', e)
      try {
        // Attempt to refresh token if getMe fails
        const refreshResult = await refreshAccessToken()
        const newAccess = refreshResult?.accessToken || refreshResult?.token || refreshResult?.access
        const newRefresh = refreshResult?.refreshToken || refreshResult?.refresh
        
        if (newAccess) {
          token.value = newAccess
          localStorage.setItem('accessToken', newAccess)
          if (newRefresh) localStorage.setItem('refreshToken', newRefresh)
          const userData = await getMe()
          user.value = userData
        } else {
          throw e
        }
      } catch (refreshError) {
        console.error('token refresh failed', refreshError)
        clearAuth()
      }
    } finally {
      loading.value = false
    }
  }

  async function login(credentials: { email: string; password: string }) {
    try {
      const res = await loginUser(credentials)
      const access = res?.accessToken || res?.token || res?.access
      const refresh = res?.refreshToken || res?.refresh
      
      if (access) {
        token.value = access
        localStorage.setItem('accessToken', access)
        if (refresh) localStorage.setItem('refreshToken', refresh)
        const userData = await getMe()
        user.value = userData
      }
      return res
    } catch (error) {
      clearAuth()
      throw error
    }
  }

  async function register(data: { email: string; password: string; username?: string }) {
    try {
      const res = await registerUser(data)
      const access = res?.accessToken || res?.token || res?.access
      const refresh = res?.refreshToken || res?.refresh
      
      if (access) {
        token.value = access
        localStorage.setItem('accessToken', access)
        if (refresh) localStorage.setItem('refreshToken', refresh)
        const userData = await getMe()
        user.value = userData
      }
      return res
    } catch (error) {
      clearAuth()
      throw error
    }
  }

  async function logout() {
    try {
      await logoutUser()
    } catch (e) {
      console.error('logout failed', e)
    } finally {
      clearAuth()
    }
  }

  function clearAuth() {
    token.value = null
    user.value = null
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }

  return {
    token,
    user,
    loading,
    isAuthenticated,
    initializeAuth,
    login,
    register,
    logout,
    clearAuth
  }
})
