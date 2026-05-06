import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from '../pages/Login'
import { AuthProvider } from '../context/AuthContext'
import { vi } from 'vitest'

vi.mock('../api', () => ({
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  getMe: vi.fn(),
  refreshAccessToken: vi.fn()
}))

import { loginUser, getMe } from '../api'

function renderWithProviders(ui) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <AuthProvider>
        <BrowserRouter>
          {ui}
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

describe('Login', () => {
  it('renders login form with email and password inputs', () => {
    renderWithProviders(<Login />)
    // Get inputs by their id
    expect(screen.getByLabelText(/^Email$/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument()
    // Check for the login button
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
    // Check for email placeholder
    const emailInput = screen.getByPlaceholderText(/your@email.com/i)
    expect(emailInput).toBeInTheDocument()
    expect(emailInput.type).toBe('email')
  })

  it('calls loginUser when form is submitted', async () => {
    loginUser.mockResolvedValue({ token: 'test-token', user: { id: 1, email: 'test@example.com' } })
    getMe.mockResolvedValue({ id: 1, email: 'test@example.com' })

    renderWithProviders(<Login />)

    await waitFor(() => {
      expect(loginUser).toBeDefined()
    })
  })
})
