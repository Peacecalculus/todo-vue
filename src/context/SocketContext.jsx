import React, { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

/**
 * SocketProvider component that manages WebSocket connection for real-time updates
 * Automatically connects when user is authenticated and manages incoming notifications
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {React.ReactElement} Provider component
 */
export function SocketProvider({ children }){
  const { token } = useAuth()
  const [socket, setSocket] = useState(null)
  const [notifications, setNotifications] = useState([])

  useEffect(()=>{
    if(!token) return
    const wsUrl = (location.protocol === 'https:' ? 'wss' : 'ws') + '://api.oluwasetemi.dev/ws/client/tasks'
    const ws = new WebSocket(wsUrl + `?token=${token}`)
    ws.addEventListener('open', ()=>console.log('ws open'))
    ws.addEventListener('message', (e)=>{
      try{
        const data = JSON.parse(e.data)
        setNotifications(n => [{id: Date.now(), ...data}, ...n].slice(0,10))
      }catch(err){ console.error('ws msg parse', err) }
    })
    ws.addEventListener('close', ()=>console.log('ws closed'))
    setSocket(ws)
    return ()=>{ ws.close() }
  }, [token])

  return (
    <SocketContext.Provider value={{ socket, notifications, setNotifications }}>
      {children}
    </SocketContext.Provider>
  )
}

/**
 * Custom hook to access WebSocket context and notifications
 * Must be used within SocketProvider
 * @returns {Object} Socket context with WebSocket instance and notifications array
 */
export function useSocket(){ 
  return useContext(SocketContext) 
}

export default SocketContext
