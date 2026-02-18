import React from 'react'
import { Link } from 'react-router-dom'

/**
 * ErrorBoundary component to catch and handle React component errors
 * Prevents entire app from crashing when an error occurs in child components
 * Logs error details for debugging purposes
 * @component
 */
export default class ErrorBoundary extends React.Component {
  constructor(props){
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error){
    return { hasError: true, error }
  }

  componentDidCatch(error, info){
    // In real app, report to monitoring service
    console.error('ErrorBoundary caught:', error, info)
  }

  render(){
    if(this.state.hasError){
      return (
        <div className="p-6 bg-red-50 text-red-800 rounded">
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="mt-2">{String(this.state.error?.message)}</p>
          <div className="mt-4">
            <Link to="/" className="text-sm underline">Go back to todos</Link>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
