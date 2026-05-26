import { writable, get } from 'svelte/store'
import {
  computeNumbers,
  getAllWords,
  getWordCells,
  getWordBounds,
  nextCellInWord,
  prevCellInWord,
  nextEmptyInWord,
  checkComplete,
  computeGridHash,
  isBlack,
} from '../lib/gridUtils.js'
import { saveProgress, loadProgress, clearProgress, recordCompletion } from '../lib/storage.js'

function createGameStore() {
  const initial = {
    puzzle: null,
    size: 5,
    gridHash: null,
    userGrid: [],
    numbers: [],
    words: [],
    selectedRow: null,
    selectedCol: null,
    direction: 'across',
    checkedCells: {},   // "r,c" -> true
    revealedCells: {},  // "r,c" -> true
    isComplete: false,
    timerSeconds: 0,
    timerStarted: false,
    streak: null,
  }

  const { subscribe, set, update } = writable(initial)

  let timerInterval = null

  function startTimer() {
    update(s => {
      if (s.timerStarted) return s
      return { ...s, timerStarted: true }
    })
    timerInterval = setInterval(() => {
      update(s => {
        if (s.isComplete) return s
        return { ...s, timerSeconds: s.timerSeconds + 1 }
      })
    }, 1000)
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval)
      timerInterval = null
    }
  }

  function cellKey(r, c) { return `${r},${c}` }

  function emptyGrid(size) {
    return Array.from({ length: size }, () => Array(size).fill(''))
  }

  function loadPuzzle(puzzle, savedProgress = null) {
    stopTimer()
    const size = puzzle.size
    const grid = puzzle.grid
    const gridHash = computeGridHash(grid)
    const numbers = computeNumbers(grid)
    const words = getAllWords(grid)
    const userGrid = savedProgress || emptyGrid(size)

    // find first non-black cell
    let firstRow = 0, firstCol = 0
    outer: for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!isBlack(grid, r, c)) { firstRow = r; firstCol = c; break outer }
      }
    }

    set({
      ...initial,
      puzzle,
      size,
      gridHash,
      userGrid,
      numbers,
      words,
      selectedRow: firstRow,
      selectedCol: firstCol,
      direction: 'across',
    })
  }

  function selectCell(r, c) {
    update(s => {
      if (isBlack(s.puzzle.grid, r, c)) return s
      if (!s.timerStarted) startTimer()

      if (s.selectedRow === r && s.selectedCol === c) {
        // clicking the active cell toggles direction
        const newDir = s.direction === 'across' ? 'down' : 'across'
        // only switch if there's a valid word in that direction
        const bounds = getWordBounds(s.puzzle.grid, r, c, newDir)
        if (bounds) return { ...s, direction: newDir }
        return s
      }

      // prefer keeping current direction if valid, else try the other
      let dir = s.direction
      const bounds = getWordBounds(s.puzzle.grid, r, c, dir)
      if (!bounds) dir = dir === 'across' ? 'down' : 'across'

      return { ...s, selectedRow: r, selectedCol: c, direction: dir }
    })
  }

  function enterLetter(letter) {
    update(s => {
      if (s.selectedRow === null || s.isComplete) return s
      if (!s.timerStarted) startTimer()

      const r = s.selectedRow
      const c = s.selectedCol
      const newUserGrid = s.userGrid.map(row => [...row])
      // don't overwrite revealed cells
      if (!s.revealedCells[cellKey(r, c)]) {
        newUserGrid[r][c] = letter.toUpperCase()
      }

      // clear check flag when letter changes
      const newChecked = { ...s.checkedCells }
      delete newChecked[cellKey(r, c)]

      // advance to next empty cell in word; stay put if the word is now full
      let nextR = r, nextC = c
      const nextEmpty = nextEmptyInWord(s.puzzle.grid, newUserGrid, r, c, s.direction)
      if (nextEmpty) {
        nextR = nextEmpty.row; nextC = nextEmpty.col
      }

      const complete = checkComplete(s.puzzle, newUserGrid)
      if (complete) stopTimer()

      saveProgress(s.puzzle.date, newUserGrid, s.gridHash)

      let streak = s.streak
      if (complete && !s.isComplete) {
        clearProgress(s.puzzle.date)
        streak = recordCompletion(s.puzzle.date)
      }

      return {
        ...s,
        userGrid: newUserGrid,
        checkedCells: newChecked,
        selectedRow: nextR,
        selectedCol: nextC,
        isComplete: complete,
        streak,
      }
    })
  }

  function deleteLetter() {
    update(s => {
      if (s.selectedRow === null) return s
      const r = s.selectedRow
      const c = s.selectedCol
      const newUserGrid = s.userGrid.map(row => [...row])

      if (newUserGrid[r][c] && !s.revealedCells[cellKey(r, c)]) {
        newUserGrid[r][c] = ''
        saveProgress(s.puzzle.date, newUserGrid, s.gridHash)
        return { ...s, userGrid: newUserGrid }
      }

      // cell already empty — move back
      const prev = prevCellInWord(s.puzzle.grid, r, c, s.direction)
      if (prev.row === r && prev.col === c) return s

      const newChecked = { ...s.checkedCells }
      delete newChecked[cellKey(prev.row, prev.col)]
      if (!s.revealedCells[cellKey(prev.row, prev.col)]) {
        newUserGrid[prev.row][prev.col] = ''
      }
      saveProgress(s.puzzle.date, newUserGrid, s.gridHash)
      return {
        ...s,
        userGrid: newUserGrid,
        checkedCells: newChecked,
        selectedRow: prev.row,
        selectedCol: prev.col,
      }
    })
  }

  function moveSelection(dRow, dCol) {
    update(s => {
      if (s.selectedRow === null) return s
      const newR = s.selectedRow + dRow
      const newC = s.selectedCol + dCol
      const size = s.size
      if (newR < 0 || newR >= size || newC < 0 || newC >= size) return s
      if (isBlack(s.puzzle.grid, newR, newC)) return s

      const dir = dRow !== 0 ? 'down' : 'across'
      return { ...s, selectedRow: newR, selectedCol: newC, direction: dir }
    })
  }

  function jumpToNextWord() {
    update(s => {
      if (!s.words.length) return s
      const currentWord = s.words.find(w =>
        w.direction === s.direction &&
        getWordCells(s.puzzle.grid, s.selectedRow, s.selectedCol, s.direction)
          .some(cell => cell.row === w.startRow && cell.col === w.startCol &&
            w.startRow === cell.row && w.startCol === cell.col)
      )
      // find first word that has at least one empty cell, starting after current
      const currentIdx = currentWord ? s.words.indexOf(currentWord) : -1
      const ordered = [
        ...s.words.slice(currentIdx + 1),
        ...s.words.slice(0, currentIdx + 1),
      ]
      const next = ordered.find(w => {
        const cells = getWordCells(s.puzzle.grid, w.startRow, w.startCol, w.direction)
        return cells.some(cell => !s.userGrid[cell.row][cell.col])
      }) || ordered[0]

      if (!next) return s
      // find first empty cell in that word
      const cells = getWordCells(s.puzzle.grid, next.startRow, next.startCol, next.direction)
      const firstEmpty = cells.find(cell => !s.userGrid[cell.row][cell.col]) || cells[0]
      return {
        ...s,
        selectedRow: firstEmpty.row,
        selectedCol: firstEmpty.col,
        direction: next.direction,
      }
    })
  }

  function jumpToWord(number, direction) {
    update(s => {
      const word = s.words.find(w => w.number === number && w.direction === direction)
      if (!word) return s
      if (!s.timerStarted) startTimer()
      const cells = getWordCells(s.puzzle.grid, word.startRow, word.startCol, direction)
      const firstEmpty = cells.find(c => !s.userGrid[c.row][c.col]) || cells[0]
      return {
        ...s,
        selectedRow: firstEmpty.row,
        selectedCol: firstEmpty.col,
        direction,
      }
    })
  }

  // --- Check / Reveal ---

  function checkLetter() {
    update(s => {
      const r = s.selectedRow; const c = s.selectedCol
      if (r === null) return s
      const correct = s.puzzle.grid[r][c].toUpperCase()
      const entered = (s.userGrid[r][c] || '').toUpperCase()
      if (!entered) return s
      const newChecked = { ...s.checkedCells }
      if (entered !== correct) newChecked[cellKey(r, c)] = true
      else delete newChecked[cellKey(r, c)]
      return { ...s, checkedCells: newChecked }
    })
  }

  function checkWord() {
    update(s => {
      if (s.selectedRow === null) return s
      const cells = getWordCells(s.puzzle.grid, s.selectedRow, s.selectedCol, s.direction)
      const newChecked = { ...s.checkedCells }
      for (const { row, col } of cells) {
        const correct = s.puzzle.grid[row][col].toUpperCase()
        const entered = (s.userGrid[row][col] || '').toUpperCase()
        if (!entered) continue
        if (entered !== correct) newChecked[cellKey(row, col)] = true
        else delete newChecked[cellKey(row, col)]
      }
      return { ...s, checkedCells: newChecked }
    })
  }

  function checkPuzzle() {
    update(s => {
      const newChecked = {}
      const grid = s.puzzle.grid
      for (let r = 0; r < s.size; r++) {
        for (let c = 0; c < s.size; c++) {
          if (isBlack(grid, r, c)) continue
          const correct = grid[r][c].toUpperCase()
          const entered = (s.userGrid[r][c] || '').toUpperCase()
          if (!entered) continue
          if (entered !== correct) newChecked[cellKey(r, c)] = true
        }
      }
      return { ...s, checkedCells: newChecked }
    })
  }

  function revealLetter() {
    update(s => {
      const r = s.selectedRow; const c = s.selectedCol
      if (r === null) return s
      const newUserGrid = s.userGrid.map(row => [...row])
      newUserGrid[r][c] = s.puzzle.grid[r][c].toUpperCase()
      const newRevealed = { ...s.revealedCells, [cellKey(r, c)]: true }
      const newChecked = { ...s.checkedCells }
      delete newChecked[cellKey(r, c)]
      const complete = checkComplete(s.puzzle, newUserGrid)
      if (complete) stopTimer()
      saveProgress(s.puzzle.date, newUserGrid, s.gridHash)
      return { ...s, userGrid: newUserGrid, revealedCells: newRevealed, checkedCells: newChecked, isComplete: complete }
    })
  }

  function revealWord() {
    update(s => {
      if (s.selectedRow === null) return s
      const cells = getWordCells(s.puzzle.grid, s.selectedRow, s.selectedCol, s.direction)
      const newUserGrid = s.userGrid.map(row => [...row])
      const newRevealed = { ...s.revealedCells }
      const newChecked = { ...s.checkedCells }
      for (const { row, col } of cells) {
        newUserGrid[row][col] = s.puzzle.grid[row][col].toUpperCase()
        newRevealed[cellKey(row, col)] = true
        delete newChecked[cellKey(row, col)]
      }
      const complete = checkComplete(s.puzzle, newUserGrid)
      if (complete) stopTimer()
      saveProgress(s.puzzle.date, newUserGrid, s.gridHash)
      return { ...s, userGrid: newUserGrid, revealedCells: newRevealed, checkedCells: newChecked, isComplete: complete }
    })
  }

  function revealPuzzle() {
    update(s => {
      const newUserGrid = s.puzzle.grid.map(row => row.map(c => c === '.' ? '' : c.toUpperCase()))
      const newRevealed = {}
      const grid = s.puzzle.grid
      for (let r = 0; r < s.size; r++) {
        for (let c = 0; c < s.size; c++) {
          if (!isBlack(grid, r, c)) newRevealed[cellKey(r, c)] = true
        }
      }
      stopTimer()
      saveProgress(s.puzzle.date, newUserGrid, s.gridHash)
      return { ...s, userGrid: newUserGrid, revealedCells: newRevealed, checkedCells: {}, isComplete: true }
    })
  }

  function reset() {
    const s = get({ subscribe })
    if (s.puzzle) loadPuzzle(s.puzzle)
  }

  return {
    subscribe,
    loadPuzzle,
    selectCell,
    enterLetter,
    deleteLetter,
    moveSelection,
    jumpToNextWord,
    jumpToWord,
    checkLetter,
    checkWord,
    checkPuzzle,
    revealLetter,
    revealWord,
    revealPuzzle,
    reset,
  }
}

export const game = createGameStore()
