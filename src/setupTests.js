import '@testing-library/jest-dom'
import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from './context/AuthContext'

// Create a test QueryClient to avoid conflicts in tests
export const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
})

// Test wrapper that provides necessary context
export function TestWrapper({ children }) {
  const testQueryClient = createTestQueryClient()
  return React.createElement(
    QueryClientProvider,
    { client: testQueryClient },
    React.createElement(AuthProvider, null, children)
  )
}
