import { describe, it, expect } from 'vitest'

describe('Example Test Suite', () => {
  it('should perform basic arithmetic', () => {
    expect(1 + 1).toBe(2)
  })

  it('should handle string operations', () => {
    const greeting = 'Hello, World!'
    expect(greeting).toContain('World')
    expect(greeting.length).toBeGreaterThan(0)
  })

  it('should work with arrays', () => {
    const numbers = [1, 2, 3, 4, 5]
    expect(numbers).toHaveLength(5)
    expect(numbers).toContain(3)
    expect(numbers[0]).toBe(1)
  })

  it('should validate objects', () => {
    const user = {
      name: 'João Silva',
      email: 'joao@example.com',
      active: true,
    }

    expect(user).toHaveProperty('name')
    expect(user.email).toMatch(/@/)
    expect(user.active).toBe(true)
  })

  it('should handle async operations', async () => {
    const fetchData = async () => {
      return new Promise((resolve) => {
        setTimeout(() => resolve('data'), 100)
      })
    }

    const result = await fetchData()
    expect(result).toBe('data')
  })
})
