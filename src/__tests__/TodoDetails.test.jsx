import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { vi } from 'vitest'
import { AuthProvider } from '../context/AuthContext'

vi.mock('../api', () => {
  const fetchTaskFn = vi.fn()
  const updateTaskFn = vi.fn()
  const deleteTaskFn = vi.fn()
  return {
    fetchTask: fetchTaskFn,
    updateTask: updateTaskFn,
    deleteTask: deleteTaskFn,
    fetchTodo: fetchTaskFn,
    updateTodo: updateTaskFn,
    deleteTodo: deleteTaskFn,
    getMe: vi.fn(),
    refreshAccessToken: vi.fn()
  }
})
import { fetchTask } from '../api'
import TodoDetails from '../pages/TodoDetails'

function renderWithClient(ui, path='/todos/1'){
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <MemoryRouter initialEntries={[path]}>
          {ui}
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

test('renders todo details and edit flow', async ()=>{
  const task = { id: 1, title: 'Test Task', completed: false, description: 'desc' }
  fetchTask.mockResolvedValue(task)

  renderWithClient(<Routes><Route path="/todos/:id" element={<TodoDetails/>} /></Routes>)

  await waitFor(()=>{
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  // Edit button should exist
  expect(screen.getByText(/Edit/i)).toBeInTheDocument()
})
