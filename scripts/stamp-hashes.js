#!/usr/bin/env node
/**
 * Adds or updates the gridHash field in all puzzle JSON files under
 * public/puzzles/. Safe to re-run — idempotent.
 */
import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve, join } from 'path'

const dir = resolve(process.cwd(), 'public', 'puzzles')

function computeGridHash(grid) {
  const str = JSON.stringify(grid)
  let h = 5381
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) ^ str.charCodeAt(i)
    h = h >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

const files = readdirSync(dir).filter(f => f.endsWith('.json'))
for (const file of files) {
  const path = join(dir, file)
  const puzzle = JSON.parse(readFileSync(path, 'utf8'))
  const hash = computeGridHash(puzzle.grid)
  if (puzzle.gridHash === hash) {
    console.log(`${file}  (unchanged: ${hash})`)
    continue
  }
  puzzle.gridHash = hash
  writeFileSync(path, JSON.stringify(puzzle, null, 2) + '\n')
  console.log(`${file}  ${hash}`)
}
