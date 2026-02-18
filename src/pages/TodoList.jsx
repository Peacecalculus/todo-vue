import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchTodos, updateTodo, deleteTodo } from '../api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTodo } from '../api'
import { useAuth } from '../context/AuthContext'
import { FiEdit2, FiTrash2, FiPlus, FiCheck } from 'react-icons/fi'

const PAGE_SIZE = 10

export default function TodoList(){
  /**
   * Fetches all todos from the API
   * @type {Object} Query result with todos array and loading states
   */
  const { data: todos = [], isLoading, isError, error } = useQuery({ queryKey: ['todos'], queryFn: fetchTodos })
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  const createMutation = useMutation({
    mutationFn: createTodo,
    onSuccess(){
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      setNewTitle('')
      setNewDesc('')
    }
  })
  
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateTodo(id, payload),
    onSuccess(){
      setUpdatingId(null)
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
    onError() {
      setUpdatingId(null)
    }
  })
  
  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess(){
      setDeletingId(null)
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
    onError(error) {
      setDeletingId(null)
      console.error('Delete error:', error)
      alert('Failed to delete task: ' + (error.message || 'Unknown error'))
    }
  })
  
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [updatingId, setUpdatingId] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  /**
   * Filters todos based on search term and completion status
   * @type {Array} Filtered list of todos
   */
  const filtered = useMemo(()=>{
    // Ensure todos is always an array
    const todoArray = Array.isArray(todos) ? todos : []
    // Filter by current user if logged in
    const userTodos = user ? todoArray.filter(t => !t.userId || t.userId === user.id) : todoArray
    const s = search.trim().toLowerCase()
    return userTodos.filter(t => {
      if(s && !t.title.toLowerCase().includes(s)) return false
      if(filter === 'complete') return Boolean(t.completed)
      if(filter === 'incomplete') return !t.completed
      return true
    })
  }, [todos, search, filter, user])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)

  /**
   * Navigates to a specific page
   * @param {number} p - Page number to navigate to
   */
  function goto(p){
    setPage(Math.max(1, Math.min(totalPages, p)))
    window.scrollTo({top:0, behavior:'smooth'})
  }

  if(isLoading) return <div className="min-h-screen bg-black text-gray-400 flex items-center justify-center">Loading todos...</div>
  if(isError) return <div className="min-h-screen bg-black text-red-500 flex items-center justify-center">Error: {String(error)}</div>

  const completedCount = todos.filter(t => t.completed).length
  const totalCount = todos.length
  const completionPercentage = Math.round((completedCount / (totalCount || 1)) * 100)

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded flex items-center justify-center">
            <FiCheck className="text-black w-6 h-6" />
          </div>
          <h1 className="text-4xl font-bold">TODO</h1>
        </div>

        {/* Progress Card */}
        <div className="mb-8 border border-gray-700 rounded-2xl p-6 flex items-center justify-between">
          <div>
            <div className="text-2xl font-semibold mb-1">Task Done</div>
            <div className="text-gray-400">Keep it up</div>
          </div>
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-lime-500 rounded-full flex items-center justify-center">
            <div className="text-3xl font-bold">{completedCount}/{totalCount}</div>
          </div>
        </div>

        {/* Add Task Input */}
        {user && (
          <form onSubmit={e => {
            e.preventDefault()
            if(newTitle.trim()) {
              createMutation.mutate({title: newTitle, description: newDesc, status: 'todo'})
              setNewTitle('')
              setNewDesc('')
            }
          }} className="mb-8 flex gap-2">
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Write your next task"
              className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={createMutation.isPending || !newTitle.trim()}
              className="w-12 h-12 bg-lime-500 hover:bg-lime-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black rounded-lg font-bold flex items-center justify-center transition-colors"
              aria-label="Add new todo"
            >
              <FiPlus className="w-6 h-6" />
            </button>
          </form>
        )}

        {/* Search and Filter */}
        <div className="mb-6 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={search}
            onChange={e=>{setSearch(e.target.value); setPage(1)}}
            placeholder="Search tasks..."
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          />
          <select
            value={filter}
            onChange={e=>{setFilter(e.target.value); setPage(1)}}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
          >
            <option value="all">All</option>
            <option value="complete">Complete</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>

        {/* Task List */}
        <ul className="space-y-3 mb-6" role="list">
          {pageItems.map(todo => (
            <li key={todo.id} className="border border-gray-700 rounded-lg p-4 flex items-center justify-between hover:bg-gray-900 transition-colors group" role="listitem">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <button
                  onClick={() => {
                    setUpdatingId(todo.id)
                    updateMutation.mutate({ id: todo.id, payload: { status: todo.completed ? 'todo' : 'done' } })
                  }}
                  disabled={updatingId === todo.id}
                  className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    todo.completed
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-500 hover:border-green-500'
                  } disabled:opacity-50`}
                  aria-label={`${todo.completed ? 'Mark incomplete' : 'Mark complete'}`}
                >
                  {todo.completed && <FiCheck className="w-4 h-4 text-black" />}
                </button>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/todos/${todo.id}`}
                    className={`text-white hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500 rounded px-1 ${
                      todo.completed ? 'line-through text-gray-500' : ''
                    }`}
                  >
                    {todo.title || '(No title)'}
                  </Link>
                  {todo.description && <div className={`text-sm mt-1 ${todo.completed ? 'text-gray-600' : 'text-gray-400'}`}>{todo.description}</div>}
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link
                  to={`/todos/${todo.id}`}
                  className="p-2 hover:bg-gray-700 rounded transition-colors text-gray-400 hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                  aria-label="Edit todo"
                >
                  <FiEdit2 className="w-5 h-5" />
                </Link>
                <button
                  onClick={() => {
                    if(confirm('Are you sure you want to delete this task?')) {
                      setDeletingId(todo.id)
                      deleteMutation.mutate(todo.id)
                    }
                  }}
                  disabled={deletingId === todo.id}
                  className="p-2 hover:bg-red-900 hover:bg-opacity-30 rounded transition-colors text-gray-400 hover:text-red-500 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label="Delete todo"
                >
                  <FiTrash2 className="w-5 h-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        {totalPages > 1 && (
          <div className="flex items-center justify-between text-sm" role="group" aria-label="Pagination controls">
            <div className="text-gray-400">
              Page <span className="text-white font-medium">{page}</span> of <span className="text-white font-medium">{totalPages}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={()=>goto(page-1)}
                disabled={page===1}
                className="px-3 py-2 border border-gray-700 text-gray-400 rounded hover:border-green-500 hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label={`Go to previous page. Currently on page ${page}`}
              >
                Prev
              </button>
              <button
                onClick={()=>goto(page+1)}
                disabled={page===totalPages}
                className="px-3 py-2 border border-gray-700 text-gray-400 rounded hover:border-green-500 hover:text-green-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label={`Go to next page. Currently on page ${page}`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
