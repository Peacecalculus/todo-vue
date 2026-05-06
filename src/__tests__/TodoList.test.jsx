import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '../context/AuthContext'
import { vi } from 'vitest'

vi.mock('../api', () => {
  const fetchTodosFn = vi.fn()
  const createTodoFn = vi.fn()
  const updateTodoFn = vi.fn()
  const deleteTodoFn = vi.fn()
  return {
    fetchTodos: fetchTodosFn,
    fetchTasks: fetchTodosFn,
    createTodo: createTodoFn,
    createTask: createTodoFn,
    updateTodo: updateTodoFn,
    updateTask: updateTodoFn,
    deleteTodo: deleteTodoFn,
    deleteTask: deleteTodoFn,
    getMe: vi.fn(),
    refreshAccessToken: vi.fn()
  }
})
import { fetchTodos } from '../api'
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
  fetchTodos.mockResolvedValue(tasks)

  renderWithClient(<Routes><Route path="/" element={<TodoList/>} /></Routes>)

  // shows loading initially
  expect(screen.getByText(/Loading todos.../i)).toBeInTheDocument()

  await waitFor(()=>{
    expect(screen.getByText('Task 1')).toBeInTheDocument()
  })

  // input should be present after load
  expect(screen.getByPlaceholderText(/Search tasks/i)).toBeInTheDocument()

  // page controls
  expect(screen.getByText(/1 \/ /)).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Next/i })).toBeInTheDocument()
})
