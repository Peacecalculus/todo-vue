<template>
  <div class="min-h-screen bg-black text-white">
    <header class="bg-gray-950 border-b border-gray-800" role="banner">
      <div class="max-w-6xl mx-auto p-4 flex items-center justify-between">
        <h1 class="text-xl font-semibold">
          <RouterLink to="/" aria-label="Todo App Home" class="hover:text-green-400 transition-colors">📋 Todo App (Vue)</RouterLink>
        </h1>
        <nav class="flex items-center gap-4" aria-label="Main navigation">
          <RouterLink to="/" class="text-sm text-gray-400 hover:text-green-400 transition-colors focus-visible:outline-2 focus-visible:outline-green-600" aria-label="View all todos">Todos</RouterLink>
          <template v-if="authStore.isAuthenticated">
            <span class="text-sm text-gray-400" role="status" aria-live="polite">
              Logged in as {{ authStore.user?.email || authStore.user?.username }}
            </span>
            <button 
              @click="handleLogout"
              class="text-sm text-red-500 hover:text-red-400 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-red-600" 
              aria-label="Log out of your account"
            >
              Logout
            </button>
          </template>
          <template v-else>
            <RouterLink to="/login" class="text-sm text-gray-400 hover:text-green-400 transition-colors focus-visible:outline-2 focus-visible:outline-green-600" aria-label="Log in to your account">Login</RouterLink>
            <RouterLink to="/register" class="text-sm text-gray-400 hover:text-green-400 transition-colors focus-visible:outline-2 focus-visible:outline-green-600" aria-label="Create a new account">Register</RouterLink>
          </template>
        </nav>
      </div>
    </header>

    <main class="min-h-[calc(100vh-73px)]">
      <RouterView />
    </main>

    <Notifications />
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import Notifications from '@/components/Notifications.vue'

const authStore = useAuthStore()
const router = useRouter()

async function handleLogout() {
  await authStore.logout()
  await router.push('/')
}
</script>
