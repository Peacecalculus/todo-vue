<template>
  <div class="min-h-screen bg-black text-white p-4 sm:p-8">
    <div class="max-w-2xl mx-auto">
      <!-- Header -->
      <div class="mb-8 flex items-center gap-3">
        <div class="w-10 h-10 bg-white rounded flex items-center justify-center">
          <Check class="text-black w-6 h-6" />
        </div>
        <h1 class="text-4xl font-bold">TODO</h1>
      </div>

      <!-- Loading State -->
      <div v-if="todoStore.loading" class="min-h-screen bg-black text-gray-400 flex items-center justify-center">
        Loading todos...
      </div>

      <!-- Error State -->
      <div v-else-if="todoStore.error" class="min-h-screen bg-black text-red-500 flex items-center justify-center">
        Error: {{ todoStore.error }}
      </div>

      <!-- Main Content -->
      <template v-else>
        <!-- Progress Card -->
        <div class="mb-8 border border-gray-700 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <div class="text-2xl font-semibold mb-1">Task Done</div>
            <div class="text-gray-400">Keep it up</div>
          </div>
          <div class="w-24 h-24 bg-gradient-to-br from-green-400 to-lime-500 rounded-full flex items-center justify-center">
            <div class="text-3xl font-bold">{{ todoStore.completedCount }}/{{ todoStore.totalCount }}</div>
          </div>
        </div>

        <!-- Add Task Input -->
        <form v-if="authStore.isAuthenticated" @submit.prevent="handleAddTodo" class="mb-8 flex gap-2">
          <input
            v-model="newTitle"
            type="text"
            placeholder="Write your next task"
            class="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
          <button
            type="submit"
            :disabled="todoStore.creating || !newTitle.trim()"
            class="w-12 h-12 bg-lime-500 hover:bg-lime-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black rounded-lg font-bold flex items-center justify-center transition-colors"
            aria-label="Add new todo"
          >
            <Plus class="w-6 h-6" />
          </button>
        </form>

        <!-- Search and Filter -->
        <div class="mb-6 flex flex-col sm:flex-row gap-3">
          <input
            v-model="search"
            type="text"
            placeholder="Search tasks..."
            @input="handleSearch"
            class="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
          <select
            v-model="filter"
            @change="handleFilterChange"
            class="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          >
            <option value="all">All</option>
            <option value="complete">Complete</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>

        <!-- Task List -->
        <ul class="space-y-3 mb-6" role="list">
          <li v-for="todo in pageItems" :key="todo.id" class="border border-gray-700 rounded-lg p-4 flex items-center justify-between hover:bg-gray-900 transition-colors group" role="listitem">
            <div class="flex items-center gap-4 flex-1 min-w-0">
              <button
                @click="handleToggleTodo(todo)"
                :disabled="todoStore.updating === String(todo.id)"
                :class="[
                  'flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors',
                  todo.completed || todo.status === 'done'
                    ? 'bg-green-500 border-green-500'
                    : 'border-gray-500 hover:border-green-500',
                  todoStore.updating === String(todo.id) ? 'opacity-50' : ''
                ]"
                :aria-label="`${todo.completed || todo.status === 'done' ? 'Mark incomplete' : 'Mark complete'}`"
              >
                <Check v-if="todo.completed || todo.status === 'done'" class="w-4 h-4 text-black" />
              </button>
              <div class="flex-1 min-w-0">
                <RouterLink
                  :to="`/todos/${todo.id}`"
                  :class="[
                    'text-white hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 rounded px-1 block truncate',
                    (todo.completed || todo.status === 'done') ? 'line-through text-gray-500' : ''
                  ]"
                >
                  {{ todo.title || '(No title)' }}
                </RouterLink>
                <div v-if="todo.description" :class="[
                  'text-sm mt-1',
                  (todo.completed || todo.status === 'done') ? 'text-gray-600' : 'text-gray-400'
                ]">
                  {{ todo.description }}
                </div>
              </div>
            </div>
            <div class="flex items-center gap-2 ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <RouterLink
                :to="`/todos/${todo.id}`"
                class="p-2 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                aria-label="Edit todo"
              >
                <Edit2 class="w-5 h-5" />
              </RouterLink>
              <button
                @click="handleDeleteTodo(todo)"
                :disabled="todoStore.deleting === String(todo.id)"
                class="p-2 hover:bg-red-900 hover:bg-opacity-30 rounded transition-colors text-gray-400 hover:text-red-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                aria-label="Delete todo"
              >
                <Trash2 class="w-5 h-5" />
              </button>
            </div>
          </li>
        </ul>

        <!-- Empty State -->
        <div v-if="pageItems.length === 0" class="text-center py-12">
          <p class="text-gray-400">No todos found. {{ search ? 'Try adjusting your search.' : 'Add a new todo to get started!' }}</p>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="flex items-center justify-between text-sm" role="group" aria-label="Pagination controls">
          <div class="text-gray-400">
            Page <span class="text-white font-medium">{{ page }}</span> of <span class="text-white font-medium">{{ totalPages }}</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="goToPage(page - 1)"
              :disabled="page === 1"
              class="px-3 py-2 border border-gray-700 text-gray-400 rounded hover:border-green-500 hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :aria-label="`Go to previous page. Currently on page ${page}`"
            >
              Prev
            </button>
            <button
              @click="goToPage(page + 1)"
              :disabled="page === totalPages"
              class="px-3 py-2 border border-gray-700 text-gray-400 rounded hover:border-green-500 hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :aria-label="`Go to next page. Currently on page ${page}`"
            >
              Next
            </button>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Check, Plus, Edit2, Trash2 } from 'lucide-vue-next'
import { useTodoStore } from '@/stores/todos'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'

const PAGE_SIZE = 10

const todoStore = useTodoStore()
const authStore = useAuthStore()
const notificationStore = useNotificationStore()

const page = ref(1)
const search = ref('')
const filter = ref('all')
const newTitle = ref('')

onMounted(() => {
  todoStore.fetchAllTodos()
})

const filtered = computed(() => {
  let result = todoStore.todos

  // Filter by search term
  if (search.value.trim()) {
    const s = search.value.trim().toLowerCase()
    result = result.filter(t => t.title?.toLowerCase().includes(s))
  }

  // Filter by completion status
  if (filter.value === 'complete') {
    result = result.filter(t => t.completed || t.status === 'done')
  } else if (filter.value === 'incomplete') {
    result = result.filter(t => !t.completed && t.status !== 'done')
  }

  return result
})

const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE)))

const pageItems = computed(() => {
  const start = (page.value - 1) * PAGE_SIZE
  const end = start + PAGE_SIZE
  return filtered.value.slice(start, end)
})

function handleSearch() {
  page.value = 1
}

function handleFilterChange() {
  page.value = 1
}

function goToPage(p: number) {
  page.value = Math.max(1, Math.min(totalPages.value, p))
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function handleAddTodo() {
  if (!newTitle.value.trim()) return

  try {
    await todoStore.addTodo({
      title: newTitle.value,
      description: '',
      status: 'todo'
    })
    newTitle.value = ''
    notificationStore.addNotification('Todo added!', 'success', 2000)
  } catch (err: any) {
    notificationStore.addNotification(err.message || 'Failed to add todo', 'error')
  }
}

async function handleToggleTodo(todo: any) {
  try {
    const newStatus = todo.completed || todo.status === 'done' ? 'todo' : 'done'
    await todoStore.updateTodoItem(todo.id, {
      status: newStatus,
      completed: newStatus === 'done'
    })
    notificationStore.addNotification('Todo updated!', 'success', 2000)
  } catch (err: any) {
    notificationStore.addNotification(err.message || 'Failed to update todo', 'error')
  }
}

async function handleDeleteTodo(todo: any) {
  if (!confirm('Are you sure you want to delete this task?')) return

  try {
    await todoStore.removeTodo(todo.id)
    notificationStore.addNotification('Todo deleted!', 'success', 2000)
  } catch (err: any) {
    notificationStore.addNotification(err.message || 'Failed to delete todo', 'error')
  }
}
</script>
