<script>
export let active = false;
</script>
<style lang="text/postcss">
@import 'hamburgers.css';
.hamburger-inner,
.hamburger-inner::before,
.hamburger-inner::after{
  background-color: var(--sec-color);
}
.hamburger.is-active .hamburger-inner::before,
.hamburger.is-active .hamburger-inner::after{
  background-color: var(--accent-color);
  box-shadow: 0px 0px 1px var(--accent-glow);
}
</style>

<button class:is-active={active} class="w-full hamburger focus:outline-none hamburger--emphatic" type="button" on:click={e=>active = !active}>
  <span class="hamburger-box">
    <span class="hamburger-inner"></span>
  </span>
</button>
