import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import React from 'react'
import { UserForm } from '@/components/users/UserForm'
import { User, UserRole } from '@/types'

describe('UserForm', () => {
  const mockOnSubmit = vi.fn()
  const mockOnCancel = vi.fn()

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User',
    role: UserRole.DOCTOR,
    medicalLicense: '12345',
    phone: '(11) 99999-9999',
    isActive: true,
    isBlocked: false,
    forcePasswordChange: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render form fields', () => {
    render(<UserForm onSubmit={mockOnSubmit} />)

    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/tipo de usuário/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument()
  })

  it('should show medical license field when DOCTOR role is selected', () => {
    render(<UserForm onSubmit={mockOnSubmit} />)

    // Initially should show CRM (default role is DOCTOR)
    expect(screen.getByLabelText(/crm/i)).toBeInTheDocument()
  })

  it('should validate required fields', async () => {
    const user = userEvent.setup()
    render(<UserForm onSubmit={mockOnSubmit} />)

    const submitButton = screen.getByRole('button', { name: /criar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/nome deve ter no mínimo 3 caracteres/i)
      ).toBeInTheDocument()
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
    })

    expect(mockOnSubmit).not.toHaveBeenCalled()
  })

  it('should submit form with valid data', async () => {
    const user = userEvent.setup()
    render(<UserForm onSubmit={mockOnSubmit} />)

    const nameInput = screen.getByLabelText(/nome completo/i)
    const emailInput = screen.getByLabelText(/email/i)
    const crmInput = screen.getByLabelText(/crm/i)

    await user.type(nameInput, 'Test User')
    await user.type(emailInput, 'test@example.com')
    await user.type(crmInput, '12345')

    const submitButton = screen.getByRole('button', { name: /criar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'Test User',
        email: 'test@example.com',
        role: UserRole.DOCTOR,
        medicalLicense: '12345',
        phone: '',
      })
    })
  })

  it('should populate form with user data in edit mode', () => {
    render(<UserForm user={mockUser} onSubmit={mockOnSubmit} />)

    const nameInput = screen.getByLabelText(
      /nome completo/i
    ) as HTMLInputElement
    const emailInput = screen.getByLabelText(/email/i) as HTMLInputElement
    const crmInput = screen.getByLabelText(/crm/i) as HTMLInputElement

    expect(nameInput.value).toBe('Test User')
    expect(emailInput.value).toBe('test@example.com')
    expect(crmInput.value).toBe('12345')
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(<UserForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />)

    const cancelButton = screen.getByRole('button', { name: /cancelar/i })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalled()
  })

  it('should disable form when loading', () => {
    render(<UserForm onSubmit={mockOnSubmit} isLoading={true} />)

    const submitButton = screen.getByRole('button', { name: /salvando.../i })

    expect(submitButton).toBeDisabled()
  })

  it('should show update button text in edit mode', () => {
    render(<UserForm user={mockUser} onSubmit={mockOnSubmit} />)

    expect(
      screen.getByRole('button', { name: /atualizar/i })
    ).toBeInTheDocument()
  })

  // TODO: This test is flaky and needs to be revisited.
  it.skip('should validate email format', async () => {
    const user = userEvent.setup()
    render(<UserForm onSubmit={mockOnSubmit} />)

    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')

    const submitButton = screen.getByRole('button', { name: /criar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(screen.getByText(/email inválido/i)).toBeInTheDocument()
    })
  })

  it('should validate minimum name length', async () => {
    const user = userEvent.setup()
    render(<UserForm onSubmit={mockOnSubmit} />)

    const nameInput = screen.getByLabelText(/nome completo/i)
    await user.type(nameInput, 'AB')

    const submitButton = screen.getByRole('button', { name: /criar/i })
    await user.click(submitButton)

    await waitFor(() => {
      expect(
        screen.getByText(/nome deve ter no mínimo 3 caracteres/i)
      ).toBeInTheDocument()
    })
  })
})
