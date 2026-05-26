<script>
  let { seconds = 0 } = $props()

  function format(s) {
    const m = Math.floor(s / 60)
    const sec = s % 60
    return `${m}:${String(sec).padStart(2, '0')}`
  }
</script>

<time class="timer" datetime={`PT${seconds}S`}>{format(seconds)}</time>

<style>
  .timer {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    font-size: 1.1rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    color: #333;
    font-variant-numeric: tabular-nums;
  }
</style>
