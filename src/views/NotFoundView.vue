<template>
  <div class="min-h-[calc(100vh-73px)] bg-black text-white flex items-center justify-center p-4">
    <div class="text-center space-y-6">
      <div class="text-6xl font-bold text-red-500">404</div>
      <div class="space-y-2">
        <h1 class="text-3xl font-bold">Page Not Found</h1>
        <p class="text-gray-400">Sorry, we couldn't find the page you're looking for.</p>
      </div>
      <div class="flex gap-4 justify-center pt-4">
        <RouterLink 
          to="/" 
          class="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
        >
          Back to Home
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// No script needed for this simple component
</script>
