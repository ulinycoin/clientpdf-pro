import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Button from './Button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button onClick={() => {}}>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('applies primary variant styles by default', () => {
    render(<Button onClick={() => {}}>Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('from-blue-500', 'to-blue-600')
  })

  it('applies secondary variant styles when specified', () => {
    render(<Button onClick={() => {}} variant="secondary">Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('bg-white', 'border-secondary-200')
  })

  it('shows loading spinner when loading prop is true', () => {
    render(<Button onClick={() => {}} loading>Click me</Button>)
    const loadingSpinner = screen.getByRole('button').querySelector('svg')
    expect(loadingSpinner).toBeInTheDocument()
    expect(loadingSpinner).toHaveClass('animate-spin')
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button onClick={() => {}} disabled>Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed')
  })

  it('is disabled when loading prop is true', () => {
    render(<Button onClick={() => {}} loading>Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('applies full width class when fullWidth prop is true', () => {
    render(<Button onClick={() => {}} fullWidth>Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('w-full')
  })

  it('applies custom className', () => {
    render(<Button onClick={() => {}} className="custom-class">Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveClass('custom-class')
  })

  it('applies correct size classes', () => {
    const { rerender } = render(<Button onClick={() => {}} size="sm">Click me</Button>)
    let button = screen.getByRole('button')
    expect(button).toHaveClass('px-4', 'py-2', 'text-sm', 'min-h-[40px]')

    rerender(<Button onClick={() => {}} size="md">Click me</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('px-6', 'py-3', 'text-base', 'min-h-[48px]')

    rerender(<Button onClick={() => {}} size="lg">Click me</Button>)
    button = screen.getByRole('button')
    expect(button).toHaveClass('px-8', 'py-4', 'text-lg', 'min-h-[56px]')
  })

  it('has correct button type', () => {
    render(<Button onClick={() => {}} type="submit">Submit</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'submit')
  })

  it('defaults to button type', () => {
    render(<Button onClick={() => {}}>Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toHaveAttribute('type', 'button')
  })
})
