import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import TodoList from './pages/TodoList'
import TodoDetails from './pages/TodoDetails'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'
import { useAuth } from './context/AuthContext'
import ErrorTest from './components/ErrorTest'

export default function App(){
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-black text-white">
      <header className="bg-gray-950 border-b border-gray-800" role="banner">
        <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold"><Link to="/" aria-label="Todo App Home" className="hover:text-green-400 transition-colors">📋 Todo App</Link></h1>
          <nav className="flex items-center gap-4" aria-label="Main navigation">
            <Link to="/" className="text-sm text-gray-400 hover:text-green-400 transition-colors focus-visible:outline-2 focus-visible:outline-green-600" aria-label="View all todos">Todos</Link>
            {user ? (
              <>
                <span className="text-sm text-gray-400" role="status" aria-live="polite">Logged in as {user.email || user.username}</span>
                <button onClick={logout} className="text-sm text-red-500 hover:text-red-400 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-red-600" aria-label="Log out of your account">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm text-gray-400 hover:text-green-400 transition-colors focus-visible:outline-2 focus-visible:outline-green-600" aria-label="Log in to your account">Login</Link>
                <Link to="/register" className="text-sm text-gray-400 hover:text-green-400 transition-colors focus-visible:outline-2 focus-visible:outline-green-600" aria-label="Create a new account">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="min-h-[calc(100vh-73px)]">
        <Routes>
          <Route path="/" element={<TodoList />} />
          <Route path="/todos/:id" element={<TodoDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/error" element={<ErrorTest />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  )
}
