import axios from 'axios'

// Demo mode flag - set to true to use mock data instead of real API
const DEMO_MODE = true

// In-memory storage for demo mode
let demoUsers = JSON.parse(localStorage.getItem('demo_users') || '[]')
let demoTasks = JSON.parse(localStorage.getItem('demo_tasks') || '[]')
let currentUserId = localStorage.getItem('demo_userId') || null

function saveDemoData(){
  localStorage.setItem('demo_users', JSON.stringify(demoUsers))
  localStorage.setItem('demo_tasks', JSON.stringify(demoTasks))
}

export const api = axios.create({
  baseURL: 'https://api.oluwasetemi.dev'
})

/**
 * Interceptor to attach JWT token from localStorage to all API requests
 * Automatically adds Authorization header with Bearer token if available
 */
api.interceptors.request.use((config)=>{
  try{
    const accessToken = localStorage.getItem('accessToken') || localStorage.getItem('token')
    if(accessToken){
      config.headers = config.headers || {}
      config.headers.Authorization = `Bearer ${accessToken}`
    }
  }catch(e){/* ignore */}
  return config
})

// Refresh handling: queue requests while refresh is in progress
let isRefreshing = false
let refreshSubscribers = []

function onRefreshed(newToken){
  refreshSubscribers.forEach(cb => cb(newToken))
  refreshSubscribers = []
}

function addRefreshSubscriber(cb){
  refreshSubscribers.push(cb)
}

// Response interceptor to handle 401 and attempt token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    if(!originalRequest) return Promise.reject(error)

    // If it's a 401 and we haven't tried refreshing yet
    if (error.response?.status === 401 && !originalRequest._retry && !(originalRequest.url && originalRequest.url.includes('/auth/refresh'))) {
      originalRequest._retry = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) {
        // no refresh token — give up
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // queue the request until refresh finishes
        return new Promise((resolve, reject) => {
          addRefreshSubscriber((newToken) => {
            if (!newToken) return reject(error)
            originalRequest.headers = originalRequest.headers || {}
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(api(originalRequest))
          })
        })
      }

      isRefreshing = true
      try {
        // avoid using the same axios instance for refresh to prevent interceptor loops
        const refreshUrl = (api.defaults.baseURL || '') + '/auth/refresh'
        const res = await axios.post(refreshUrl, { refreshToken })
        const data = res.data || {}
        const newAccess = data.accessToken || data.token || data.access
        const newRefresh = data.refreshToken || data.refresh || null
        if (newAccess) {
          localStorage.setItem('accessToken', newAccess)
          if (newRefresh) localStorage.setItem('refreshToken', newRefresh)
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`
          onRefreshed(newAccess)
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${newAccess}`
          return api(originalRequest)
        }
        // refresh didn't return a token
        onRefreshed(null)
        return Promise.reject(error)
      } catch (refreshErr) {
        onRefreshed(null)
        return Promise.reject(refreshErr)
      } finally {
        isRefreshing = false
      }
    }

    // if it's a 401 but for refresh endpoint, don't attempt refresh here
    if (originalRequest.url && originalRequest.url.includes('/auth/refresh')) {
      return Promise.reject(error)
    }

    return Promise.reject(error)
  }
)

/**
 * Fetches all tasks from the API
 * @async
 * @returns {Promise<Array>} Array of task objects with properties: id, title, description, completed
 * @throws {Error} If the API request fails
 */
export async function fetchTasks(){
  if(DEMO_MODE){
    return demoTasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || '',
      completed: task.completed || false,
      status: task.completed ? 'done' : 'todo',
      userId: task.userId
    }))
  }
  
  const res = await api.get('/tasks')
  const data = res.data
  
  let tasks = []
  
  // Extract array from response - check common wrapper properties first
  if(data && typeof data === 'object'){
    if(Array.isArray(data)) {
      tasks = data
    } else if(Array.isArray(data.data)) {
      tasks = data.data
    } else if(Array.isArray(data.tasks)) {
      tasks = data.tasks
    } else if(Array.isArray(data.result)) {
      tasks = data.result
    } else if(data.success && Array.isArray(data.tasks)) {
      tasks = data.tasks
    }
  }
  
  // Normalize task fields - map common field name variations
  return tasks.map(task => ({
    id: task.id || task._id,
    title: task.title || task.name || task.text || task.summary || '',
    description: task.description || task.desc || task.body || task.content || '',
    completed: task.completed || task.done || task.finished || false,
    status: task.status || (task.completed || task.done ? 'done' : 'todo'),
    userId: task.userId || task.ownerId || task.owner?.id
  }))
}

/**
 * Fetches a single task by ID from the API
 * @async
 * @param {string|number} id - The ID of the task to fetch
 * @returns {Promise<Object>} Task object with properties: id, title, description, completed
 * @throws {Error} If the API request fails or task not found
 */
export async function fetchTask(id){
  if(DEMO_MODE){
    const task = demoTasks.find(t => t.id == id)
    if(!task) throw new Error('Task not found')
    return {
      id: task.id,
      title: task.title,
      description: task.description || '',
      completed: task.completed || false,
      status: task.completed ? 'done' : 'todo'
    }
  }
  
  const res = await api.get(`/tasks/${id}`)
  const task = res.data
  
  // Normalize task fields - map common field name variations
  return {
    id: task.id || task._id,
    title: task.title || task.name || task.text || task.summary || '',
    description: task.description || task.desc || task.body || task.content || '',
    completed: task.completed || task.done || task.finished || task.status === 'done' || false,
    status: task.status || (task.completed || task.done ? 'done' : 'todo'),
    userId: task.userId || task.ownerId || task.owner?.id
  }
}

/**
 * Fetches child tasks for a specific task ID
 * @async
 * @param {string|number} id - The ID of the parent task
 * @returns {Promise<Array>} Array of child task objects
 * @throws {Error} If the API request fails
 */
export async function fetchChildTasks(id){
  const res = await api.get(`/tasks/${id}/children`)
  return res.data
}

/**
 * Creates a new task with the provided data
 * @async
 * @param {Object} payload - The task data
 * @param {string} payload.title - Title of the task (required)
 * @param {string} payload.description - Description of the task (optional)
 * @param {boolean} [payload.completed=false] - Whether the task is completed
 * @param {string|number} [payload.parentId] - ID of parent task for hierarchical relationships
 * @returns {Promise<Object>} The created task object with assigned ID
 * @throws {Error} If validation fails or API request fails
 */
export async function createTask(payload){
  if(DEMO_MODE){
    if(!currentUserId) throw new Error('Not authenticated')
    if(!payload.title?.trim()) throw new Error('Title is required')
    
    const newTask = {
      id: 'task_' + Date.now(),
      title: payload.title,
      description: payload.description || '',
      completed: false,
      status: payload.status || 'todo',
      userId: currentUserId
    }
    demoTasks.push(newTask)
    saveDemoData()
    return newTask
  }
  
  const res = await api.post('/tasks', payload)
  return res.data
}

/**
 * Updates an existing task with new data
 * @async
 * @param {string|number} id - The ID of the task to update
 * @param {Object} payload - The data to update
 * @param {string} [payload.title] - Updated title
 * @param {string} [payload.description] - Updated description
 * @param {boolean} [payload.completed] - Updated completion status
 * @returns {Promise<Object>} The updated task object
 * @throws {Error} If the API request fails or task not found
 */
export async function updateTask(id, payload){
  if(DEMO_MODE){
    if(!currentUserId) throw new Error('Not authenticated')
    const taskIndex = demoTasks.findIndex(t => t.id == id)
    if(taskIndex === -1) throw new Error('Task not found')
    
    const task = demoTasks[taskIndex]
    demoTasks[taskIndex] = {
      ...task,
      title: payload.title !== undefined ? payload.title : task.title,
      description: payload.description !== undefined ? payload.description : task.description,
      completed: payload.completed !== undefined ? payload.completed : task.completed,
      status: payload.status || (payload.completed ? 'done' : 'todo') || task.status
    }
    saveDemoData()
    return demoTasks[taskIndex]
  }
  
  const res = await api.patch(`/tasks/${id}`, payload)
  return res.data
}

/**
 * Deletes a task by ID
 * @async
 * @param {string|number} id - The ID of the task to delete
 * @returns {Promise<Object>} Response object confirming deletion
 * @throws {Error} If the API request fails or task not found
 */
export async function deleteTask(id){
  if(DEMO_MODE){
    if(!currentUserId) throw new Error('Not authenticated')
    const taskIndex = demoTasks.findIndex(t => t.id == id)
    if(taskIndex === -1) throw new Error('Task not found')
    
    demoTasks.splice(taskIndex, 1)
    saveDemoData()
    return { success: true, message: 'Task deleted' }
  }
  
  const res = await api.delete(`/tasks/${id}`)
  return res.data
}

/**
 * Registers a new user with email and password
 * @async
 * @param {Object} payload - User registration credentials
 * @param {string} payload.email - User email address
 * @param {string} payload.password - User password (minimum 6 characters recommended)
 * @returns {Promise<Object>} Response object with token and user data
 * @throws {Error} If email already exists or validation fails
 */
export async function registerUser(payload){
  if(DEMO_MODE){
    const { email, password, name } = payload
    if(!email || !password) throw new Error('Email and password required')
    
    const existingUser = demoUsers.find(u => u.email === email)
    if(existingUser) throw new Error('Email already registered')
    
    const newUser = {
      id: 'user_' + Date.now(),
      email,
      password,
      name: name || email.split('@')[0],
      username: email.split('@')[0]
    }
    demoUsers.push(newUser)
    saveDemoData()
    currentUserId = newUser.id
    localStorage.setItem('demo_userId', currentUserId)
    
    return {
      success: true,
      token: 'demo_token_' + newUser.id,
      accessToken: 'demo_token_' + newUser.id,
      user: { id: newUser.id, email: newUser.email, username: newUser.username, name: newUser.name }
    }
  }
  
  try {
    const res = await api.post('/auth/register', payload)
    return res.data
  } catch (error) {
    // Handle 409 as success (user already exists but auth succeeded)
    if (error.response?.status === 409 && error.response?.data) {
      return error.response.data
    }
    throw error
  }
}

/**
 * Authenticates a user with email and password
 * @async
 * @param {Object} payload - User login credentials
 * @param {string} payload.email - User email address
 * @param {string} payload.password - User password
 * @returns {Promise<Object>} Response object with JWT token and user data
 * @throws {Error} If credentials are invalid
 */
export async function loginUser(payload){
  if(DEMO_MODE){
    const { email, password } = payload
    if(!email || !password) throw new Error('Email and password required')
    
    const user = demoUsers.find(u => u.email === email && u.password === password)
    if(!user) throw new Error('Invalid email or password')
    
    currentUserId = user.id
    localStorage.setItem('demo_userId', currentUserId)
    
    return {
      success: true,
      token: 'demo_token_' + user.id,
      accessToken: 'demo_token_' + user.id,
      user: { id: user.id, email: user.email, username: user.username, name: user.name }
    }
  }
  
  const res = await api.post('/auth/login', payload)
  return res.data
}

/**
 * Refreshes the access token using the current token
 * Used to extend the session without re-logging in
 * @async
 * @returns {Promise<Object>} Response object with new token
 * @throws {Error} If token refresh fails
 */
export async function refreshAccessToken(){
  if(DEMO_MODE){
    if(!currentUserId) throw new Error('No user logged in')
    const user = demoUsers.find(u => u.id === currentUserId)
    if(!user) throw new Error('User not found')
    return { token: 'demo_token_' + user.id, accessToken: 'demo_token_' + user.id }
  }
  
  const refreshToken = localStorage.getItem('refreshToken')
  if(!refreshToken) throw new Error('No refresh token available')
  const refreshUrl = (api.defaults.baseURL || '') + '/auth/refresh'
  const res = await axios.post(refreshUrl, { refreshToken })
  return res.data
}

/**
 * Retrieves the current authenticated user's profile information
 * Requires valid JWT token in Authorization header
 * @async
 * @returns {Promise<Object>} Current user object with id, email, username
 * @throws {Error} If not authenticated or token is invalid
 */
export async function getMe(){
  if(DEMO_MODE){
    if(!currentUserId) throw new Error('Not authenticated')
    const user = demoUsers.find(u => u.id === currentUserId)
    if(!user) throw new Error('User not found')
    return { id: user.id, email: user.email, username: user.username, name: user.name }
  }
  
  const res = await api.get('/auth/me')
  return res.data
}

/**
 * Logs out the current user by invalidating their session on the server
 * @async
 * @returns {Promise<Object>} Response confirming logout
 * @throws {Error} If the API request fails
 */
export async function logoutUser(){
  const res = await api.post('/auth/logout')
  return res.data
}

// Backward compatibility exports - map old todo names to task endpoints
export const fetchTodos = fetchTasks
export const fetchTodo = fetchTask
export const createTodo = createTask
export const updateTodo = updateTask
export const deleteTodo = deleteTask
