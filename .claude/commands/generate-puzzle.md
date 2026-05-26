---
description: Generate one or more Wee-Word crossword puzzles and write them to public/puzzles/
allowed-tools: Write, Read, Bash
---

Generate Wee-Word crossword puzzle JSON files.

Arguments: $ARGUMENTS

## Parse arguments

Extract from `$ARGUMENTS`:
- `--date YYYY-MM-DD` — single target date (default: today from `date +%F`)
- `--from YYYY-MM-DD` — start of a date range (inclusive)
- `--to YYYY-MM-DD` — end of a date range (inclusive); requires `--from`
- `--theme "..."` — optional theme hint (applied to all puzzles in a range)
- `--size N` — override grid size to `5` or `6` for all dates (default: auto-detect per date)
- `--force` — overwrite files that already exist

**Determine the list of dates to generate:**

- If `--from` and `--to` are both provided: expand the full inclusive range. Use this shell command to enumerate the dates:
  ```bash
  node -e "
  const from = new Date('$FROM'); const to = new Date('$TO');
  for (let d = new Date(from); d <= to; d.setDate(d.getDate()+1))
    console.log(d.toISOString().slice(0,10));
  "
  ```
- If only `--date` is provided (or no date flags): the list is just that one date.
- If only `--from` is provided without `--to`: treat it as a single date (same as `--date`).

For each date in the list, check whether `public/puzzles/<date>.json` already exists. Skip any that exist unless `--force` was passed, and note which were skipped.

If the list is more than one date, announce the full list before starting so the user knows what's coming.

## Per-date: determine size

For each date, determine grid size:
- If `--size` was provided, use it for all dates.
- Otherwise: Saturday or Sunday → `6`, all other days → `5`.

## Per-date: generate the puzzle

Create a valid crossword puzzle for each date. Vary the grids — don't reuse the same layout across consecutive dates.

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

**If a theme was provided**, let it inspire the answers and clues across the batch.

## Per-date: validate before writing

Before writing each file, verify:
1. Grid is exactly `size` rows × `size` columns
2. Rotational symmetry holds for every black square
3. Every word in the grid is ≥ 3 letters
4. Across clue numbers match cells that start across words; same for down
5. No clue number appears twice in the same direction

Fix any issues before writing.

## Per-date: output format

Write each file to `public/puzzles/<date>.json` **without** a `gridHash` field — the hash is added in the final step:

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

## Stamp grid hashes

After all files are written, run once:

```bash
node scripts/stamp-hashes.js
```

This adds a `gridHash` field to every puzzle. The app uses this hash to detect when a live puzzle has changed and discard stale saved progress.

## Confirm

Print a summary table: date | size | gridHash | status (written / skipped). For single-puzzle runs, print the grid for a quick visual check.
