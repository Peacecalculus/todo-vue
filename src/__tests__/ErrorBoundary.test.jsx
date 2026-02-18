import React from 'react'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ErrorBoundary from '../components/ErrorBoundary'

function Bomb(){
  throw new Error('boom')
}

test('ErrorBoundary shows fallback UI when child throws', ()=>{
  render(
    <MemoryRouter>
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>
    </MemoryRouter>
  )
  expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument()
})
