<template>
  <div v-if="authStore.user" class="max-w-md mx-auto border border-gray-700 rounded-lg p-8 bg-gray-900 mt-4">
    <h2 class="text-2xl font-bold text-white mb-6">Profile</h2>
    <div class="space-y-4">
      <div>
        <span class="text-sm font-medium text-gray-400">User ID</span>
        <p class="text-white mt-1">{{ authStore.user.id }}</p>
      </div>
      <div>
        <span class="text-sm font-medium text-gray-400">Email</span>
        <p class="text-white mt-1">{{ authStore.user.email || authStore.user.username }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>
