const STREAK_KEY = 'weeword_streak'
const progressKey = date => `weeword_progress_${date}`

export function loadStreak() {
  try {
    const raw = localStorage.getItem(STREAK_KEY)
    if (!raw) return { count: 0, bestStreak: 0, lastDate: null }
    return JSON.parse(raw)
  } catch {
    return { count: 0, bestStreak: 0, lastDate: null }
  }
}

export function recordCompletion(date) {
  const streak = loadStreak()
  const yesterday = offsetDate(date, -1)
  const newCount = streak.lastDate === yesterday ? streak.count + 1 : 1
  const newBest = Math.max(streak.bestStreak, newCount)
  const updated = { count: newCount, bestStreak: newBest, lastDate: date }
  localStorage.setItem(STREAK_KEY, JSON.stringify(updated))
  return updated
}

export function hasCompletedToday(date) {
  return loadStreak().lastDate === date
}

/**
 * Saves progress along with the current grid hash so we can detect if the
 * puzzle is later changed and the saved letters become invalid.
 */
export function saveProgress(date, userGrid, gridHash) {
  try {
    localStorage.setItem(progressKey(date), JSON.stringify({ userGrid, gridHash }))
  } catch {
    // storage full — silently ignore
  }
}

/**
 * Loads saved progress for `date`. Returns the userGrid array if the stored
 * gridHash matches the current puzzle's hash, otherwise null (stale progress
 * from a changed puzzle is discarded).
 */
export function loadProgress(date, gridHash) {
  try {
    const raw = localStorage.getItem(progressKey(date))
    if (!raw) return null
    const stored = JSON.parse(raw)
    // Legacy format was a bare array — treat as stale
    if (Array.isArray(stored)) return null
    if (stored.gridHash !== gridHash) return null
    return stored.userGrid
  } catch {
    return null
  }
}

export function clearProgress(date) {
  localStorage.removeItem(progressKey(date))
}

/** Returns an ISO date string (YYYY-MM-DD) offset by `days` from `dateStr`. */
function offsetDate(dateStr, days) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}
