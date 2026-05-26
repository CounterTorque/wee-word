# Wee-Word

A free daily mini crossword puzzle, inspired by the NYT Mini. Hosted on GitHub Pages.

- **Weekdays**: 5×5 grid
- **Weekends**: 6×6 grid
- Progress auto-saves in your browser; no account required
- Streak tracking via `localStorage`

## Play

`https://<your-username>.github.io/wee-word/`

## Development

```bash
npm install
npm run dev
```

## Adding puzzles

Puzzles are static JSON files in `/public/puzzles/YYYY-MM-DD.json`.

### Generate with AI (Claude Code skill)

Open this project in Claude Code or Claude Desktop and run:

```
/generate-puzzle --date 2026-06-02 --theme "ocean life"
```

No API key needed — Claude generates the puzzle directly.

| Flag | Default | Description |
|---|---|---|
| `--date` | today | Target date `YYYY-MM-DD` |
| `--theme` | *(none)* | Optional theme hint |
| `--size` | auto | `5` or `6` (auto-detected from weekday/weekend) |
| `--force` | false | Overwrite an existing puzzle file |

### Puzzle JSON format

```json
{
  "date": "2026-06-02",
  "size": 5,
  "grid": [
    ["W", "O", "R", "D", "S"],
    [".", "N", ".", "E", "."],
    ["P", "E", "N", "A", "L"],
    [".", ".", ".", "R", "."],
    ["S", "T", "A", "R", "S"]
  ],
  "clues": {
    "across": [{ "number": 1, "clue": "Vocabulary units" }],
    "down":   [{ "number": 1, "clue": "..." }]
  }
}
```

- `"."` = black square  
- Grid must be `size × size`  
- Black squares must be rotationally symmetric (180°)  
- All words must be ≥ 3 letters

## Tests

```bash
npm test
```

## Deployment

Push to `main`. GitHub Actions builds and deploys to GitHub Pages automatically.

Enable GitHub Pages in repo **Settings → Pages → Source: GitHub Actions**.
