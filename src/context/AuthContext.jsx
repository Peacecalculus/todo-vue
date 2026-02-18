import React, { createContext, useContext, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { loginUser, registerUser, getMe, logoutUser, refreshAccessToken } from '../api'

const AuthContext = createContext(null)

/**
 * AuthProvider component that manages authentication state globally
 * Provides token, user data, loading state, and auth methods to all child components
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 * @returns {React.ReactElement} Provider component
 */
export function AuthProvider({ children }){
  const [token, setToken] = useState(() => localStorage.getItem('accessToken') || localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(!!token)
  const queryClient = useQueryClient()

  useEffect(()=>{
    async function load(){
      if(!token) return setLoading(false)
      try{
        const me = await getMe()
        setUser(me)
      }catch(e){
        console.error('auth load failed', e)
        try{
          // Attempt to refresh token if getMe fails
          const refreshResult = await refreshAccessToken()
          const newAccess = refreshResult?.accessToken || refreshResult?.token || refreshResult?.access
          const newRefresh = refreshResult?.refreshToken || refreshResult?.refresh
          if(newAccess){
            setToken(newAccess)
            localStorage.setItem('accessToken', newAccess)
            if(newRefresh) localStorage.setItem('refreshToken', newRefresh)
            const me = await getMe()
            setUser(me)
          }else{
            throw e
          }
        }catch(refreshError){
          console.error('token refresh failed', refreshError)
          setToken(null)
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
        }
      }finally{ setLoading(false) }
    }
    load()
  }, [token])

  const login = async (credentials) => {
    const res = await loginUser(credentials)
    const access = res?.accessToken || res?.token || res?.access
    const refresh = res?.refreshToken || res?.refresh
    if(access){
      setToken(access)
      localStorage.setItem('accessToken', access)
      if(refresh) localStorage.setItem('refreshToken', refresh)
      const me = await getMe()
      setUser(me)
    }
    return res
  }

  const register = async (data) => {
    const res = await registerUser(data)
    const access = res?.accessToken || res?.token || res?.access
    const refresh = res?.refreshToken || res?.refresh
    if(access){
      setToken(access)
      localStorage.setItem('accessToken', access)
      if(refresh) localStorage.setItem('refreshToken', refresh)
      const me = await getMe()
      setUser(me)
    }
    return res
  }

  const logout = async () => {
    try {
      await logoutUser()
    } catch (e) {
      console.error('logout failed', e)
    } finally {
      setToken(null)
      setUser(null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  const clearAuth = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    try{ queryClient.clear() }catch(e){ /* ignore if no client */ }
  }

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, register, clearAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Custom hook to access authentication context
 * Must be used within AuthProvider
 * @returns {Object} Auth context with token, user, loading state, and auth methods
 * @throws Will fail if used outside of AuthProvider
 */
export function useAuth(){
  return useContext(AuthContext)
}

export default AuthContext
