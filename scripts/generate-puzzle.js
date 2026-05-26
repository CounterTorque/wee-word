#!/usr/bin/env node
/**
 * Usage: node scripts/generate-puzzle.js --date 2026-06-01 [--theme "summer cookout"] [--size 5]
 * Requires ANTHROPIC_API_KEY in environment.
 */
import Anthropic from '@anthropic-ai/sdk'
import { writeFileSync, existsSync } from 'fs'
import { resolve } from 'path'

const args = parseArgs(process.argv.slice(2))
const date = args.date || todayString()
const size = args.size ? parseInt(args.size) : expectedSize(date)
const theme = args.theme || ''

const outPath = resolve(process.cwd(), 'public', 'puzzles', `${date}.json`)
if (existsSync(outPath) && !args.force) {
  console.error(`Puzzle already exists: ${outPath}  (use --force to overwrite)`)
  process.exit(1)
}

console.log(`Generating ${size}×${size} puzzle for ${date}${theme ? ` (theme: ${theme})` : ''}…`)

const client = new Anthropic()

const SYSTEM = `You are a crossword constructor. You create valid ${size}×${size} mini crossword puzzles.
Rules:
- Grid is ${size}×${size}. Use "." for black squares, uppercase letters for white squares.
- Black squares must be rotationally symmetric (180°).
- Every word must be at least 3 letters long.
- No isolated white cells.
- All words must be real English words.
- Clues should be concise, clever, and appropriate for a general audience.
- Return ONLY valid JSON, no markdown fences.`

const USER = `Create a ${size}×${size} crossword puzzle${theme ? ` with a "${theme}" theme` : ''}.

Return this exact JSON shape:
{
  "date": "${date}",
  "size": ${size},
  "grid": [/* ${size} arrays of ${size} strings */],
  "clues": {
    "across": [{ "number": N, "clue": "..." }],
    "down":   [{ "number": N, "clue": "..." }]
  }
}`

async function generate(attempt = 1) {
  if (attempt > 3) {
    console.error('Failed after 3 attempts.')
    process.exit(1)
  }

  const msg = await client.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 1024,
    system: SYSTEM,
    messages: [{ role: 'user', content: USER }],
  })

  const text = msg.content[0].text.trim()
  let puzzle
  try {
    puzzle = JSON.parse(text)
  } catch {
    console.warn(`Attempt ${attempt}: invalid JSON, retrying…`)
    return generate(attempt + 1)
  }

  const err = validate(puzzle, size, date)
  if (err) {
    console.warn(`Attempt ${attempt}: ${err}, retrying…`)
    return generate(attempt + 1)
  }

  return puzzle
}

function validate(puzzle, size, date) {
  if (!Array.isArray(puzzle.grid)) return 'grid missing'
  if (puzzle.grid.length !== size) return `grid height ${puzzle.grid.length} ≠ ${size}`
  for (const row of puzzle.grid) {
    if (!Array.isArray(row) || row.length !== size) return `row width mismatch`
  }
  if (!puzzle.clues?.across?.length) return 'missing across clues'
  if (!puzzle.clues?.down?.length)   return 'missing down clues'
  if (!checkSymmetry(puzzle.grid, size)) return 'grid not rotationally symmetric'
  return null
}

function checkSymmetry(grid, size) {
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const isBlack = grid[r][c] === '.'
      const mirrorBlack = grid[size - 1 - r][size - 1 - c] === '.'
      if (isBlack !== mirrorBlack) return false
    }
  }
  return true
}

function todayString() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function expectedSize(dateStr) {
  const d = new Date(dateStr + 'T00:00:00')
  const dow = d.getDay()
  return dow === 0 || dow === 6 ? 6 : 5
}

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2)
      out[key] = argv[i+1] && !argv[i+1].startsWith('--') ? argv[++i] : true
    }
  }
  return out
}

const puzzle = await generate()
puzzle.date = date
puzzle.size = size
writeFileSync(outPath, JSON.stringify(puzzle, null, 2))
console.log(`Written: ${outPath}`)
