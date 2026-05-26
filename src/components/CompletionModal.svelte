<script>
  import { game } from '../stores/game.js'

  let { seconds = 0, streak = null, revealed = false } = $props()

  function format(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }
</script>

<div class="backdrop" role="dialog" aria-modal="true" aria-label="Puzzle complete">
  <div class="modal">
    <div class="icon">{revealed ? '📖' : '🎉'}</div>
    <h2>{revealed ? 'Puzzle Revealed' : 'Puzzle Complete!'}</h2>

    {#if !revealed}
      <p class="time-label">Solved in</p>
      <p class="time">{format(seconds)}</p>
    {/if}

    {#if streak && !revealed}
      <div class="streak">
        <span class="streak-count">{streak.count}</span>
        <span class="streak-label">{streak.count === 1 ? 'day streak' : 'day streak'}</span>
        {#if streak.count > 1}
          <span class="best">(best: {streak.bestStreak})</span>
        {/if}
      </div>
    {/if}

    <button class="close-btn" onclick={() => game.reset()}>Play Again</button>
  </div>
</div>

<style>
  .backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
  }

  .modal {
    background: #fff;
    border: 2px solid #111;
    border-radius: 6px;
    padding: 2rem 2.5rem;
    text-align: center;
    max-width: 320px;
    width: 90vw;
    box-shadow: 0 4px 24px rgba(0,0,0,0.18);
  }

  .icon {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  h2 {
    font-family: 'Georgia', serif;
    font-size: 1.4rem;
    margin: 0 0 1rem 0;
    color: #111;
  }

  .time-label {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #777;
    margin: 0;
  }

  .time {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 2rem;
    font-weight: 700;
    margin: 0.2rem 0 1rem 0;
    color: #111;
  }

  .streak {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 0.95rem;
    margin-bottom: 1.25rem;
    color: #444;
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.3rem;
  }

  .streak-count {
    font-size: 1.6rem;
    font-weight: 700;
    color: #111;
  }

  .best {
    font-size: 0.8rem;
    color: #888;
  }

  .close-btn {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 0.85rem;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.6rem 1.5rem;
    background: #111;
    color: #fff;
    border: none;
    border-radius: 3px;
    cursor: pointer;
  }

  .close-btn:hover {
    background: #333;
  }
</style>
