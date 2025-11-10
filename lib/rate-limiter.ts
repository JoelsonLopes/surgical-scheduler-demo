/**
 * Simple in-memory rate limiter for API protection
 * For production, consider using Redis or a dedicated rate limiting service
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

class RateLimiter {
  private requests: Map<string, RateLimitEntry> = new Map()
  private cleanupInterval: NodeJS.Timeout | null = null

  constructor() {
    // Cleanup old entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup()
      },
      5 * 60 * 1000
    )
  }

  /**
   * Check if request should be rate limited
   * @param key - Unique identifier (e.g., user ID or IP address)
   * @param maxRequests - Maximum number of requests allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if rate limit exceeded, false otherwise
   */
  isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const entry = this.requests.get(key)

    if (!entry || now > entry.resetTime) {
      // First request or window expired - reset
      this.requests.set(key, {
        count: 1,
        resetTime: now + windowMs,
      })
      return false
    }

    if (entry.count >= maxRequests) {
      // Rate limit exceeded
      return true
    }

    // Increment count
    entry.count++
    this.requests.set(key, entry)
    return false
  }

  /**
   * Get remaining time until rate limit reset
   * @param key - Unique identifier
   * @returns milliseconds until reset, or 0 if not rate limited
   */
  getResetTime(key: string): number {
    const entry = this.requests.get(key)
    if (!entry) return 0

    const now = Date.now()
    const remaining = entry.resetTime - now
    return remaining > 0 ? remaining : 0
  }

  /**
   * Get remaining requests for a key
   * @param key - Unique identifier
   * @param maxRequests - Maximum number of requests allowed
   * @returns number of remaining requests
   */
  getRemainingRequests(key: string, maxRequests: number): number {
    const entry = this.requests.get(key)
    if (!entry) return maxRequests

    const now = Date.now()
    if (now > entry.resetTime) return maxRequests

    return Math.max(0, maxRequests - entry.count)
  }

  /**
   * Reset rate limit for a specific key
   * @param key - Unique identifier
   */
  reset(key: string): void {
    this.requests.delete(key)
  }

  /**
   * Clear all rate limit entries
   */
  clear(): void {
    this.requests.clear()
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    for (const [key, entry] of this.requests.entries()) {
      if (now > entry.resetTime) {
        this.requests.delete(key)
      }
    }
  }

  /**
   * Cleanup on destroy
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval)
      this.cleanupInterval = null
    }
    this.clear()
  }
}

// Singleton instance
const rateLimiter = new RateLimiter()

export { rateLimiter }

/**
 * Rate limit configurations for different operations
 */
export const RateLimitConfig = {
  // User management operations
  createUser: { maxRequests: 10, windowMs: 60 * 1000 }, // 10 requests per minute
  updateUser: { maxRequests: 20, windowMs: 60 * 1000 }, // 20 requests per minute
  deleteUser: { maxRequests: 5, windowMs: 60 * 1000 }, // 5 requests per minute

  // Authentication operations
  login: { maxRequests: 5, windowMs: 15 * 60 * 1000 }, // 5 attempts per 15 minutes
  resetPassword: { maxRequests: 3, windowMs: 60 * 60 * 1000 }, // 3 attempts per hour

  // General API operations
  apiGeneral: { maxRequests: 100, windowMs: 60 * 1000 }, // 100 requests per minute
} as const
