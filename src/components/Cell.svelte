<script>
  let {
    letter = '',
    number = null,
    isSelected = false,
    isInWord = false,
    isBlack = false,
    isWrong = false,
    isRevealed = false,
    onclick = () => {},
  } = $props()
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<div
  class="cell"
  role="gridcell"
  tabindex="-1"
  class:black={isBlack}
  class:selected={isSelected}
  class:in-word={isInWord && !isSelected}
  class:wrong={isWrong}
  class:revealed={isRevealed}
  onclick={onclick}
>
  {#if !isBlack}
    {#if number}
      <span class="cell-number">{number}</span>
    {/if}
    <span class="cell-letter">{letter}</span>
  {/if}
</div>

<style>
  .cell {
    position: relative;
    width: 100%;
    aspect-ratio: 1;
    border: 1.5px solid #000;
    background: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    user-select: none;
    box-sizing: border-box;
  }

  .cell.black {
    background: #111;
    cursor: default;
    border-color: #111;
  }

  .cell.selected {
    background: #4f91d6;
  }

  .cell.in-word {
    background: #a8d0f0;
  }

  .cell.wrong {
    background: #f7c5c5;
  }

  .cell.revealed {
    background: #d4edff;
  }

  .cell.selected.revealed {
    background: #4f91d6;
  }

  .cell-number {
    position: absolute;
    top: 2px;
    left: 3px;
    font-size: clamp(7px, 1.5vw, 11px);
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-weight: 600;
    line-height: 1;
    color: #111;
    pointer-events: none;
  }

  .cell-letter {
    font-size: clamp(14px, 3.5vw, 26px);
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-weight: 700;
    color: #111;
    text-transform: uppercase;
    pointer-events: none;
  }

  .cell.selected .cell-letter,
  .cell.selected .cell-number {
    color: #000;
  }
</style>
