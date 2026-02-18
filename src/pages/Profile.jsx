import React from 'react'
import { useAuth } from '../context/AuthContext'

/**
 * Profile component displays the logged-in user's information
 * Shows user ID, email, and username
 */
export default function Profile(){
  const { user } = useAuth()
  if(!user) return null
  return (
    <div className="max-w-md mx-auto border border-gray-700 rounded-lg p-8 bg-gray-900">
      <h2 className="text-2xl font-bold text-white mb-6">Profile</h2>
      <div className="space-y-4">
        <div>
          <span className="text-sm font-medium text-gray-400">User ID</span>
          <p className="text-white mt-1">{user.id}</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-400">Email</span>
          <p className="text-white mt-1">{user.email || user.username}</p>
        </div>
      </div>
    </div>
  )
}
