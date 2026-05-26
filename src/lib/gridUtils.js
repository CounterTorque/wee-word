/** Returns true if the cell at (r,c) is a black square. */
export function isBlack(grid, r, c) {
  return !grid[r] || grid[r][c] === '.' || grid[r][c] === undefined
}

/**
 * Returns a 2D array of cell numbers (null = no number, N = clue number).
 * A cell is numbered when it begins an across word, a down word, or both.
 * A word start requires: cell is white AND (at grid edge or previous cell in
 * direction is black) AND there are at least 2 more white cells following.
 */
export function computeNumbers(grid) {
  const size = grid.length
  const nums = Array.from({ length: size }, () => Array(size).fill(null))
  let n = 1

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isBlack(grid, r, c)) continue

      const startsAcross =
        (c === 0 || isBlack(grid, r, c - 1)) &&
        c + 1 < size && !isBlack(grid, r, c + 1)

      const startsDown =
        (r === 0 || isBlack(grid, r - 1, c)) &&
        r + 1 < size && !isBlack(grid, r + 1, c)

      if (startsAcross || startsDown) {
        nums[r][c] = n++
      }
    }
  }
  return nums
}

/**
 * Returns the start cell and length of the word containing (r,c) in `dir`.
 * Returns null if the cell is black or not part of a valid word (length < 2).
 */
export function getWordBounds(grid, r, c, dir) {
  if (isBlack(grid, r, c)) return null

  if (dir === 'across') {
    let start = c
    while (start > 0 && !isBlack(grid, r, start - 1)) start--
    let end = c
    while (end < grid[r].length - 1 && !isBlack(grid, r, end + 1)) end++
    if (end - start < 1) return null
    return { startRow: r, startCol: start, length: end - start + 1 }
  } else {
    let start = r
    while (start > 0 && !isBlack(grid, start - 1, c)) start--
    let end = r
    while (end < grid.length - 1 && !isBlack(grid, end + 1, c)) end++
    if (end - start < 1) return null
    return { startRow: start, startCol: c, length: end - start + 1 }
  }
}

/** Returns all {row, col} cells that make up the word containing (r,c) in dir. */
export function getWordCells(grid, r, c, dir) {
  const bounds = getWordBounds(grid, r, c, dir)
  if (!bounds) return []
  const cells = []
  for (let i = 0; i < bounds.length; i++) {
    cells.push(
      dir === 'across'
        ? { row: bounds.startRow, col: bounds.startCol + i }
        : { row: bounds.startRow + i, col: bounds.startCol }
    )
  }
  return cells
}

/**
 * Returns all words in the grid as an array of
 * { number, direction, startRow, startCol, length }.
 */
export function getAllWords(grid) {
  const nums = computeNumbers(grid)
  const size = grid.length
  const words = []

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (isBlack(grid, r, c) || nums[r][c] === null) continue
      const n = nums[r][c]

      const across = getWordBounds(grid, r, c, 'across')
      if (across && (c === 0 || isBlack(grid, r, c - 1))) {
        words.push({ number: n, direction: 'across', ...across })
      }

      const down = getWordBounds(grid, r, c, 'down')
      if (down && (r === 0 || isBlack(grid, r - 1, c))) {
        words.push({ number: n, direction: 'down', ...down })
      }
    }
  }

  return words
}

/**
 * Finds the word object matching a clue number + direction.
 * Returns undefined if not found.
 */
export function findWord(words, number, direction) {
  return words.find(w => w.number === number && w.direction === direction)
}

/** Next cell in direction within the word; wraps at word end. */
export function nextCellInWord(grid, r, c, dir) {
  const bounds = getWordBounds(grid, r, c, dir)
  if (!bounds) return { row: r, col: c }

  if (dir === 'across') {
    const nextCol = c + 1
    if (nextCol <= bounds.startCol + bounds.length - 1) return { row: r, col: nextCol }
    return { row: bounds.startRow, col: bounds.startCol }
  } else {
    const nextRow = r + 1
    if (nextRow <= bounds.startRow + bounds.length - 1) return { row: nextRow, col: c }
    return { row: bounds.startRow, col: bounds.startCol }
  }
}

/** Previous cell in direction within the word; stops at word start. */
export function prevCellInWord(grid, r, c, dir) {
  const bounds = getWordBounds(grid, r, c, dir)
  if (!bounds) return { row: r, col: c }

  if (dir === 'across') {
    const prevCol = c - 1
    if (prevCol >= bounds.startCol) return { row: r, col: prevCol }
    return { row: r, col: bounds.startCol }
  } else {
    const prevRow = r - 1
    if (prevRow >= bounds.startRow) return { row: prevRow, col: c }
    return { row: bounds.startRow, col: bounds.startCol }
  }
}

/**
 * Advance to the next empty cell in the current word.
 * If the word is full, stays at current cell (caller can then advance to next word).
 */
export function nextEmptyInWord(grid, userGrid, r, c, dir) {
  const cells = getWordCells(grid, r, c, dir)
  const afterCurrent = cells.findIndex(cell => cell.row === r && cell.col === c)
  for (let i = afterCurrent + 1; i < cells.length; i++) {
    if (!userGrid[cells[i].row][cells[i].col]) return cells[i]
  }
  return null
}

/**
 * djb2 hash of the grid content. Used to detect puzzle changes so stale
 * localStorage progress can be discarded automatically.
 */
export function computeGridHash(grid) {
  const str = JSON.stringify(grid)
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i)
    h = h >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

/**
 * Returns true when every non-black cell has a matching letter.
 */
export function checkComplete(puzzle, userGrid) {
  const grid = puzzle.grid
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (isBlack(grid, r, c)) continue
      if ((userGrid[r][c] || '').toUpperCase() !== grid[r][c].toUpperCase()) return false
    }
  }
  return true
}
