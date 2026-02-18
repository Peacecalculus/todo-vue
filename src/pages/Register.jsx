import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FiEye, FiEyeOff } from 'react-icons/fi'

/**
 * Register component for user signup
 * Displays registration form and handles new user account creation
 */
export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState(null)
  const { register, clearAuth } = useAuth()
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    setError(null)
    try{
      const res = await register({ name, email, password })
      if(res?.token){ nav('/') }
      else setError('Registration failed: ' + JSON.stringify(res))
    }catch(err){ 
      console.error('Register error:', err)
      if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else if (err.response?.data) {
        setError('Error: ' + JSON.stringify(err.response.data))
      } else {
        setError('Registration failed: ' + (err.message || String(err)))
      }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md border border-gray-700 rounded-lg p-8 bg-gray-900">
        <h2 className="text-2xl font-bold mb-6">Create Account</h2>
        {error && <div className="bg-red-900 bg-opacity-30 border border-red-700 text-red-400 p-3 rounded mb-4" role="alert">{error}</div>}
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
            <input id="name" required type="text" value={name} onChange={e=>setName(e.target.value)} className="w-full border border-gray-700 px-4 py-2 rounded-lg bg-black text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="John Doe" />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
            <input id="email" required type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full border border-gray-700 px-4 py-2 rounded-lg bg-black text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="your@email.com" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <div className="relative">
              <input id="password" required type={showPassword ? 'text' : 'password'} value={password} onChange={e=>setPassword(e.target.value)} className="w-full border border-gray-700 px-4 py-2 pr-10 rounded-lg bg-black text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="••••••••" />
              <button type="button" onClick={()=>setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-200 focus:outline-none" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-green-500">Create Account</button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-400 space-y-2">
          <div>Already have an account? <a href="/login" className="text-green-400 hover:text-green-300">Login here</a></div>
          <div>
            <button type="button" onClick={() => { clearAuth(); setName(''); setEmail(''); setPassword(''); setError(null); }} className="text-xs text-gray-400 hover:text-gray-200 underline">Start fresh (clear local auth)</button>
          </div>
        </div>
      </div>
    </div>
  )
}
