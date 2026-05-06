import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSocketStore = defineStore('socket', () => {
  const isConnected = ref(false)
  const lastMessage = ref<any>(null)

  function connect(url: string) {
    // Placeholder for WebSocket connection logic
    // This would be implemented based on your actual WebSocket requirements
    isConnected.value = true
  }

  function disconnect() {
    isConnected.value = false
  }

  function send(message: any) {
    // Placeholder for sending messages via WebSocket
    lastMessage.value = message
  }

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
    send
  }
})
