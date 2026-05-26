<script>
  import { game } from '../stores/game.js'
  import Cell from './Cell.svelte'
  import { getWordCells, isBlack } from '../lib/gridUtils.js'

  let { onKeydown = null } = $props()

  let gridEl = $state(null)

  $effect(() => {
    if (gridEl) gridEl.focus()
  })

  function handleKeydown(e) {
    if ($game.isComplete) return

    const key = e.key

    if (key === 'ArrowLeft')  { e.preventDefault(); game.moveSelection(0, -1) }
    else if (key === 'ArrowRight') { e.preventDefault(); game.moveSelection(0, 1) }
    else if (key === 'ArrowUp')    { e.preventDefault(); game.moveSelection(-1, 0) }
    else if (key === 'ArrowDown')  { e.preventDefault(); game.moveSelection(1, 0) }
    else if (key === 'Tab') {
      e.preventDefault()
      game.jumpToNextWord()
    }
    else if (key === 'Backspace' || key === 'Delete') {
      e.preventDefault()
      game.deleteLetter()
    }
    else if (/^[a-zA-Z]$/.test(key)) {
      e.preventDefault()
      game.enterLetter(key)
    }
  }

  function isSelectedCell(r, c) {
    return $game.selectedRow === r && $game.selectedCol === c
  }

  function isInCurrentWord(r, c) {
    if ($game.selectedRow === null) return false
    if (isBlack($game.puzzle.grid, r, c)) return false
    const cells = getWordCells($game.puzzle.grid, $game.selectedRow, $game.selectedCol, $game.direction)
    return cells.some(cell => cell.row === r && cell.col === c)
  }
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div
  class="grid-wrapper"
  style="--size: {$game.size}"
  bind:this={gridEl}
  tabindex="0"
  onkeydown={handleKeydown}
  role="grid"
  aria-label="Crossword grid"
>
  {#if $game.puzzle}
    {#each $game.puzzle.grid as row, r}
      {#each row as _cell, c}
        <Cell
          letter={$game.userGrid[r]?.[c] ?? ''}
          number={$game.numbers[r]?.[c]}
          isSelected={isSelectedCell(r, c)}
          isInWord={isInCurrentWord(r, c)}
          isBlack={isBlack($game.puzzle.grid, r, c)}
          isWrong={!!$game.checkedCells[`${r},${c}`]}
          isRevealed={!!$game.revealedCells[`${r},${c}`]}
          onclick={() => game.selectCell(r, c)}
        />
      {/each}
    {/each}
  {/if}
</div>

<style>
  .grid-wrapper {
    display: grid;
    grid-template-columns: repeat(var(--size), 1fr);
    grid-template-rows: repeat(var(--size), 1fr);
    width: min(90vw, 420px);
    aspect-ratio: 1;
    border: 2.5px solid #000;
    outline: none;
    box-sizing: border-box;
  }
</style>
