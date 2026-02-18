import React from 'react'
import { render } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProtectedRoute from '../components/ProtectedRoute'
import { AuthProvider } from '../context/AuthContext'
import { vi } from 'vitest'

vi.mock('../api', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  getMe: vi.fn(() => Promise.resolve(null)),
  refreshAccessToken: vi.fn()
}))

function renderWithProviders(ui) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe('ProtectedRoute', () => {
  it('renders ProtectedRoute component without errors', () => {
    const { container } = renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    // Component should render without throwing errors
    expect(container).toBeTruthy()
  })

  it('ProtectedRoute component is defined', () => {
    expect(ProtectedRoute).toBeDefined()
    expect(typeof ProtectedRoute).toBe('function')
  })
})
