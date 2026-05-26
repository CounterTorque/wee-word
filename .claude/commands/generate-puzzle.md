---
description: Generate a Wee-Word crossword puzzle and write it to public/puzzles/YYYY-MM-DD.json
allowed-tools: Write, Read, Bash
---

Generate a Wee-Word crossword puzzle JSON file.

Arguments: $ARGUMENTS

## Parse arguments

Extract from `$ARGUMENTS`:
- `--date YYYY-MM-DD` — target date (default: today's date from `date +%F`)
- `--theme "..."` — optional theme hint
- `--size N` — grid size, `5` or `6` (default: auto-detect from date — Saturday/Sunday → 6, weekdays → 5)
- `--force` — overwrite if file already exists

Run `date +%F` to get today's date if `--date` is not provided.

Check whether the output file `public/puzzles/<date>.json` already exists. If it does and `--force` was not passed, stop and tell the user.

## Generate the puzzle

Create a valid crossword puzzle of the appropriate size. Rules:

**Grid rules:**
- `size × size` grid (5×5 or 6×6)
- Use `.` for black squares, uppercase single letters for white squares
- Black squares **must be rotationally symmetric** (180°): if `grid[r][c]` is black, then `grid[size-1-r][size-1-c]` must also be black
- Every word must be **at least 3 letters** long
- No isolated white cells (every white cell must be part of at least one word ≥ 3 letters)
- All words must be **real English words**

**Clue rules:**
- Every across word (a white cell that starts a run of ≥ 3 cells horizontally) needs a clue
- Every down word (a white cell that starts a run of ≥ 3 cells vertically) needs a clue
- Cell numbering: scan left-to-right, top-to-bottom; number a cell if it starts an across word, a down word, or both. Numbers are sequential starting at 1
- Clues should be concise and clever — avoid overly obscure references

**If a theme was provided**, let it inspire the answers and clues.

## Validate before writing

Before writing the file, verify:
1. Grid is exactly `size` rows × `size` columns
2. Rotational symmetry holds for every black square
3. Every word in the grid is ≥ 3 letters
4. Across clue numbers match cells that start across words; same for down
5. No clue number appears twice in the same direction

If validation fails, fix the grid/clues and re-check before writing.

## Output format

Write the file to `public/puzzles/<date>.json` with this exact shape:

```json
{
  "date": "YYYY-MM-DD",
  "size": 5,
  "grid": [
    ["L", "E", "A", "P", "S"],
    ["A", ".", "R", ".", "T"],
    ["C", "R", "A", "N", "E"],
    ["E", ".", "B", ".", "A"],
    ["S", "T", "L", "E", "R"]
  ],
  "clues": {
    "across": [
      { "number": 1, "clue": "Jumps over" },
      { "number": 5, "clue": "Long-legged wading bird" },
      { "number": 8, "clue": "Antler owner" }
    ],
    "down": [
      { "number": 1, "clue": "Untied shoes" },
      { "number": 2, "clue": "Canvas support" },
      { "number": 3, "clue": "Tangle up" },
      { "number": 4, "clue": "Tea vessel" },
      { "number": 6, "clue": "Plod along" }
    ]
  }
}
```

After writing, confirm the file path and print the grid so the user can do a quick visual check.
