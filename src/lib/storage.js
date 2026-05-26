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
  const today = date
  const yesterday = offsetDate(today, -1)

  const newCount = streak.lastDate === yesterday ? streak.count + 1 : 1
  const newBest = Math.max(streak.bestStreak, newCount)

  const updated = { count: newCount, bestStreak: newBest, lastDate: today }
  localStorage.setItem(STREAK_KEY, JSON.stringify(updated))
  return updated
}

export function hasCompletedToday(date) {
  const streak = loadStreak()
  return streak.lastDate === date
}

export function saveProgress(date, userGrid) {
  try {
    localStorage.setItem(progressKey(date), JSON.stringify(userGrid))
  } catch {
    // storage full — silently ignore
  }
}

export function loadProgress(date) {
  try {
    const raw = localStorage.getItem(progressKey(date))
    return raw ? JSON.parse(raw) : null
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
