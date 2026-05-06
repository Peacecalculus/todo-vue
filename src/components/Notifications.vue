<template>
  <div v-if="notificationStore.notifications.length > 0" class="fixed top-4 right-4 space-y-2 z-50">
    <transition-group name="notification">
      <div 
        v-for="notification in notificationStore.notifications" 
        :key="notification.id"
        :class="[
          'px-4 py-3 rounded-lg text-white font-medium shadow-lg animate-slideIn',
          getNotificationClasses(notification.type)
        ]"
        role="alert"
      >
        {{ notification.message }}
      </div>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { useNotificationStore } from '@/stores/notifications'

const notificationStore = useNotificationStore()

function getNotificationClasses(type: string) {
  const baseClasses = 'bg-opacity-90'
  switch (type) {
    case 'success':
      return `bg-green-600 ${baseClasses}`
    case 'error':
      return `bg-red-600 ${baseClasses}`
    case 'warning':
      return `bg-yellow-600 ${baseClasses}`
    case 'info':
    default:
      return `bg-blue-600 ${baseClasses}`
  }
}
</script>

<style scoped>
@keyframes slideIn {
  from {
    transform: translateX(400px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slideIn {
  animation: slideIn 0.3s ease-out;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(400px);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(400px);
  opacity: 0;
}
</style>
