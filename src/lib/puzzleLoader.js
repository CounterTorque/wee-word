/**
 * Loads the puzzle JSON for a given date string (YYYY-MM-DD).
 * Puzzles are stored in /puzzles/<date>.json, served as static assets.
 */
export async function loadPuzzle(date) {
  const base = import.meta.env.BASE_URL
  const url = `${base}puzzles/${date}.json`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`No puzzle found for ${date}`)
  const puzzle = await res.json()
  validatePuzzle(puzzle)
  return puzzle
}

/** Returns today's date as YYYY-MM-DD in local time. */
export function todayString() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** Expected grid size for a given ISO date string (weekday=5, weekend=6). */
export function expectedSize(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const dow = d.getDay() // 0=Sun, 6=Sat
  return dow === 0 || dow === 6 ? 6 : 5
}

function validatePuzzle(puzzle) {
  if (!puzzle.date) throw new Error('Puzzle missing date field')
  if (!puzzle.size || (puzzle.size !== 5 && puzzle.size !== 6)) {
    throw new Error(`Invalid puzzle size: ${puzzle.size}`)
  }
  if (!Array.isArray(puzzle.grid) || puzzle.grid.length !== puzzle.size) {
    throw new Error(`Grid height mismatch: expected ${puzzle.size}`)
  }
  for (const row of puzzle.grid) {
    if (!Array.isArray(row) || row.length !== puzzle.size) {
      throw new Error(`Grid width mismatch: expected ${puzzle.size}`)
    }
  }
  if (!puzzle.clues?.across || !puzzle.clues?.down) {
    throw new Error('Puzzle missing clues')
  }
}
