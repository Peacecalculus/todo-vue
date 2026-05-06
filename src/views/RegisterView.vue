<template>
  <div class="min-h-screen bg-black text-white flex items-center justify-center p-4">
    <div class="w-full max-w-md border border-gray-700 rounded-lg p-8 bg-gray-900">
      <h2 class="text-2xl font-bold mb-6">Create Account</h2>
      <div v-if="error" class="bg-red-900 bg-opacity-30 border border-red-700 text-red-400 p-3 rounded mb-4" role="alert">
        {{ error }}
      </div>
      <form @submit.prevent="submit" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
          <input 
            id="name" 
            v-model="name" 
            required 
            type="text" 
            class="w-full border border-gray-700 px-4 py-2 rounded-lg bg-black text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" 
            placeholder="John Doe" 
          />
        </div>
        <div>
          <label for="email" class="block text-sm font-medium text-gray-300 mb-2">Email</label>
          <input 
            id="email" 
            v-model="email" 
            required 
            type="email" 
            class="w-full border border-gray-700 px-4 py-2 rounded-lg bg-black text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" 
            placeholder="your@email.com" 
          />
        </div>
        <div>
          <label for="password" class="block text-sm font-medium text-gray-300 mb-2">Password</label>
          <div class="relative">
            <input 
              id="password" 
              v-model="password" 
              required 
              :type="showPassword ? 'text' : 'password'" 
              class="w-full border border-gray-700 px-4 py-2 pr-10 rounded-lg bg-black text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" 
              placeholder="••••••••" 
            />
            <button 
              type="button" 
              @click="showPassword = !showPassword" 
              class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none" 
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
            >
              <Eye v-if="!showPassword" class="w-5 h-5" />
              <EyeOff v-else class="w-5 h-5" />
            </button>
          </div>
        </div>
        <button type="submit" class="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-green-500">
          Create Account
        </button>
      </form>
      <div class="mt-4 text-center text-sm text-gray-400 space-y-2">
        <div>
          Already have an account? 
          <RouterLink to="/login" class="text-green-400 hover:text-green-300">Login here</RouterLink>
        </div>
        <div>
          <button 
            type="button" 
            @click="clearForm" 
            class="text-xs text-gray-400 hover:text-gray-200 underline"
          >
            Start fresh (clear local auth)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Eye, EyeOff } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'

const router = useRouter()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const name = ref('')
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const error = ref<string | null>(null)

async function submit() {
  error.value = null
  try {
    const res = await authStore.register({ 
      email: email.value, 
      password: password.value,
      username: name.value
    })
    if (res?.token) {
      notificationStore.addNotification('Registration successful!', 'success')
      await router.push('/')
    } else {
      error.value = 'Registration failed: ' + JSON.stringify(res)
    }
  } catch (err: any) {
    console.error('Register error:', err)
    if (err.response?.data?.message) {
      error.value = err.response.data.message
    } else if (err.response?.data) {
      error.value = 'Error: ' + JSON.stringify(err.response.data)
    } else {
      error.value = 'Registration failed: ' + (err.message || String(err))
    }
  }
}

function clearForm() {
  authStore.clearAuth()
  name.value = ''
  email.value = ''
  password.value = ''
  error.value = null
}
</script>
