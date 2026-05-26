<script>
  import { game } from '../stores/game.js'
  import { getWordCells } from '../lib/gridUtils.js'

  function isActiveClue(number, direction) {
    if ($game.selectedRow === null) return false
    const cells = getWordCells($game.puzzle.grid, $game.selectedRow, $game.selectedCol, $game.direction)
    const word = $game.words.find(w => w.number === number && w.direction === direction)
    if (!word) return false
    return cells.some(c => c.row === word.startRow && c.col === word.startCol) &&
      direction === $game.direction
  }

  function isWordComplete(number, direction) {
    const word = $game.words.find(w => w.number === number && w.direction === direction)
    if (!word) return false
    const cells = getWordCells($game.puzzle.grid, word.startRow, word.startCol, direction)
    return cells.every(c => !!$game.userGrid[c.row]?.[c.col])
  }
</script>

<div class="clue-panel">
  <div class="clue-section">
    <h3>Across</h3>
    <ul>
      {#each $game.puzzle?.clues.across ?? [] as clue}
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
        <li
          class:active={isActiveClue(clue.number, 'across')}
          class:complete={isWordComplete(clue.number, 'across')}
          onclick={() => game.jumpToWord(clue.number, 'across')}
        >
          <span class="clue-num">{clue.number}</span>
          <span class="clue-text">{clue.clue}</span>
        </li>
      {/each}
    </ul>
  </div>

  <div class="clue-section">
    <h3>Down</h3>
    <ul>
      {#each $game.puzzle?.clues.down ?? [] as clue}
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_noninteractive_element_interactions -->
        <li
          class:active={isActiveClue(clue.number, 'down')}
          class:complete={isWordComplete(clue.number, 'down')}
          onclick={() => game.jumpToWord(clue.number, 'down')}
        >
          <span class="clue-num">{clue.number}</span>
          <span class="clue-text">{clue.clue}</span>
        </li>
      {/each}
    </ul>
  </div>
</div>

<style>
  .clue-panel {
    display: flex;
    gap: 1rem;
    width: 100%;
    max-width: 640px;
  }

  .clue-section {
    flex: 1;
    min-width: 0;
  }

  h3 {
    font-family: 'Georgia', serif;
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #555;
    border-bottom: 1.5px solid #ccc;
    padding-bottom: 0.25rem;
    margin: 0 0 0.4rem 0;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    max-height: 240px;
    overflow-y: auto;
  }

  li {
    display: flex;
    gap: 0.4rem;
    padding: 0.25rem 0.3rem;
    cursor: pointer;
    border-radius: 3px;
    font-family: 'Georgia', serif;
    font-size: 0.85rem;
    line-height: 1.35;
    color: #222;
  }

  li:hover {
    background: #f0f0f0;
  }

  li.active {
    background: #a8d0f0;
  }

  li.complete {
    color: #999;
  }

  li.complete.active {
    background: #a8d0f0;
    color: #555;
  }

  .clue-num {
    font-weight: 700;
    min-width: 1.5rem;
    color: #555;
    flex-shrink: 0;
  }

  li.active .clue-num {
    color: #222;
  }
</style>
