import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { todayString, expectedSize, dateFromUrl } from '../lib/puzzleLoader.js'

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

describe('dateFromUrl', () => {
  const originalLocation = global.window?.location

  function setSearch(search) {
    delete global.window
    global.window = { location: { search } }
  }

  afterEach(() => {
    delete global.window
    if (originalLocation !== undefined) {
      global.window = { location: originalLocation }
    }
  })

  it('returns null when no date param', () => {
    setSearch('')
    expect(dateFromUrl()).toBeNull()
  })

  it('converts MM-DD-YYYY to YYYY-MM-DD', () => {
    setSearch('?date=05-26-2026')
    expect(dateFromUrl()).toBe('2026-05-26')
  })

  it('returns null for wrong format (ISO date)', () => {
    setSearch('?date=2026-05-26')
    expect(dateFromUrl()).toBeNull()
  })

  it('returns null for invalid day (Feb 31)', () => {
    setSearch('?date=02-31-2026')
    expect(dateFromUrl()).toBeNull()
  })

  it('returns null for garbage input', () => {
    setSearch('?date=notadate')
    expect(dateFromUrl()).toBeNull()
  })

  it('handles other query params alongside date', () => {
    setSearch('?foo=bar&date=12-25-2026&baz=1')
    expect(dateFromUrl()).toBe('2026-12-25')
  })
})
