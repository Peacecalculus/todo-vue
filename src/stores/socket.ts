import { defineStore } from 'pinia'
import { ref } from 'vue'

// Minimal WebSocket store that connects to a URL and exposes basic state.
// Uses native WebSocket; in production you might swap for a library.
export const useSocketStore = defineStore('socket', () => {
  const isConnected = ref(false)
  const lastMessage = ref<any>(null)
  const socketRef = ref<WebSocket | null>(null)

  function connect(url?: string) {
    const wsUrl = url || (import.meta.env.VITE_WS_URL as string) || ''
    if (!wsUrl) return

    // If already connected, disconnect first
    if (socketRef.value) {
      try { socketRef.value.close() } catch {}
      socketRef.value = null
    }

    try {
      const ws = new WebSocket(wsUrl)
      socketRef.value = ws

      ws.addEventListener('open', () => {
        isConnected.value = true
      })

      ws.addEventListener('message', (ev) => {
        try {
          const data = JSON.parse(ev.data)
          lastMessage.value = data
        } catch {
          lastMessage.value = ev.data
        }
      })

      ws.addEventListener('close', () => {
        isConnected.value = false
        socketRef.value = null
      })

      ws.addEventListener('error', () => {
        isConnected.value = false
      })
    } catch (e) {
      console.error('WebSocket connect error', e)
      isConnected.value = false
    }
  }

  function disconnect() {
    try {
      socketRef.value?.close()
    } catch {}
    socketRef.value = null
    isConnected.value = false
  }

  function send(message: any) {
    if (!socketRef.value || socketRef.value.readyState !== WebSocket.OPEN) {
      throw new Error('Socket is not open')
    }
    const payload = typeof message === 'string' ? message : JSON.stringify(message)
    socketRef.value.send(payload)
  }

  return {
    isConnected,
    lastMessage,
    connect,
    disconnect,
    send
  }
})
