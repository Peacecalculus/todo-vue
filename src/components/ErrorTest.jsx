import React from 'react'

export default function ErrorTest(){
  // Throw when this component is rendered to exercise ErrorBoundary
  throw new Error('Test error for ErrorBoundary')
}
