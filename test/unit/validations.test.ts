import { describe, it, expect } from 'vitest'

// Funções de validação comuns para o projeto
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export const validatePassword = (
  password: string
): {
  isValid: boolean
  errors: string[]
} => {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('A senha deve ter no mínimo 8 caracteres')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra maiúscula')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('A senha deve conter pelo menos uma letra minúscula')
  }

  if (!/[0-9]/.test(password)) {
    errors.push('A senha deve conter pelo menos um número')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/[^\d]/g, '')

  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false

  return true // Simplificado para exemplo
}

describe('Email Validation', () => {
  it('should validate correct email format', () => {
    expect(validateEmail('user@example.com')).toBe(true)
    expect(validateEmail('test.user@domain.co')).toBe(true)
  })

  it('should reject invalid email formats', () => {
    expect(validateEmail('invalid.email')).toBe(false)
    expect(validateEmail('@example.com')).toBe(false)
    expect(validateEmail('user@')).toBe(false)
    expect(validateEmail('user @example.com')).toBe(false)
  })

  it('should handle edge cases', () => {
    expect(validateEmail('')).toBe(false)
    expect(validateEmail('user@domain')).toBe(false)
  })
})

describe('Password Validation', () => {
  it('should validate strong passwords', () => {
    const result = validatePassword('StrongPass123')
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject short passwords', () => {
    const result = validatePassword('Short1')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('A senha deve ter no mínimo 8 caracteres')
  })

  it('should require uppercase letters', () => {
    const result = validatePassword('lowercase123')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain(
      'A senha deve conter pelo menos uma letra maiúscula'
    )
  })

  it('should require lowercase letters', () => {
    const result = validatePassword('UPPERCASE123')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain(
      'A senha deve conter pelo menos uma letra minúscula'
    )
  })

  it('should require numbers', () => {
    const result = validatePassword('NoNumbers')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('A senha deve conter pelo menos um número')
  })

  it('should accumulate multiple errors', () => {
    const result = validatePassword('weak')
    expect(result.isValid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(1)
  })
})

describe('CPF Validation', () => {
  it('should validate CPF with correct length', () => {
    expect(validateCPF('123.456.789-10')).toBe(true)
    expect(validateCPF('12345678910')).toBe(true)
  })

  it('should reject CPF with incorrect length', () => {
    expect(validateCPF('123.456.789')).toBe(false)
    expect(validateCPF('123456789')).toBe(false)
  })

  it('should reject CPF with all equal digits', () => {
    expect(validateCPF('111.111.111-11')).toBe(false)
    expect(validateCPF('00000000000')).toBe(false)
  })

  it('should handle empty and invalid inputs', () => {
    expect(validateCPF('')).toBe(false)
    expect(validateCPF('abc.def.ghi-jk')).toBe(false)
  })
})
