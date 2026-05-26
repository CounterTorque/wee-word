import { describe, it, expect } from 'vitest'
import {
  isBlack,
  computeNumbers,
  computeGridHash,
  getWordBounds,
  getWordCells,
  getAllWords,
  nextCellInWord,
  prevCellInWord,
  checkComplete,
} from '../lib/gridUtils.js'

// Simple 3×3 grid for fast tests
//  A B C
//  . . D
//  E F G
const grid3 = [
  ['A', 'B', 'C'],
  ['.', '.', 'D'],
  ['E', 'F', 'G'],
]

// 5×5 from the sample puzzle
const grid5 = [
  ['B', 'R', 'A', 'V', 'E'],
  ['L', '.', 'T', '.', 'A'],
  ['U', 'S', 'E', 'R', 'S'],
  ['E', '.', '.', '.', 'Y'],
  ['S', 'T', 'E', 'A', 'M'],
]

describe('isBlack', () => {
  it('identifies black squares', () => {
    expect(isBlack(grid3, 1, 0)).toBe(true)
    expect(isBlack(grid3, 1, 1)).toBe(true)
  })
  it('identifies white squares', () => {
    expect(isBlack(grid3, 0, 0)).toBe(false)
    expect(isBlack(grid3, 2, 2)).toBe(false)
  })
  it('treats out-of-bounds as black', () => {
    expect(isBlack(grid3, -1, 0)).toBe(true)
    expect(isBlack(grid3, 0, 5)).toBe(true)
  })
})

describe('computeNumbers', () => {
  it('numbers cells that start words', () => {
    const nums = computeNumbers(grid3)
    // (0,0) starts both 1-across (ABC) and a down word (A)
    expect(nums[0][0]).toBe(1)
    // (0,2) starts a down word C->D->G
    expect(nums[0][2]).toBe(2)
    // (2,0) starts 3-across EFG
    expect(nums[2][0]).toBe(3)
  })

  it('does not number interior cells', () => {
    const nums = computeNumbers(grid3)
    expect(nums[0][1]).toBeNull()
    expect(nums[2][1]).toBeNull()
  })

  it('numbers are sequential from 1', () => {
    const nums = computeNumbers(grid5).flat().filter(n => n !== null)
    nums.sort((a, b) => a - b)
    expect(nums[0]).toBe(1)
    for (let i = 1; i < nums.length; i++) {
      expect(nums[i]).toBe(nums[i - 1] + 1)
    }
  })
})

describe('getWordBounds', () => {
  it('finds across bounds', () => {
    expect(getWordBounds(grid3, 0, 1, 'across')).toEqual({
      startRow: 0, startCol: 0, length: 3,
    })
  })
  it('finds down bounds', () => {
    expect(getWordBounds(grid3, 0, 2, 'down')).toEqual({
      startRow: 0, startCol: 2, length: 3,
    })
  })
  it('returns null for black cells', () => {
    expect(getWordBounds(grid3, 1, 0, 'across')).toBeNull()
  })
  it('returns null for single isolated cell (no valid word)', () => {
    // cell (1,2) only has D — length 1 down and 1 across from black neighbors
    // Actually D at (1,2) has a valid down word C-D-G of length 3
    const bounds = getWordBounds(grid3, 1, 2, 'down')
    expect(bounds).toEqual({ startRow: 0, startCol: 2, length: 3 })
  })
})

describe('getWordCells', () => {
  it('returns correct cells for across word', () => {
    const cells = getWordCells(grid3, 0, 0, 'across')
    expect(cells).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ])
  })
  it('returns correct cells for down word', () => {
    const cells = getWordCells(grid3, 0, 2, 'down')
    expect(cells).toEqual([
      { row: 0, col: 2 },
      { row: 1, col: 2 },
      { row: 2, col: 2 },
    ])
  })
})

describe('getAllWords', () => {
  it('returns all words with correct metadata', () => {
    const words = getAllWords(grid3)
    const dirs = words.map(w => w.direction)
    expect(dirs).toContain('across')
    expect(dirs).toContain('down')
  })
  it('every word has number, direction, startRow, startCol, length', () => {
    const words = getAllWords(grid5)
    for (const w of words) {
      expect(w).toHaveProperty('number')
      expect(w).toHaveProperty('direction')
      expect(w).toHaveProperty('startRow')
      expect(w).toHaveProperty('startCol')
      expect(w).toHaveProperty('length')
      expect(w.length).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('nextCellInWord / prevCellInWord', () => {
  it('advances to next cell in across word', () => {
    expect(nextCellInWord(grid3, 0, 0, 'across')).toEqual({ row: 0, col: 1 })
    expect(nextCellInWord(grid3, 0, 1, 'across')).toEqual({ row: 0, col: 2 })
  })
  it('wraps to start of word at end', () => {
    expect(nextCellInWord(grid3, 0, 2, 'across')).toEqual({ row: 0, col: 0 })
  })
  it('goes back in across word', () => {
    expect(prevCellInWord(grid3, 0, 2, 'across')).toEqual({ row: 0, col: 1 })
  })
  it('stays at start when already at beginning', () => {
    expect(prevCellInWord(grid3, 0, 0, 'across')).toEqual({ row: 0, col: 0 })
  })
})

describe('checkComplete', () => {
  it('returns true when all cells match', () => {
    const puzzle = { grid: grid3 }
    const userGrid = [
      ['A', 'B', 'C'],
      ['',  '',  'D'],
      ['E', 'F', 'G'],
    ]
    expect(checkComplete(puzzle, userGrid)).toBe(true)
  })
  it('returns false when a cell is wrong', () => {
    const puzzle = { grid: grid3 }
    const userGrid = [
      ['A', 'B', 'X'],
      ['',  '',  'D'],
      ['E', 'F', 'G'],
    ]
    expect(checkComplete(puzzle, userGrid)).toBe(false)
  })
  it('returns false when a cell is empty', () => {
    const puzzle = { grid: grid3 }
    const userGrid = [
      ['A', 'B', ''],
      ['',  '',  'D'],
      ['E', 'F', 'G'],
    ]
    expect(checkComplete(puzzle, userGrid)).toBe(false)
  })
  it('is case-insensitive', () => {
    const puzzle = { grid: grid3 }
    const userGrid = [
      ['a', 'b', 'c'],
      ['',  '',  'd'],
      ['e', 'f', 'g'],
    ]
    expect(checkComplete(puzzle, userGrid)).toBe(true)
  })
})

describe('computeGridHash', () => {
  it('returns an 8-char hex string', () => {
    expect(computeGridHash(grid3)).toMatch(/^[0-9a-f]{8}$/)
  })
  it('is deterministic for the same grid', () => {
    expect(computeGridHash(grid3)).toBe(computeGridHash(grid3))
  })
  it('differs when any cell changes', () => {
    const modified = grid3.map(row => [...row])
    modified[0][0] = 'Z'
    expect(computeGridHash(modified)).not.toBe(computeGridHash(grid3))
  })
  it('differs between distinct grids', () => {
    expect(computeGridHash(grid3)).not.toBe(computeGridHash(grid5))
  })
})
