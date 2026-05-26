<script>
  import { game } from '../stores/game.js'

  let checkOpen = $state(false)
  let revealOpen = $state(false)

  function closeAll() {
    checkOpen = false
    revealOpen = false
  }

  function handleClickOutside(e) {
    if (!e.target.closest('.toolbar')) closeAll()
  }
</script>

<svelte:window onclick={handleClickOutside} />

<div class="toolbar">
  <div class="dropdown-group">
    <button
      class="toolbar-btn"
      class:open={checkOpen}
      onclick={(e) => { e.stopPropagation(); revealOpen = false; checkOpen = !checkOpen }}
      aria-haspopup="true"
      aria-expanded={checkOpen}
    >
      Check ▾
    </button>
    {#if checkOpen}
      <ul class="dropdown" role="menu">
        <li role="none"><button role="menuitem" onclick={() => { game.checkLetter(); closeAll() }}>Letter</button></li>
        <li role="none"><button role="menuitem" onclick={() => { game.checkWord(); closeAll() }}>Word</button></li>
        <li role="none"><button role="menuitem" onclick={() => { game.checkPuzzle(); closeAll() }}>Puzzle</button></li>
      </ul>
    {/if}
  </div>

  <div class="dropdown-group">
    <button
      class="toolbar-btn"
      class:open={revealOpen}
      onclick={(e) => { e.stopPropagation(); checkOpen = false; revealOpen = !revealOpen }}
      aria-haspopup="true"
      aria-expanded={revealOpen}
    >
      Reveal ▾
    </button>
    {#if revealOpen}
      <ul class="dropdown" role="menu">
        <li role="none"><button role="menuitem" onclick={() => { game.revealLetter(); closeAll() }}>Letter</button></li>
        <li role="none"><button role="menuitem" onclick={() => { game.revealWord(); closeAll() }}>Word</button></li>
        <li role="none"><button role="menuitem" onclick={() => { game.revealPuzzle(); closeAll() }}>Puzzle</button></li>
      </ul>
    {/if}
  </div>
</div>

<style>
  .toolbar {
    display: flex;
    gap: 0.5rem;
    position: relative;
  }

  .dropdown-group {
    position: relative;
  }

  .toolbar-btn {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 0.8rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    padding: 0.35rem 0.75rem;
    border: 1.5px solid #333;
    background: #fff;
    cursor: pointer;
    border-radius: 3px;
    color: #333;
    transition: background 0.1s;
  }

  .toolbar-btn:hover,
  .toolbar-btn.open {
    background: #111;
    color: #fff;
    border-color: #111;
  }

  .dropdown {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    background: #fff;
    border: 1.5px solid #333;
    border-radius: 3px;
    list-style: none;
    margin: 0;
    padding: 0.25rem 0;
    min-width: 100px;
    z-index: 10;
    box-shadow: 0 2px 8px rgba(0,0,0,0.12);
  }

  .dropdown li {
    padding: 0;
  }

  .dropdown button[role="menuitem"] {
    display: block;
    width: 100%;
    text-align: left;
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 0.82rem;
    font-weight: 500;
    padding: 0.4rem 0.9rem;
    cursor: pointer;
    color: #222;
    background: none;
    border: none;
  }

  .dropdown button[role="menuitem"]:hover {
    background: #f0f0f0;
  }
</style>
