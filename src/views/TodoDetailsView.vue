<template>
  <article class="max-w-2xl mx-auto p-4">
    <!-- Loading State -->
    <div v-if="loading" class="p-4 text-gray-400" role="status" aria-live="polite">
      Loading todo...
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-4 text-red-500 font-medium">
      Error: {{ error }}
    </div>

    <!-- Not Found State -->
    <div v-else-if="!todo" class="p-4 text-gray-400">
      Todo not found
    </div>

    <!-- Todo Details -->
    <template v-else>
      <div class="mb-6 border border-gray-700 rounded-lg p-6 bg-gray-900">
        <h2 class="text-3xl font-bold text-white mb-4">{{ todo.title }}</h2>
        <p class="text-gray-400 mb-2">ID: {{ todo.id }}</p>
        <p class="text-sm font-medium text-gray-400 mb-4">
          Status: 
          <span v-if="todo.completed || todo.status === 'done'" class="text-green-400">✓ Completed</span>
          <span v-else class="text-orange-400">○ Incomplete</span>
        </p>
        <p v-if="todo.description" class="text-gray-300 text-lg">{{ todo.description }}</p>

        <div class="mt-6 flex gap-3 flex-wrap">
          <RouterLink to="/" class="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-green-500" aria-label="Return to todos list">
            ← Back to list
          </RouterLink>
          <template v-if="authStore.isAuthenticated">
            <button 
              @click="startEditing" 
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-green-500" 
              aria-label="Edit this todo"
            >
              Edit
            </button>
            <button 
              @click="handleDelete" 
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-red-500" 
              aria-label="Delete this todo"
            >
              Delete
            </button>
          </template>
          <RouterLink v-else to="/login" class="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-yellow-500">
            Login to edit
          </RouterLink>
        </div>
      </div>

      <!-- Edit Form -->
      <form v-if="editing" @submit.prevent="handleSave" class="border border-gray-700 rounded-lg p-6 bg-gray-900" aria-label="Edit todo form">
        <h3 class="text-xl font-semibold text-white mb-4">Edit Todo</h3>
        <div v-if="editError" class="bg-red-900 bg-opacity-30 border border-red-700 text-red-400 p-3 rounded mb-4" role="alert">
          {{ editError }}
        </div>
        <div class="mb-4">
          <label for="editTitle" class="block text-sm font-medium text-gray-300 mb-2">Title</label>
          <input 
            id="editTitle" 
            v-model="editTitle" 
            class="w-full border border-gray-700 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" 
          />
        </div>
        <div class="mb-6">
          <label for="editDesc" class="block text-sm font-medium text-gray-300 mb-2">Description</label>
          <textarea 
            id="editDesc" 
            v-model="editDescription" 
            rows="4" 
            class="w-full border border-gray-700 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" 
          />
        </div>
        <div class="flex gap-3">
          <button 
            type="submit" 
            :disabled="isSaving" 
            class="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-green-500" 
            aria-label="Save changes to todo"
          >
            {{ isSaving ? 'Saving...' : 'Save' }}
          </button>
          <button 
            type="button" 
            @click="cancelEditing" 
            :disabled="isSaving" 
            class="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-gray-500" 
            aria-label="Cancel editing"
          >
            Cancel
          </button>
        </div>
      </form>
    </template>
  </article>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchTodo, updateTodo, deleteTodo } from '@/api'
import { useAuthStore } from '@/stores/auth'
import { useTodoStore } from '@/stores/todos'
import { useNotificationStore } from '@/stores/notifications'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const todoStore = useTodoStore()
const notificationStore = useNotificationStore()

const todo = ref<any>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const editing = ref(false)
const editTitle = ref('')
const editDescription = ref('')
const editError = ref<string | null>(null)
const isSaving = ref(false)

const todoId = route.params.id as string

onMounted(async () => {
  await fetchTodoDetail()
})

async function fetchTodoDetail() {
  loading.value = true
  error.value = null
  try {
    todo.value = await fetchTodo(todoId)
  } catch (err: any) {
    error.value = err.message || 'Failed to load todo'
  } finally {
    loading.value = false
  }
}

function startEditing() {
  editTitle.value = todo.value.title
  editDescription.value = todo.value.description || ''
  editError.value = null
  editing.value = true
}

function cancelEditing() {
  editing.value = false
  editError.value = null
}

async function handleSave() {
  editError.value = null
  isSaving.value = true
  try {
    await updateTodo(todoId, {
      title: editTitle.value,
      description: editDescription.value
    })
    todo.value.title = editTitle.value
    todo.value.description = editDescription.value
    editing.value = false
    notificationStore.addNotification('Todo updated!', 'success', 2000)
    await todoStore.fetchAllTodos()
  } catch (err: any) {
    console.error('Update error:', err)
    if (err.response?.status === 401) {
      editError.value = 'Your session has expired. Please login again.'
      setTimeout(() => router.push('/login'), 2000)
    } else {
      editError.value = 'Failed to save: ' + (err.message || 'Unknown error')
    }
  } finally {
    isSaving.value = false
  }
}

async function handleDelete() {
  if (!confirm('Delete this todo?')) return

  try {
    await deleteTodo(todoId)
    notificationStore.addNotification('Todo deleted!', 'success', 2000)
    await todoStore.fetchAllTodos()
    await router.push('/')
  } catch (err: any) {
    notificationStore.addNotification(err.message || 'Failed to delete todo', 'error')
  }
}
</script>
