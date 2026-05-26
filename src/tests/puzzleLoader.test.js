import { describe, it, expect } from 'vitest'
import { todayString, expectedSize } from '../lib/puzzleLoader.js'

describe('todayString', () => {
  it('returns a string in YYYY-MM-DD format', () => {
    expect(todayString()).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })
})

describe('expectedSize', () => {
  it('returns 5 for Monday', () => {
    expect(expectedSize('2026-05-25')).toBe(5) // Monday
  })
  it('returns 5 for Friday', () => {
    expect(expectedSize('2026-05-29')).toBe(5) // Friday
  })
  it('returns 6 for Saturday', () => {
    expect(expectedSize('2026-05-30')).toBe(6) // Saturday
  })
  it('returns 6 for Sunday', () => {
    expect(expectedSize('2026-05-31')).toBe(6) // Sunday
  })
})
