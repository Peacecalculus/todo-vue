import React from 'react'
import { useSocket } from '../context/SocketContext'

/**
 * Notifications component displays real-time updates from WebSocket
 * Shows notifications in fixed position and provides clear button
 */
export default function Notifications(){
  const { notifications, setNotifications } = useSocket() || { notifications: [], setNotifications: ()=>{} }
  if(!notifications || notifications.length === 0) return null
  return (
    <div aria-live="polite" aria-label="Notifications" className="fixed right-4 bottom-4 w-80 space-y-2 z-50">
      {notifications.map(n => (
        <div key={n.id} className="bg-blue-50 border-l-4 border-blue-700 p-3 rounded shadow">
          <div className="text-sm font-medium text-gray-900">{n.title || 'Update'}</div>
          <div className="text-xs text-gray-700 mt-1">{n.message || JSON.stringify(n)}</div>
        </div>
      ))}
      <button onClick={()=>setNotifications([])} className="mt-2 text-sm text-gray-700 underline hover:text-gray-900 font-medium focus-visible:outline-2 focus-visible:outline-blue-600">Clear all</button>
    </div>
  )
}
