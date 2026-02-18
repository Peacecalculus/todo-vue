import React from 'react'
import { render, screen } from '@testing-library/react'
import { AuthProvider, useAuth } from '../context/AuthContext'

function Consumer(){
  const { user, loading } = useAuth()
  if(loading) return <div>loading</div>
  return <div>{user ? 'has-user' : 'no-user'}</div>
}

test('AuthProvider initial state without token', ()=>{
  render(
    <AuthProvider>
      <Consumer />
    </AuthProvider>
  )
  expect(screen.getByText('no-user')).toBeInTheDocument()
})
