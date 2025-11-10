import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { UserList } from '@/components/users/UserList'
import { User, UserRole } from '@/types'

describe('UserList', () => {
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'admin@test.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      isActive: true,
      isBlocked: false,
      forcePasswordChange: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '2',
      email: 'doctor@test.com',
      name: 'Doctor User',
      role: UserRole.DOCTOR,
      medicalLicense: '12345',
      phone: '(11) 99999-9999',
      isActive: true, // Active but blocked
      isBlocked: true,
      forcePasswordChange: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: '3',
      email: 'inactive@test.com',
      name: 'Inactive User',
      role: UserRole.DOCTOR,
      medicalLicense: '67890',
      phone: '(22) 88888-8888',
      isActive: false, // Inactive but not blocked
      isBlocked: false,
      forcePasswordChange: false,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ]

  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()

  it('should render users table', () => {
    render(
      <UserList users={mockUsers} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    )

    expect(screen.getByText('Admin User')).toBeInTheDocument()
    expect(screen.getByText('admin@test.com')).toBeInTheDocument()
    expect(screen.getByText('Doctor User')).toBeInTheDocument()
    expect(screen.getByText('doctor@test.com')).toBeInTheDocument()
  })

  it('should display user roles correctly', () => {
    render(
      <UserList users={mockUsers} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    )

    expect(screen.getByText('Administrador')).toBeInTheDocument()
    expect(screen.getAllByText('Médico').length).toBeGreaterThan(0)
  })

  it('should display CRM for doctors', () => {
    render(
      <UserList users={mockUsers} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    )

    expect(screen.getByText('12345')).toBeInTheDocument()
  })

  it('should display status badges', () => {
    render(
      <UserList users={mockUsers} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    )

    expect(screen.getByText('Ativo')).toBeInTheDocument()
    expect(screen.getByText('Inativo')).toBeInTheDocument()
    expect(screen.getByText('Bloqueado')).toBeInTheDocument()
  })

  it('should call onEdit when edit button is clicked', () => {
    render(
      <UserList users={mockUsers} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    )

    const editButtons = screen.getAllByTitle('Editar usuário')
    fireEvent.click(editButtons[0])

    expect(mockOnEdit).toHaveBeenCalledWith(mockUsers[0])
  })

  it('should call onDelete when delete button is clicked', () => {
    render(
      <UserList users={mockUsers} onEdit={mockOnEdit} onDelete={mockOnDelete} />
    )

    const deleteButtons = screen.getAllByTitle('Remover usuário')
    fireEvent.click(deleteButtons[0])

    expect(mockOnDelete).toHaveBeenCalledWith('1')
  })

  it('should render empty state when no users', () => {
    render(<UserList users={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} />)

    expect(screen.getByText('Nenhum usuário encontrado')).toBeInTheDocument()
  })
})
