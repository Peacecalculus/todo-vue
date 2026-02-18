import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { vi } from 'vitest'

vi.mock('../api', () => {
  const fetchTasksFn = vi.fn()
  const createTaskFn = vi.fn()
  const updateTaskFn = vi.fn()
  const deleteTaskFn = vi.fn()
  return {
    fetchTasks: fetchTasksFn,
    createTask: createTaskFn,
    fetchTodos: fetchTasksFn,
    createTodo: createTaskFn,
    updateTodo: updateTaskFn,
    deleteTodo: deleteTaskFn,
    getMe: vi.fn(),
    refreshAccessToken: vi.fn()
  }
})
import { fetchTasks } from '../api'
import TodoList from '../pages/TodoList'

function renderWithClient(ui){
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <MemoryRouter>
          {ui}
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

test('renders list and pagination', async ()=>{
  const tasks = Array.from({length:12}).map((_,i)=>({ id: i+1, title: `Task ${i+1}`, completed: i%2===0 }))
  fetchTasks.mockResolvedValue(tasks)

  renderWithClient(<Routes><Route path="/" element={<TodoList/>} /></Routes>)

  // shows loading initially
  expect(screen.getByText(/Loading todos.../i)).toBeInTheDocument()

  await waitFor(()=>{
    expect(screen.getByText('Task 1')).toBeInTheDocument()
  })

  // input should be present after load
  expect(screen.getByPlaceholderText(/Search tasks/i)).toBeInTheDocument()

  // page controls
  expect(screen.getByText(/Page 1 of/)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument()
})
