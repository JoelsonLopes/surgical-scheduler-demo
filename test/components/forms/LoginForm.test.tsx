import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '@/app/auth/login/page'
import type { SupabaseClient } from '@supabase/supabase-js'

// Mock do Next.js router
const mockPush = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock do Next.js Image
vi.mock('next/image', () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />
  },
}))

// Mock do Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signInWithPassword: vi.fn(),
    },
  })),
}))

// Mock do sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

describe('LoginPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render login form', () => {
    render(<LoginPage />)

    expect(
      screen.getByText('Sistema de Gestão do Bloco Cirúrgico')
    ).toBeInTheDocument()
    expect(screen.getByLabelText('E-mail')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument()
  })

  it('should have correct input types', () => {
    render(<LoginPage />)

    const emailInput = screen.getByLabelText('E-mail')
    const passwordInput = screen.getByLabelText('Senha')

    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('should have required fields', () => {
    render(<LoginPage />)

    expect(screen.getByLabelText('E-mail')).toBeRequired()
    expect(screen.getByLabelText('Senha')).toBeRequired()
  })

  it('should update email input value', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    const emailInput = screen.getByLabelText('E-mail')
    await user.type(emailInput, 'test@example.com')

    expect(emailInput).toHaveValue('test@example.com')
  })

  it('should update password input value', async () => {
    const user = userEvent.setup()
    render(<LoginPage />)

    const passwordInput = screen.getByLabelText('Senha')
    await user.type(passwordInput, 'password123')

    expect(passwordInput).toHaveValue('password123')
  })

  it('should disable submit button during loading', async () => {
    const user = userEvent.setup()
    const { createClient } = await import('@/lib/supabase/client')
    const mockSignIn = vi.fn().mockImplementation(() => new Promise(() => {}))

    vi.mocked(createClient).mockReturnValue({
      auth: {
        signInWithPassword: mockSignIn,
      },
    } as unknown as SupabaseClient)

    render(<LoginPage />)

    const emailInput = screen.getByLabelText('E-mail')
    const passwordInput = screen.getByLabelText('Senha')
    const submitButton = screen.getByRole('button', { name: /entrar/i })

    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    await user.click(submitButton)

    await waitFor(() => {
      expect(submitButton).toBeDisabled()
      expect(submitButton).toHaveTextContent('Entrando...')
    })
  })

  it('should have forgot password link', () => {
    render(<LoginPage />)

    const forgotLink = screen.getByText('Esqueceu a senha?')
    expect(forgotLink).toBeInTheDocument()
    expect(forgotLink).toHaveAttribute('href', '/auth/reset-password')
  })

  it('should have support contact link', () => {
    render(<LoginPage />)

    const supportLink = screen.getByText('Entre em contato com o suporte')
    expect(supportLink).toBeInTheDocument()
  })

  it('should display company information', () => {
    render(<LoginPage />)

    expect(screen.getByText(/SurgiScheduler Demo/)).toBeInTheDocument()
    expect(screen.getByText(/LGPD\/HIPAA/)).toBeInTheDocument()
  })

  it('should render logo image', () => {
    render(<LoginPage />)

    const logo = screen.getByAltText('SurgiScheduler Demo')
    expect(logo).toBeInTheDocument()
  })
})
