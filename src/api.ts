type AuthCredentials = {
  email: string
  password: string
}

type AuthRegisterData = {
  email: string
  password: string
  username?: string
}

type AuthResponse = {
  accessToken: string
  refreshToken: string
  token: string
  user: {
    id: string
    email: string
    username?: string
  }
}

type TodoInput = {
  title: string
  description?: string
  status?: string
}

type TodoPatch = Partial<TodoInput> & {
  completed?: boolean
}

type TodoItem = {
  id: string
  title: string
  description?: string
  status?: string
  completed?: boolean
  userId?: string
}

type StoredUser = {
  id: string
  email: string
  password: string
  username?: string
}

type AuthState = {
  userId: string | null
  accessToken: string | null
  refreshToken: string | null
}

const STORAGE_KEYS = {
  users: 'TODO_VUE_USERS',
  todos: 'TODO_VUE_TODOS',
  auth: 'TODO_VUE_AUTH_STATE'
}

function readJson<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null') ?? fallback
  } catch {
    return fallback
  }
}

function writeJson<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value))
}

function getUsers(): StoredUser[] {
  return readJson<StoredUser[]>(STORAGE_KEYS.users, [])
}

function getTodos(): TodoItem[] {
  return readJson<TodoItem[]>(STORAGE_KEYS.todos, [])
}

function getAuthState(): AuthState {
  return readJson<AuthState>(STORAGE_KEYS.auth, {
    userId: null,
    accessToken: null,
    refreshToken: null
  })
}

function saveAuthState(state: AuthState) {
  writeJson(STORAGE_KEYS.auth, state)
}

function setCurrentAuth(userId: string | null) {
  if (!userId) {
    saveAuthState({ userId: null, accessToken: null, refreshToken: null })
    return {
      accessToken: '',
      refreshToken: '',
      token: '',
      user: { id: '', email: '', username: '' }
    }
  }

  const accessToken = `access-${userId}-${Date.now()}`
  const refreshToken = `refresh-${userId}-${Date.now()}`
  saveAuthState({ userId, accessToken, refreshToken })
  const user = getUsers().find(u => u.id === userId)

  return {
    accessToken,
    refreshToken,
    token: accessToken,
    user: user ? { id: user.id, email: user.email, username: user.username } : { id: userId, email: '', username: '' }
  }
}

function getCurrentUser(): StoredUser {
  const { userId } = getAuthState()
  if (!userId) {
    throw new Error('Not authenticated')
  }

  const user = getUsers().find(u => u.id === userId)
  if (!user) {
    throw new Error('Authenticated user not found')
  }

  return user
}

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2)}-${Date.now()}`
}

export async function loginUser(credentials: AuthCredentials): Promise<AuthResponse> {
  const users = getUsers()
  const user = users.find(u => u.email.toLowerCase() === credentials.email.toLowerCase())

  if (!user || user.password !== credentials.password) {
    throw new Error('Invalid email or password')
  }

  return setCurrentAuth(user.id)
}

export async function registerUser(data: AuthRegisterData): Promise<AuthResponse> {
  const users = getUsers()
  if (users.some(u => u.email.toLowerCase() === data.email.toLowerCase())) {
    throw new Error('Email already registered')
  }

  const newUser: StoredUser = {
    id: createId('user'),
    email: data.email,
    password: data.password,
    username: data.username || data.email.split('@')[0]
  }

  users.push(newUser)
  writeJson(STORAGE_KEYS.users, users)
  return setCurrentAuth(newUser.id)
}

export async function getMe() {
  const user = getCurrentUser()
  return { id: user.id, email: user.email, username: user.username }
}

export async function logoutUser() {
  setCurrentAuth(null)
  return true
}

export async function refreshAccessToken() {
  const { userId } = getAuthState()
  if (!userId) {
    throw new Error('Not authenticated')
  }
  return setCurrentAuth(userId)
}

export async function fetchTodos(): Promise<TodoItem[]> {
  return getTodos()
}

export async function fetchTodo(id: string) {
  const todo = getTodos().find(item => item.id === id)
  if (!todo) {
    throw new Error('Todo not found')
  }
  return todo
}

export async function createTodo(payload: TodoInput): Promise<TodoItem> {
  const todo: TodoItem = {
    id: createId('todo'),
    title: payload.title,
    description: payload.description,
    status: payload.status || 'todo',
    completed: payload.status === 'done',
    userId: getAuthState().userId || undefined
  }

  const todos = getTodos()
  todos.push(todo)
  writeJson(STORAGE_KEYS.todos, todos)
  return todo
}

export async function updateTodo(id: string | number, payload: TodoPatch) {
  const todos = getTodos()
  const index = todos.findIndex(item => item.id === String(id))
  if (index === -1) {
    throw new Error('Todo not found')
  }

  todos[index] = {
    ...todos[index],
    ...payload,
    completed: payload.completed ?? todos[index].completed,
    status: payload.status ?? todos[index].status
  }

  writeJson(STORAGE_KEYS.todos, todos)
  return todos[index]
}

export async function deleteTodo(id: string | number) {
  const todos = getTodos()
  const next = todos.filter(item => item.id !== String(id))
  if (next.length === todos.length) {
    throw new Error('Todo not found')
  }
  writeJson(STORAGE_KEYS.todos, next)
  return true
}
