<script>
export let active = false;
</script>
<style lang="text/postcss">
@import 'hamburgers.css';
.hamburger-inner,
.hamburger-inner::before,
.hamburger-inner::after{
  background-color: var(--accent-color);
}
.hamburger.is-active .hamburger-inner::before,
.hamburger.is-active .hamburger-inner::after{
  background-color: var(--accent2-color);
  box-shadow: 0px 0px 1px var(--accent2-glow);
}
</style>

<button aria-label="menu" class:is-active={active} class="w-full hamburger focus:outline-none hamburger--emphatic" type="button" on:click={e=>active = !active}>
  <span class="hamburger-box">
    <span class="hamburger-inner"></span>
  </span>
</button>
