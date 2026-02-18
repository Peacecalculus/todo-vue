import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchTodo } from '../api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTodo, deleteTodo } from '../api'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

/**
 * TodoDetails component displays a single todo with edit and delete capabilities
 * Shows full details and allows authenticated users to modify the todo
 */
export default function TodoDetails(){
  const { id } = useParams()
  const navigate = useNavigate()
  const authContext = useAuth()
  const user = authContext?.user
  /**
   * Fetch the todo data
   * @type {Object} Query result with todo data and loading states
   */
  const { data: todo, isLoading, isError, error } = useQuery({ queryKey: ['todo', id], queryFn: ()=>fetchTodo(id), enabled: !!id })
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [editError, setEditError] = useState(null)

  const updateMutation = useMutation({ 
    mutationFn: ({id, payload})=>updateTodo(id, payload), 
    onSuccess: ()=>{ 
      queryClient.invalidateQueries({ queryKey: ['todos'] })
      queryClient.invalidateQueries({ queryKey: ['todo', id] })
      setEditing(false)
      setEditError(null)
    },
    onError: (err) => {
      console.error('Update error:', err)
      if (err.response?.status === 401) {
        setEditError('Your session has expired. Please login again.')
        setTimeout(() => navigate('/login'), 2000)
      } else {
        setEditError('Failed to save: ' + (err.message || 'Unknown error'))
      }
    }
  })
  const deleteMutation = useMutation({ mutationFn: ()=>deleteTodo(id), onSuccess: ()=>{ queryClient.invalidateQueries({ queryKey: ['todos'] }) } })

  if(isLoading) return <div className="p-4 text-gray-400" role="status" aria-live="polite">Loading todo...</div>
  if(isError) return <div className="p-4 text-red-500 font-medium">Error: {String(error)}</div>
  if(!todo) return <div className="p-4 text-gray-400">Todo not found</div>

  return (
    <article className="max-w-2xl mx-auto">
      <div className="mb-6 border border-gray-700 rounded-lg p-6 bg-gray-900">
        <h2 className="text-3xl font-bold text-white mb-4">{todo.title}</h2>
        <p className="text-gray-400 mb-2">ID: {todo.id}</p>
        <p className="text-sm font-medium text-gray-400 mb-4">
          Status: {todo.completed ? <span className="text-green-400">✓ Completed</span> : <span className="text-orange-400">○ Incomplete</span>}
        </p>
        {todo.description && <p className="text-gray-300 text-lg">{todo.description}</p>}

        <div className="mt-6 flex gap-3 flex-wrap">
          <Link to="/" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-green-500" aria-label="Return to todos list">← Back to list</Link>
          {user ? (
            <>
              <button onClick={()=>{setEditing(true); setTitle(todo.title); setDescription(todo.description || '')}} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-green-500" aria-label="Edit this todo">Edit</button>
              <button onClick={async ()=>{ if(confirm('Delete this todo?')){ await deleteMutation.mutateAsync(); window.location.href='/' } }} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-red-500" aria-label="Delete this todo">Delete</button>
            </>
          ) : (
            <Link to="/login" className="px-4 py-2 bg-gray-700 text-gray-300 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-yellow-500">Login to edit</Link>
          )}
        </div>
      </div>

      {editing && (
        <form onSubmit={async e=>{e.preventDefault(); setEditError(null); await updateMutation.mutateAsync({id, payload:{title, description}})}} className="border border-gray-700 rounded-lg p-6 bg-gray-900" aria-label="Edit todo form">
          <h3 className="text-xl font-semibold text-white mb-4">Edit Todo</h3>
          {editError && <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-400 p-3 rounded mb-4" role="alert">{editError}</div>}
          <div className="mb-4">
            <label htmlFor="editTitle" className="block text-sm font-medium text-gray-300 mb-2">Title</label>
            <input id="editTitle" value={title} onChange={e=>setTitle(e.target.value)} className="w-full border border-gray-700 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="mb-6">
            <label htmlFor="editDesc" className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea id="editDesc" value={description} onChange={e=>setDescription(e.target.value)} rows="4" className="w-full border border-gray-700 px-4 py-2 rounded-lg bg-gray-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div className="flex gap-3">
            <button type="submit" disabled={updateMutation.isPending} className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-green-500" aria-label="Save changes to todo">{updateMutation.isPending ? 'Saving...' : 'Save'}</button>
            <button type="button" onClick={()=>{setEditing(false); setEditError(null)}} disabled={updateMutation.isPending} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-gray-500" aria-label="Cancel editing">Cancel</button>
          </div>
        </form>
      )}
    </article>
  )
}
