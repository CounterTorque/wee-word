<script>
  import { game } from '../stores/game.js'
  import { getWordBounds } from '../lib/gridUtils.js'

  let activeClue = $derived.by(() => {
    const s = $game
    if (!s.puzzle || s.selectedRow === null) return null
    const bounds = getWordBounds(s.puzzle.grid, s.selectedRow, s.selectedCol, s.direction)
    if (!bounds) return null
    const num = s.numbers[bounds.startRow][bounds.startCol]
    const clues = s.direction === 'across' ? s.puzzle.clues.across : s.puzzle.clues.down
    const entry = clues.find(c => c.number === num)
    if (!entry) return null
    return { number: num, direction: s.direction, text: entry.clue }
  })
</script>

<div class="active-clue" aria-live="polite">
  {#if activeClue}
    <span class="num">{activeClue.number}{activeClue.direction === 'across' ? 'A' : 'D'}</span>
    <span class="text">{activeClue.text}</span>
  {/if}
</div>

<style>
  .active-clue {
    font-family: 'Georgia', serif;
    font-size: 1rem;
    line-height: 1.4;
    color: #111;
    min-height: 2.8rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: min(90vw, 420px);
    padding: 0.3rem 0;
    border-bottom: 1.5px solid #ddd;
  }

  .num {
    font-weight: 700;
    font-size: 0.8rem;
    color: #555;
    flex-shrink: 0;
  }

  .text {
    flex: 1;
  }
</style>
