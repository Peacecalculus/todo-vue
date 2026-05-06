import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { fetchTodos, createTodo, updateTodo, deleteTodo } from '@/api'

export interface Todo {
  id: string | number
  title: string
  description?: string
  status?: string
  completed?: boolean
  userId?: string
}

export const useTodoStore = defineStore('todos', () => {
  const todos = ref<Todo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const creating = ref(false)
  const updating = ref<string | null>(null)
  const deleting = ref<string | null>(null)

  async function fetchAllTodos() {
    loading.value = true
    error.value = null
    try {
      const data = await fetchTodos()
      todos.value = Array.isArray(data) ? data : []
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch todos'
      todos.value = []
    } finally {
      loading.value = false
    }
  }

  async function addTodo(payload: { title: string; description?: string; status?: string }) {
    creating.value = true
    try {
      const newTodo = await createTodo(payload)
      if (newTodo) {
        todos.value.push(newTodo)
      }
      return newTodo
    } catch (err: any) {
      error.value = err.message || 'Failed to create todo'
      throw err
    } finally {
      creating.value = false
    }
  }

  async function updateTodoItem(id: string | number, payload: Partial<Todo>) {
    updating.value = String(id)
    try {
      const updated = await updateTodo(id, payload)
      const index = todos.value.findIndex(t => t.id === id)
      if (index !== -1) {
        todos.value[index] = { ...todos.value[index], ...updated }
      }
      return updated
    } catch (err: any) {
      error.value = err.message || 'Failed to update todo'
      throw err
    } finally {
      updating.value = null
    }
  }

  async function removeTodo(id: string | number) {
    deleting.value = String(id)
    try {
      await deleteTodo(id)
      todos.value = todos.value.filter(t => t.id !== id)
    } catch (err: any) {
      error.value = err.message || 'Failed to delete todo'
      throw err
    } finally {
      deleting.value = null
    }
  }

  const completedCount = computed(() => 
    todos.value.filter(t => t.completed || t.status === 'done').length
  )

  const totalCount = computed(() => todos.value.length)

  const completionPercentage = computed(() => 
    Math.round((completedCount.value / (totalCount.value || 1)) * 100)
  )

  return {
    todos,
    loading,
    error,
    creating,
    updating,
    deleting,
    fetchAllTodos,
    addTodo,
    updateTodoItem,
    removeTodo,
    completedCount,
    totalCount,
    completionPercentage
  }
})
