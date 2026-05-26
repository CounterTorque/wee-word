<script>
  import { onMount } from 'svelte'
  import { game } from './stores/game.js'
  import { loadPuzzle, todayString, dateFromUrl } from './lib/puzzleLoader.js'
  import { loadProgress } from './lib/storage.js'
  import { computeGridHash } from './lib/gridUtils.js'
  import Grid from './components/Grid.svelte'
  import CluePanel from './components/CluePanel.svelte'
  import ActiveClue from './components/ActiveClue.svelte'
  import Timer from './components/Timer.svelte'
  import Toolbar from './components/Toolbar.svelte'
  import CompletionModal from './components/CompletionModal.svelte'

  let loadError = $state(null)
  let loading = $state(true)

  onMount(async () => {
    const date = dateFromUrl() ?? todayString()
    try {
      const puzzle = await loadPuzzle(date)
      const saved = loadProgress(date, computeGridHash(puzzle.grid))
      game.loadPuzzle(puzzle, saved)
    } catch (err) {
      loadError = err.message
    } finally {
      loading = false
    }
  })

  let showModal = $derived($game.isComplete && !!$game.puzzle)
  let hasReveals = $derived(Object.keys($game.revealedCells).length > 0)
</script>

<main>
  <header>
    <div class="header-left">
      <h1>Wee-Word</h1>
      {#if $game.puzzle}
        <span class="date-label">{$game.puzzle.date} · {$game.size}×{$game.size}</span>
      {/if}
    </div>
    <div class="header-right">
      {#if $game.puzzle}
        <Timer seconds={$game.timerSeconds} />
      {/if}
    </div>
  </header>

  <div class="game-area">
    {#if loading}
      <p class="status">Loading today's puzzle…</p>
    {:else if loadError}
      <p class="status error">No puzzle today: {loadError}</p>
    {:else if $game.puzzle}
      <div class="center-col">
        <div class="toolbar-row">
          <Toolbar />
        </div>
        <ActiveClue />
        <Grid />
        <CluePanel />
      </div>
    {/if}
  </div>

  <footer>v{__APP_VERSION__}</footer>

  {#if showModal}
    <CompletionModal
      seconds={$game.timerSeconds}
      streak={$game.streak}
      revealed={hasReveals}
    />
  {/if}
</main>

<style>
  :global(*, *::before, *::after) {
    box-sizing: border-box;
  }

  :global(body) {
    margin: 0;
    background: #fff;
    color: #111;
  }

  main {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }

  header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.6rem 1rem;
    border-bottom: 2px solid #111;
  }

  .header-left {
    display: flex;
    align-items: baseline;
    gap: 0.6rem;
  }

  h1 {
    font-family: 'Georgia', serif;
    font-size: 1.4rem;
    font-weight: 700;
    margin: 0;
    color: #111;
    letter-spacing: -0.01em;
  }

  .date-label {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 0.75rem;
    color: #888;
    font-weight: 400;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .game-area {
    flex: 1;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 1rem;
  }

  .center-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    max-width: 640px;
  }

  .toolbar-row {
    display: flex;
    justify-content: flex-end;
    width: min(90vw, 420px);
  }

  .status {
    font-family: 'Georgia', serif;
    font-size: 1rem;
    color: #555;
  }

  .status.error {
    color: #c0392b;
  }

  footer {
    text-align: center;
    padding: 0.5rem;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 0.7rem;
    color: #bbb;
  }
</style>
