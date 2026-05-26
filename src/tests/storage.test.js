import { describe, it, expect, beforeEach } from 'vitest'
import { loadStreak, recordCompletion, hasCompletedToday, saveProgress, loadProgress, clearProgress } from '../lib/storage.js'

// Minimal localStorage shim for Node environment
const store = {}
global.localStorage = {
  getItem: key => store[key] ?? null,
  setItem: (key, val) => { store[key] = val },
  removeItem: key => { delete store[key] },
}

beforeEach(() => {
  Object.keys(store).forEach(k => delete store[k])
})

describe('loadStreak', () => {
  it('returns zero defaults when nothing stored', () => {
    expect(loadStreak()).toEqual({ count: 0, bestStreak: 0, lastDate: null })
  })
})

describe('recordCompletion', () => {
  it('starts a streak of 1 on first completion', () => {
    const result = recordCompletion('2026-05-26')
    expect(result.count).toBe(1)
    expect(result.bestStreak).toBe(1)
    expect(result.lastDate).toBe('2026-05-26')
  })

  it('increments streak on consecutive day', () => {
    recordCompletion('2026-05-25')
    const result = recordCompletion('2026-05-26')
    expect(result.count).toBe(2)
    expect(result.bestStreak).toBe(2)
  })

  it('resets streak when a day is skipped', () => {
    recordCompletion('2026-05-24')
    const result = recordCompletion('2026-05-26')
    expect(result.count).toBe(1)
  })

  it('tracks best streak across resets', () => {
    recordCompletion('2026-05-24')
    recordCompletion('2026-05-25')
    recordCompletion('2026-05-26') // streak of 3
    recordCompletion('2026-05-28') // resets, streak of 1
    const { bestStreak } = loadStreak()
    expect(bestStreak).toBe(3)
  })
})

describe('hasCompletedToday', () => {
  it('returns false before completion', () => {
    expect(hasCompletedToday('2026-05-26')).toBe(false)
  })
  it('returns true after completion', () => {
    recordCompletion('2026-05-26')
    expect(hasCompletedToday('2026-05-26')).toBe(true)
  })
})

describe('saveProgress / loadProgress / clearProgress', () => {
  const grid = [['A', 'B'], ['C', '']]

  it('round-trips progress', () => {
    saveProgress('2026-05-26', grid)
    expect(loadProgress('2026-05-26')).toEqual(grid)
  })
  it('returns null when nothing saved', () => {
    expect(loadProgress('2026-05-27')).toBeNull()
  })
  it('clearProgress removes saved data', () => {
    saveProgress('2026-05-26', grid)
    clearProgress('2026-05-26')
    expect(loadProgress('2026-05-26')).toBeNull()
  })
})
