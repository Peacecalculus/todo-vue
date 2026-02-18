import React from 'react'
import { Link } from 'react-router-dom'

/**
 * NotFound component displays a 404 error page
 * Shown when user navigates to an undefined route
 */
export default function NotFound(){
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="text-6xl font-bold text-green-400 mb-4">404</div>
        <h2 className="text-3xl font-semibold mb-2">Page not found</h2>
        <p className="text-gray-400 mb-6">The page you are looking for does not exist.</p>
        <Link to="/" className="inline-block px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-green-500">Go home</Link>
      </div>
    </div>
  )
}
