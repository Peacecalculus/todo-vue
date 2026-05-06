import React from 'react'
import { render, screen } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider, useAuth } from '../context/AuthContext'

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
})

function Consumer(){
  const { user, loading } = useAuth()
  if(loading) return <div>loading</div>
  return <div>{user ? 'has-user' : 'no-user'}</div>
}

test('AuthProvider initial state without token', ()=>{
  render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    </QueryClientProvider>
  )
  expect(screen.getByText('no-user')).toBeInTheDocument()
})
