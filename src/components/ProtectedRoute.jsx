import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * ProtectedRoute component to guard routes that require authentication
 * Redirects unauthenticated users to login, shows loading state while checking auth
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child component(s) to render if authenticated
 * @returns {React.ReactElement} Protected content or redirect/loading state
 */
export default function ProtectedRoute({ children }){
  const { user, loading } = useAuth()
  if(loading) return <div className="p-4">Checking authentication...</div>
  if(!user) return <Navigate to="/login" replace />
  return children
}
